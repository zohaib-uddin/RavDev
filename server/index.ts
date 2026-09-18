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
    
    const categories = await sql(query);
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
      SET name = ${name}, slug = ${slug}, description = ${description}, 
          price = ${price}, main_category_id = ${main_category_id}, 
          sub_category_id = ${sub_category_id}, is_featured = ${is_featured},
          updated_at = NOW()
    `;
    
    if (req.file) {
      updateQuery += `, thumbnail_image = ${`/uploads/${req.file.filename}`}`;
    }
    
    updateQuery += ` WHERE id = ${id} RETURNING *`;
    
    const result = await sql(updateQuery);
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
