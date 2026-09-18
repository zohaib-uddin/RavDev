import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database connection
const sql = neon(process.env.DATABASE_URL!);

// File upload configuration
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// ==================== CATEGORIES API ====================

// GET /api/admin/categories - Get all categories with optional filter
app.get('/api/admin/categories', async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = 'SELECT * FROM categories';
    if (type === 'main') {
      query += ' WHERE is_main_category = true';
    } else if (type === 'sub') {
      query += ' WHERE is_main_category = false';
    }
    query += ' ORDER BY display_order ASC';
    
    const categories = await sql.query(query);
    res.json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/sub-categories - Create sub-category
app.post('/api/admin/sub-categories', upload.single('thumbnail'), async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    const thumbnail_image = req.file ? `/uploads/${req.file.filename}` : null;
    
    const result = await sql`
      INSERT INTO categories (name, slug, description, thumbnail_image, is_main_category, parent_id)
      VALUES (${name}, ${slug}, ${description}, ${thumbnail_image}, false, NULL)
      RETURNING *
    `;
    
    res.json(result[0]);
  } catch (error: any) {
    console.error('Error creating sub-category:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/main-categories - Create main category with sub-categories
app.post('/api/admin/main-categories', upload.single('banner'), async (req, res) => {
  try {
    const { name, slug, description, sub_category_ids } = req.body;
    const banner_image = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Create main category
    const result = await sql`
      INSERT INTO categories (name, slug, description, banner_image, is_main_category, parent_id)
      VALUES (${name}, ${slug}, ${description}, ${banner_image}, true, NULL)
      RETURNING *
    `;
    
    const mainCategory = result[0];
    
    // Update sub-categories with parent_id
    if (sub_category_ids && Array.isArray(sub_category_ids)) {
      for (const subId of sub_category_ids) {
        await sql`
          UPDATE categories 
          SET parent_id = ${mainCategory.id}
          WHERE id = ${subId}
        `;
      }
    }
    
    res.json(mainCategory);
  } catch (error: any) {
    console.error('Error creating main category:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== MEGA MENU API ====================

// GET /api/mega-menu/:mainCategorySlug - Get mega menu data
app.get('/api/mega-menu/:mainCategorySlug', async (req, res) => {
  try {
    const { mainCategorySlug } = req.params;
    
    // Get main category
    const mainCategory = await sql`
      SELECT * FROM categories 
      WHERE slug = ${mainCategorySlug} AND is_main_category = true
    `;
    
    if (mainCategory.length === 0) {
      return res.status(404).json({ error: 'Main category not found' });
    }
    
    // Get sub-categories with product counts
    const subCategories = await sql`
      SELECT 
        c.*,
        COUNT(p.id) as actual_product_count
      FROM categories c
      LEFT JOIN products p ON p.sub_category_id = c.id
      WHERE c.parent_id = ${mainCategory[0].id}
      GROUP BY c.id
      ORDER BY c.display_order ASC
    `;
    
    // Get featured products for each sub-category
    const subCategoriesWithProducts = await Promise.all(
      subCategories.map(async (subCat: any) => {
        const featuredProducts = await sql`
          SELECT id, name, slug, price, thumbnail_image
          FROM products
          WHERE sub_category_id = ${subCat.id} AND is_featured = true
          ORDER BY display_order ASC
          LIMIT 6
        `;
        
        return {
          ...subCat,
          product_count: subCat.actual_product_count || subCat.product_count,
          products: featuredProducts
        };
      })
    );
    
    res.json({
      main_category: mainCategory[0],
      sub_categories: subCategoriesWithProducts
    });
  } catch (error: any) {
    console.error('Error fetching mega menu:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== PRODUCTS API ====================

// GET /api/products - Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await sql`
      SELECT p.*, 
             mc.name as main_category_name,
             sc.name as sub_category_name
      FROM products p
      LEFT JOIN categories mc ON p.main_category_id = mc.id
      LEFT JOIN categories sc ON p.sub_category_id = sc.id
      ORDER BY p.display_order ASC
    `;
    res.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products - Create product
app.post('/api/products', upload.single('thumbnail'), async (req, res) => {
  try {
    const { name, slug, description, price, main_category_id, sub_category_id, is_featured } = req.body;
    const thumbnail_image = req.file ? `/uploads/${req.file.filename}` : null;
    
    const result = await sql`
      INSERT INTO products (name, slug, description, price, thumbnail_image, main_category_id, sub_category_id, is_featured)
      VALUES (${name}, ${slug}, ${description}, ${price}, ${thumbnail_image}, ${main_category_id}, ${sub_category_id}, ${is_featured || false})
      RETURNING *
    `;
    
    // Update product_count for sub-category
    await sql`
      UPDATE categories 
      SET product_count = product_count + 1
      WHERE id = ${sub_category_id}
    `;
    
    res.json(result[0]);
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/products/:id - Update product
app.put('/api/products/:id', upload.single('thumbnail'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, price, main_category_id, sub_category_id, is_featured } = req.body;
    
    let updateQuery = `
      UPDATE products 
      SET name = $1, slug = $2, description = $3, 
          price = $4, main_category_id = $5, 
          sub_category_id = $6, is_featured = $7,
          updated_at = NOW()
    `;
    
    const params: any[] = [name, slug, description, price, main_category_id, sub_category_id, is_featured];
    
    if (req.file) {
      updateQuery += `, thumbnail_image = $${params.length + 1}`;
      params.push(`/uploads/${req.file.filename}`);
    }
    
    updateQuery += ` WHERE id = $${params.length + 1} RETURNING *`;
    params.push(id);
    
    const result = await sql.query(updateQuery, params);
    res.json(result[0]);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get product first to get sub_category_id
    const product = await sql`SELECT sub_category_id FROM products WHERE id = ${id}`;
    
    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete product
    await sql`DELETE FROM products WHERE id = ${id}`;
    
    // Update product_count for sub-category
    await sql`
      UPDATE categories 
      SET product_count = product_count - 1
      WHERE id = ${product[0].sub_category_id}
    `;
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== COLLECTIONS API ====================

// GET /api/collections/:mainCategorySlug - Get all products for a main category
app.get('/api/collections/:mainCategorySlug', async (req, res) => {
  try {
    const { mainCategorySlug } = req.params;
    
    // Get main category
    const mainCategory = await sql`
      SELECT * FROM categories WHERE slug = ${mainCategorySlug} AND is_main_category = true
    `;
    
    if (mainCategory.length === 0) {
      return res.status(404).json({ error: 'Main category not found' });
    }
    
    // Get all sub-categories
    const subCategories = await sql`
      SELECT id FROM categories WHERE parent_id = ${mainCategory[0].id}
    `;
    
    const subCategoryIds = subCategories.map((sc: any) => sc.id);
    
    // Get all products for this main category
    const products = await sql`
      SELECT p.*, sc.name as sub_category_name
      FROM products p
      LEFT JOIN categories sc ON p.sub_category_id = sc.id
      WHERE p.main_category_id = ${mainCategory[0].id}
      ORDER BY p.display_order ASC
    `;
    
    res.json({
      main_category: mainCategory[0],
      products
    });
  } catch (error: any) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== COLLECTIONS IN FOCUS API ====================

// GET /api/collections-in-focus - Get featured categories for homepage section
app.get('/api/collections-in-focus', async (req, res) => {
  try {
    const categories = await sql`
      SELECT 
        id,
        name,
        slug,
        description,
        thumbnail_image as image,
        display_order_in_focus
      FROM categories 
      WHERE is_featured_in_focus = true 
        AND is_active = true
      ORDER BY display_order_in_focus ASC
      LIMIT 4
    `;
    
    res.json(categories);
  } catch (error: any) {
    console.error('Get collections in focus error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== SHOP ALL PRODUCTS API ====================

// GET /api/products/shop-all - Get all products with filters
app.get('/api/products/shop-all', async (req, res) => {
  try {
    const { sizes, colors, min_price, max_price, features, category, availability, sort } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    
    // Size filter
    if (sizes && typeof sizes === 'string') {
      const sizeArray = sizes.split(',');
      query += ` AND sizes @> $${params.length + 1}`;
      params.push(JSON.stringify(sizeArray));
    }
    
    // Color filter
    if (colors && typeof colors === 'string') {
      const colorArray = colors.split(',');
      query += ` AND colors @> $${params.length + 1}`;
      params.push(JSON.stringify(colorArray));
    }
    
    // Price range filter
    if (min_price) {
      query += ` AND actual_price >= $${params.length + 1}`;
      params.push(min_price);
    }
    if (max_price) {
      query += ` AND actual_price <= $${params.length + 1}`;
      params.push(max_price);
    }
    
    // Features filter
    if (features && typeof features === 'string') {
      const featureArray = features.split(',');
      if (featureArray.includes('new_arrivals')) {
        query += ` AND is_new_arrival = true`;
      }
      if (featureArray.includes('best_sellers')) {
        query += ` AND is_best_seller = true`;
      }
      if (featureArray.includes('on_sale')) {
        query += ` AND compare_price > actual_price`;
      }
    }
    
    // Category filter
    if (category && category !== 'all') {
      query += ` AND main_category_id IN (SELECT id FROM categories WHERE slug = $${params.length + 1})`;
      params.push(category);
    }
    
    // Availability filter
    if (availability === 'in_stock') {
      query += ` AND is_in_stock = true AND stock > 0`;
    } else if (availability === 'out_of_stock') {
      query += ` AND (is_in_stock = false OR stock = 0)`;
    }
    
    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ` ORDER BY actual_price ASC`;
        break;
      case 'price_desc':
        query += ` ORDER BY actual_price DESC`;
        break;
      case 'az':
        query += ` ORDER BY name ASC`;
        break;
      case 'za':
        query += ` ORDER BY name DESC`;
        break;
      case 'date_asc':
        query += ` ORDER BY created_at ASC`;
        break;
      case 'date_desc':
        query += ` ORDER BY created_at DESC`;
        break;
      case 'best_selling':
        query += ` ORDER BY is_best_seller DESC, created_at DESC`;
        break;
      default:
        query += ` ORDER BY is_featured DESC, created_at DESC`;
    }
    
    const products = params.length > 0 ? await sql.query(query, params) : await sql.query(query);
    
    res.json({ products, total: products.length });
  } catch (error: any) {
    console.error('Get shop all products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/filters/available - Get available filters
app.get('/api/filters/available', async (req, res) => {
  try {
    // Get all unique sizes
    const sizesResult = await sql`
      SELECT DISTINCT jsonb_array_elements_text(sizes) as size
      FROM products
      WHERE sizes IS NOT NULL AND jsonb_array_length(sizes) > 0
      ORDER BY size
    `;
    const sizes = sizesResult.map((r: any) => r.size);
    
    // Get all unique colors with counts
    const colorsResult = await sql`
      SELECT 
        jsonb_array_elements(colors)->>'name' as name,
        jsonb_array_elements(colors)->>'hex' as hex,
        COUNT(*) as count
      FROM products
      WHERE colors IS NOT NULL AND jsonb_array_length(colors) > 0
      GROUP BY name, hex
      ORDER BY count DESC
    `;
    
    // Get price range
    const priceRangeResult = await sql`
      SELECT 
        MIN(actual_price) as min,
        MAX(actual_price) as max
      FROM products
    `;
    
    // Get all categories with product counts
    const categoriesResult = await sql`
      SELECT 
        c.id,
        c.name,
        c.slug,
        COUNT(p.id) as count
      FROM categories c
      LEFT JOIN products p ON p.main_category_id = c.id
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.slug
      ORDER BY c.name
    `;
    
    res.json({
      sizes,
      colors: colorsResult,
      priceRange: {
        min: parseFloat(priceRangeResult[0]?.min || '0'),
        max: parseFloat(priceRangeResult[0]?.max || '10000')
      },
      categories: categoriesResult
    });
  } catch (error: any) {
    console.error('Get available filters error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== OTP SYSTEM ====================

// Send OTP
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, purpose = 'checkout' } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store OTP in database
    await sql`
      INSERT INTO otp_verifications (email, otp_code, purpose, expires_at)
      VALUES (${email}, ${otpCode}, ${purpose}, ${expiresAt})
    `;

    // TODO: Send email via WebScript/Nginx
    // For now, log OTP for testing
    console.log(`📧 OTP for ${email}: ${otpCode}`);

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otpCode : undefined // Only in development
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find valid OTP
    const otpRecords = await sql`
      SELECT * FROM otp_verifications
      WHERE email = ${email}
        AND otp_code = ${otp}
        AND is_used = false
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (otpRecords.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await sql`
      UPDATE otp_verifications
      SET is_used = true
      WHERE id = ${otpRecords[0].id}
    `;

    // Check if user exists, if not create account
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    let userId = existingUser[0]?.id;

    if (!userId) {
      // Auto-create user account
      const newUser = await sql`
        INSERT INTO users (email, name, is_verified)
        VALUES (${email}, ${email.split('@')[0]}, true)
        RETURNING id
      `;
      userId = newUser[0].id;
    }

    res.json({ 
      success: true, 
      message: 'OTP verified successfully',
      userId
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== ORDERS ====================

// Create Order
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Generate order number
    const orderNumber = `RVZ-${Date.now()}`;
    const trackingId = `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Find or create user
    let userId = null;
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${orderData.customer_email}
    `;
    
    if (existingUser.length > 0) {
      userId = existingUser[0].id;
    } else {
      const newUser = await sql`
        INSERT INTO users (email, name, phone, is_verified)
        VALUES (${orderData.customer_email}, ${orderData.customer_name}, ${orderData.customer_phone}, true)
        RETURNING id
      `;
      userId = newUser[0].id;
    }

    // Create order
    const newOrder = await sql`
      INSERT INTO orders (
        order_number, tracking_id, user_id,
        customer_email, customer_name, customer_phone,
        shipping_name, shipping_phone, shipping_address_line_1, shipping_address_line_2,
        shipping_city, shipping_postal_code, shipping_country,
        billing_name, billing_phone, billing_address_line_1, billing_address_line_2,
        billing_city, billing_postal_code, billing_country,
        items, subtotal, shipping_method, shipping_cost, discount, coupon_code, total,
        payment_method, payment_status, order_status, order_notes
      ) VALUES (
        ${orderNumber}, ${trackingId}, ${userId},
        ${orderData.customer_email}, ${orderData.customer_name}, ${orderData.customer_phone},
        ${orderData.shipping.name}, ${orderData.shipping.phone}, ${orderData.shipping.address_line_1},
        ${orderData.shipping.address_line_2 || null}, ${orderData.shipping.city},
        ${orderData.shipping.postal_code}, 'Pakistan',
        ${orderData.billing.name}, ${orderData.billing.phone}, ${orderData.billing.address_line_1},
        ${orderData.billing.address_line_2 || null}, ${orderData.billing.city},
        ${orderData.billing.postal_code}, 'Pakistan',
        ${JSON.stringify(orderData.items)}, ${orderData.subtotal}, ${orderData.shipping_method},
        ${orderData.shipping_cost}, ${orderData.discount}, ${orderData.coupon_code || null},
        ${orderData.total}, ${orderData.payment_method}, 'unpaid', 'pending', ${orderData.order_notes}
      )
      RETURNING *
    `;

    // Save address if requested
    if (orderData.save_address && userId) {
      await sql`
        INSERT INTO addresses (
          user_id, name, phone, address_line_1, address_line_2,
          city, postal_code, country, is_default
        ) VALUES (
          ${userId}, ${orderData.shipping.name}, ${orderData.shipping.phone},
          ${orderData.shipping.address_line_1}, ${orderData.shipping.address_line_2 || null},
          ${orderData.shipping.city}, ${orderData.shipping.postal_code}, 'Pakistan', true
        )
      `;
    }

    // TODO: Send order confirmation email via WebScript

    res.json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder[0]
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User Orders
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const orders = await sql`
      SELECT * FROM orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    res.json(orders);
  } catch (error: any) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Order by ID
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const orders = await sql`
      SELECT * FROM orders
      WHERE id = ${orderId}
    `;

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(orders[0]);
  } catch (error: any) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Order Status (Admin)
app.put('/api/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order_status, payment_status } = req.body;
    
    const updatedOrder = await sql`
      UPDATE orders
      SET 
        order_status = COALESCE(${order_status}, order_status),
        payment_status = COALESCE(${payment_status}, payment_status),
        updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING *
    `;

    // TODO: Send status update email to customer

    res.json(updatedOrder[0]);
  } catch (error: any) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== ADDRESSES ====================

// Get User Addresses
app.get('/api/addresses/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const addresses = await sql`
      SELECT * FROM addresses
      WHERE user_id = ${userId}
      ORDER BY is_default DESC, created_at DESC
    `;

    res.json(addresses);
  } catch (error: any) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save Address
app.post('/api/addresses', async (req, res) => {
  try {
    const addressData = req.body;
    
    const newAddress = await sql`
      INSERT INTO addresses (
        user_id, name, phone, address_line_1, address_line_2,
        city, postal_code, country, is_default
      ) VALUES (
        ${addressData.user_id}, ${addressData.name}, ${addressData.phone},
        ${addressData.address_line_1}, ${addressData.address_line_2 || null},
        ${addressData.city}, ${addressData.postal_code}, ${addressData.country || 'Pakistan'},
        ${addressData.is_default || false}
      )
      RETURNING *
    `;

    res.json(newAddress[0]);
  } catch (error: any) {
    console.error('Save address error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Address
app.put('/api/addresses/:addressId', async (req, res) => {
  try {
    const { addressId } = req.params;
    const addressData = req.body;
    
    const updatedAddress = await sql`
      UPDATE addresses
      SET 
        name = ${addressData.name},
        phone = ${addressData.phone},
        address_line_1 = ${addressData.address_line_1},
        address_line_2 = ${addressData.address_line_2 || null},
        city = ${addressData.city},
        postal_code = ${addressData.postal_code},
        is_default = ${addressData.is_default},
        updated_at = NOW()
      WHERE id = ${addressId}
      RETURNING *
    `;

    res.json(updatedAddress[0]);
  } catch (error: any) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Address
app.delete('/api/addresses/:addressId', async (req, res) => {
  try {
    const { addressId } = req.params;
    
    await sql`DELETE FROM addresses WHERE id = ${addressId}`;

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error: any) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== WISHLIST ====================

// Get User Wishlist
app.get('/api/wishlist/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const wishlist = await sql`
      SELECT w.*, p.name, p.slug, p.actual_price, p.thumbnail_image
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ${userId}
      ORDER BY w.created_at DESC
    `;

    res.json(wishlist);
  } catch (error: any) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add to Wishlist
app.post('/api/wishlist', async (req, res) => {
  try {
    const { user_id, product_id } = req.body;
    
    const newItem = await sql`
      INSERT INTO wishlist (user_id, product_id)
      VALUES (${user_id}, ${product_id})
      RETURNING *
    `;

    res.json(newItem[0]);
  } catch (error: any) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove from Wishlist
app.delete('/api/wishlist/:wishlistId', async (req, res) => {
  try {
    const { wishlistId } = req.params;
    
    await sql`DELETE FROM wishlist WHERE id = ${wishlistId}`;

    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error: any) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== USER SETTINGS ====================

// Get User Profile
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await sql`
      SELECT id, email, name, phone, is_verified, created_at
      FROM users
      WHERE id = ${userId}
    `;

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user[0]);
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update User Profile
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone } = req.body;
    
    const updatedUser = await sql`
      UPDATE users
      SET 
        name = COALESCE(${name}, name),
        phone = COALESCE(${phone}, phone),
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, email, name, phone, is_verified, created_at
    `;

    res.json(updatedUser[0]);
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== CITIES ====================

// Get All Cities
app.get('/api/cities', async (req, res) => {
  try {
    const cities = await sql`
      SELECT * FROM cities
      WHERE is_active = true
      ORDER BY name
    `;

    res.json(cities);
  } catch (error: any) {
    console.error('Get cities error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
