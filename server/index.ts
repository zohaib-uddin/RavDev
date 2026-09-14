import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    console.log('🏥 Health check - Testing database connection...');
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', result[0].current_time);
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      database: 'connected',
      timestamp: result[0].current_time
    });
  } catch (error: any) {
    console.error('❌ Database connection failed:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const adminOnly = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await sql`SELECT * FROM users WHERE email = ${email} AND is_active = true`;
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    
    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_verified: user.is_verified,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const users = await sql`
      INSERT INTO users (email, name, password, role, is_verified, is_active)
      VALUES (${email}, ${name}, ${password}, 'customer', false, true)
      RETURNING id, email, name, role, is_verified
    `;

    const user = users[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== PRODUCTS ROUTES ====================

app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Fetching products from database...');
    
    // Step 1: Check if products table exists and has data
    const countResult = await sql`SELECT COUNT(*) as count FROM products`;
    console.log(`📊 Total products in database: ${countResult[0].count}`);
    
    if (countResult[0].count === 0) {
      console.log('⚠️ No products found in database!');
      return res.json([]);
    }
    
    // Step 2: Fetch products with simple query
    console.log('🔍 Executing SELECT query...');
    const products = await sql`
      SELECT 
        id, name, slug, description, 
        base_price, compare_at_price, 
        is_active, category_id, 
        brand, fabric, fit, sku,
        is_new_arrival, is_bestseller, is_featured, is_best_seller,
        badge, images, image_url, attributes,
        fabric_composition, fabric_finish, graphic_print,
        garment_specs, garment_care, shipping_info,
        meta_title, meta_description, focus_keywords,
        status, is_draft, created_at, updated_at
      FROM products 
      WHERE is_active = true 
      ORDER BY created_at DESC
      LIMIT 100
    `;
    
    console.log(`✅ Raw products fetched: ${products.length}`);
    
    // Step 3: Get categories for mapping
    const categories = await sql`SELECT id, name, slug FROM categories`;
    const categoryMap = new Map(categories.map((c: any) => [c.id, c]));
    console.log(`📂 Categories loaded: ${categories.length}`);
    
    // Step 4: Transform data safely
    const transformedProducts = products.map((p: any) => {
      try {
        const category = categoryMap.get(p.category_id);
        
        // Safely parse JSON fields
        let images = [];
        try {
          images = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
        } catch (e) {
          images = [];
        }
        
        let attributes = { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black'] };
        try {
          attributes = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : (p.attributes || attributes);
        } catch (e) {
          attributes = { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black'] };
        }
        
        return {
          id: p.id,
          name: p.name || '',
          slug: p.slug || '',
          description: p.description || '',
          base_price: parseFloat(p.base_price) || 0,
          compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price) : null,
          is_active: p.is_active,
          category_id: p.category_id,
          category_slug: category?.slug || 'uncategorized',
          category_name: category?.name || 'Uncategorized',
          brand: p.brand || 'RAVENZA',
          fabric: p.fabric || null,
          fit: p.fit || null,
          sku: p.sku || null,
          is_new_arrival: p.is_new_arrival || false,
          is_bestseller: p.is_bestseller || false,
          is_featured: p.is_featured || false,
          is_best_seller: p.is_best_seller || false,
          badge: p.badge || null,
          images: images,
          image_url: p.image_url || null,
          attributes: attributes,
          fabric_composition: p.fabric_composition || null,
          fabric_finish: p.fabric_finish || null,
          graphic_print: p.graphic_print || null,
          garment_specs: p.garment_specs || null,
          garment_care: p.garment_care || null,
          shipping_info: p.shipping_info || null,
          meta_title: p.meta_title || null,
          meta_description: p.meta_description || null,
          focus_keywords: p.focus_keywords || null,
          status: p.status || 'active',
          is_draft: p.is_draft || false,
          created_at: p.created_at,
          updated_at: p.updated_at,
          // Computed fields for frontend
          price: parseFloat(p.base_price) || 0,
          salePrice: p.compare_at_price ? parseFloat(p.compare_at_price) : null,
          image: p.image_url || (images && images[0]) || '',
          sizes: attributes?.sizes || ['S', 'M', 'L', 'XL'],
          colors: attributes?.colors || ['Black'],
          stockCount: 50,
          inStock: true,
          isNew: p.is_new_arrival,
          isFeatured: p.is_featured,
          isBestseller: p.is_bestseller || p.is_best_seller,
          details: [
            p.fabric_composition,
            p.fit && `Fit: ${p.fit}`,
            p.garment_care && `Care: ${p.garment_care}`,
            'Made in Pakistan'
          ].filter(Boolean),
          material: p.fabric_composition || p.fabric || 'Premium Cotton',
          category: category?.slug || 'uncategorized'
        };
      } catch (transformError) {
        console.error('❌ Error transforming product:', p.id, transformError);
        return null;
      }
    }).filter(Boolean); // Remove any null entries
    
    console.log(`✅ Transformed products: ${transformedProducts.length}`);
    console.log('📤 Sending products to frontend...');
    
    res.json(transformedProducts);
  } catch (error: any) {
    console.error('❌ Get products error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error fetching products', 
      error: error.message,
      hint: 'Check server console for detailed error'
    });
  }
});

app.get('/api/products/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const products = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ${slug}
    `;
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/products', authenticateToken, adminOnly, async (req, res) => {
  try {
    const product = req.body;
    const result = await sql`
      INSERT INTO products (
        name, slug, description, base_price, compare_at_price, category_id,
        fabric, fit, sku, is_new_arrival, is_bestseller, is_featured, is_best_seller,
        badge, images, image_url, attributes, fabric_composition, graphic_print,
        garment_specs, status, is_active
      ) VALUES (
        ${product.name}, ${product.slug}, ${product.description}, ${product.base_price},
        ${product.compare_at_price}, ${product.category_id}, ${product.fabric}, ${product.fit},
        ${product.sku}, ${product.is_new_arrival}, ${product.is_bestseller},
        ${product.is_featured}, ${product.is_best_seller}, ${product.badge},
        ${JSON.stringify(product.images)}, ${product.image_url},
        ${JSON.stringify(product.attributes)}, ${product.fabric_composition},
        ${product.graphic_print}, ${product.garment_specs}, ${product.status}, true
      )
      RETURNING *
    `;
    
    res.json(result[0]);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/products/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const product = req.body;
    
    const result = await sql`
      UPDATE products SET
        name = ${product.name},
        slug = ${product.slug},
        description = ${product.description},
        base_price = ${product.base_price},
        compare_at_price = ${product.compare_at_price},
        category_id = ${product.category_id},
        fabric = ${product.fabric},
        fit = ${product.fit},
        sku = ${product.sku},
        is_new_arrival = ${product.is_new_arrival},
        is_bestseller = ${product.is_bestseller},
        is_featured = ${product.is_featured},
        badge = ${product.badge},
        images = ${JSON.stringify(product.images)},
        image_url = ${product.image_url},
        attributes = ${JSON.stringify(product.attributes)},
        fabric_composition = ${product.fabric_composition},
        graphic_print = ${product.graphic_print},
        garment_specs = ${product.garment_specs},
        status = ${product.status},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    res.json(result[0]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/products/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM products WHERE id = ${id}`;
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== CATEGORIES ROUTES ====================

app.get('/api/categories', async (req, res) => {
  try {
    console.log('📂 Fetching categories from database...');
    
    const categories = await sql`
      SELECT 
        id,
        name,
        slug,
        description,
        sort_order,
        is_active,
        cover_image_url,
        tag,
        created_at,
        updated_at
      FROM categories 
      WHERE is_active = true 
      ORDER BY sort_order ASC
    `;
    
    console.log(`✅ Found ${categories.length} categories`);
    res.json(categories);
  } catch (error: any) {
    console.error('❌ Get categories error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// ==================== ORDERS ROUTES ====================

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = `SELECT * FROM orders`;
    const params: any[] = [];
    
    if (user_id) {
      query += ` WHERE user_id = $1`;
      params.push(user_id);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const orders = await sql(query, params);
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const order = req.body;
    const orderNumber = `RVZ-${Date.now().toString().slice(-6)}`;
    
    const result = await sql`
      INSERT INTO orders (
        order_number, user_id, status, subtotal, shipping_cost, total,
        shipping_address, notes, discount_code, discount_amount
      ) VALUES (
        ${orderNumber}, ${order.user_id}, 'pending_verification',
        ${order.subtotal}, ${order.shipping_cost}, ${order.total},
        ${JSON.stringify(order.shipping_address)}, ${order.notes},
        ${order.discount_code}, ${order.discount_amount}
      )
      RETURNING *
    `;
    
    const newOrder = result[0];
    
    // Insert order items
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        await sql`
          INSERT INTO order_items (
            order_id, product_id, product_name, quantity, unit_price,
            total_price, sku, size, color
          ) VALUES (
            ${newOrder.id}, ${item.product_id}, ${item.product_name},
            ${item.quantity}, ${item.unit_price}, ${item.total_price},
            ${item.sku}, ${item.size}, ${item.color}
          )
        `;
      }
    }
    
    res.json(newOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/orders/:id/status', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await sql`
      UPDATE orders SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    res.json(result[0]);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== REVIEWS ROUTES ====================

app.get('/api/reviews', async (req, res) => {
  try {
    const { product_id } = req.query;
    let query = `SELECT r.*, u.name as user_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.is_approved = true`;
    const params: any[] = [];
    
    if (product_id) {
      query += ` AND r.product_id = $1`;
      params.push(product_id);
    }
    
    query += ` ORDER BY r.created_at DESC`;
    
    const reviews = await sql(query, params);
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== WISHLIST ROUTES ====================

app.get('/api/wishlist/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const wishlists = await sql`SELECT * FROM wishlists WHERE user_id = ${user_id}`;
    res.json(wishlists);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const { user_id, product_id } = req.body;
    
    const existing = await sql`
      SELECT id FROM wishlists WHERE user_id = ${user_id} AND product_id = ${product_id}
    `;
    
    if (existing.length > 0) {
      await sql`DELETE FROM wishlists WHERE id = ${existing[0].id}`;
      res.json({ action: 'removed' });
    } else {
      await sql`INSERT INTO wishlists (user_id, product_id) VALUES (${user_id}, ${product_id})`;
      res.json({ action: 'added' });
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== ADMIN STATS ====================

app.get('/api/admin/stats', authenticateToken, adminOnly, async (req, res) => {
  try {
    const totalRevenue = await sql`SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'delivered'`;
    const totalOrders = await sql`SELECT COUNT(*) as count FROM orders`;
    const totalProducts = await sql`SELECT COUNT(*) as count FROM products WHERE is_active = true`;
    const lowStock = await sql`SELECT COUNT(*) as count FROM products WHERE is_active = true`;
    
    res.json({
      totalRevenue: totalRevenue[0].total,
      totalOrders: totalOrders[0].count,
      totalProducts: totalProducts[0].count,
      lowStock: lowStock[0].count,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ravenza API Server running on http://localhost:${PORT}`);
  console.log(`📦 Database: NeonDB connected`);
});
