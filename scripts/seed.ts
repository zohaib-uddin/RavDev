import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Step 1: Create 3 sub-categories (parent_id = null)
    console.log('📦 Creating sub-categories...');
    
    const subCategories = [
      { name: 'Acid Wash Tees', slug: 'acid-wash-tees', description: 'Premium acid wash t-shirts' },
      { name: 'Graphic Tees', slug: 'graphic-tees', description: 'Bold graphic print t-shirts' },
      { name: 'Hoodies', slug: 'hoodies', description: 'Comfortable hoodies and sweatshirts' }
    ];

    const subCategoryIds: string[] = [];

    for (const subCat of subCategories) {
      const result = await sql`
        INSERT INTO categories (name, slug, description, is_main_category, parent_id, product_count)
        VALUES (${subCat.name}, ${subCat.slug}, ${subCat.description}, false, NULL, 0)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `;
      
      if (result.length > 0) {
        subCategoryIds.push(result[0].id);
        console.log(`  ✓ Created sub-category: ${subCat.name}`);
      } else {
        // Get existing ID
        const existing = await sql`SELECT id FROM categories WHERE slug = ${subCat.slug}`;
        if (existing.length > 0) {
          subCategoryIds.push(existing[0].id);
          console.log(`  ✓ Sub-category already exists: ${subCat.name}`);
        }
      }
    }

    // Step 2: Create 1 main category with banner image
    console.log('\n📦 Creating main category...');
    
    const mainCategoryResult = await sql`
      INSERT INTO categories (
        name, 
        slug, 
        description, 
        banner_image, 
        is_main_category, 
        parent_id,
        product_count
      )
      VALUES (
        'Oversize Tees',
        'oversize-tees',
        'POPULAR',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1920&h=1080&fit=crop',
        true,
        NULL,
        0
      )
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `;

    let mainCategoryId: string;
    
    if (mainCategoryResult.length > 0) {
      mainCategoryId = mainCategoryResult[0].id;
      console.log('  ✓ Created main category: Oversize Tees');
    } else {
      const existing = await sql`SELECT id FROM categories WHERE slug = 'oversize-tees'`;
      mainCategoryId = existing[0].id;
      console.log('  ✓ Main category already exists: Oversize Tees');
    }

    // Step 3: Update sub-categories with parent_id
    console.log('\n📦 Assigning sub-categories to main category...');
    
    for (const subId of subCategoryIds) {
      await sql`
        UPDATE categories 
        SET parent_id = ${mainCategoryId}
        WHERE id = ${subId}
      `;
      console.log(`  ✓ Assigned sub-category ${subId} to main category`);
    }

    // Step 4: Create 15 sample products with CORRECT column names
    console.log('\n📦 Creating sample products...');

    const sampleProducts = [
      // Acid Wash Tees products
      {
        name: 'Acid Wash Phantom Tee',
        slug: 'acid-wash-phantom-tee',
        description: 'Premium acid wash t-shirt with phantom graphic',
        actual_price: '2500',
        compare_price: '3000',
        thumbnail_image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=450&fit=crop',
        sub_category_slug: 'acid-wash-tees',
        is_featured: true,
        is_new_arrival: true,
        is_best_seller: true,
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify([{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }]),
        stock: 50,
        sku: 'RVZ-AWT-001'
      },
      {
        name: 'Acid Wash Shadow Tee',
        slug: 'acid-wash-shadow-tee',
        description: 'Dark acid wash t-shirt with shadow design',
        actual_price: '2800',
        compare_price: '3200',
        thumbnail_image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=450&fit=crop',
        sub_category_slug: 'acid-wash-tees',
        is_featured: true,
        is_new_arrival: false,
        is_best_seller: true,
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify([{ name: 'Charcoal', hex: '#36454F' }]),
        stock: 30,
        sku: 'RVZ-AWT-002'
      },
      {
        name: 'Acid Wash Vintage Tee',
        slug: 'acid-wash-vintage-tee',
        description: 'Vintage style acid wash t-shirt',
        actual_price: '2600',
        compare_price: null,
        thumbnail_image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=450&fit=crop',
        sub_category_slug: 'acid-wash-tees',
        is_featured: false,
        is_new_arrival: true,
        is_best_seller: false,
        sizes: JSON.stringify(['M', 'L', 'XL']),
        colors: JSON.stringify([{ name: 'Grey', hex: '#808080' }]),
        stock: 25,
        sku: 'RVZ-AWT-003'
      },
      {
        name: 'Acid Wash Classic Tee',
        slug: 'acid-wash-classic-tee',
        description: 'Classic acid wash t-shirt',
        actual_price: '2400',
        compare_price: '2800',
        thumbnail_image: 'https://images.unsplash.com/photo-1562157873-818bc0726f38?w=800&h=450&fit=crop',
        sub_category_slug: 'acid-wash-tees',
        is_featured: true,
        is_new_arrival: false,
        is_best_seller: false,
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', '2XL']),
        colors: JSON.stringify([{ name: 'Blue', hex: '#0000FF' }]),
        stock: 40,
        sku: 'RVZ-AWT-004'
      },
      {
        name: 'Acid Wash Premium Tee',
        slug: 'acid-wash-premium-tee',
        description: 'Premium quality acid wash t-shirt',
        actual_price: '3000',
        compare_price: null,
        thumbnail_image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=450&fit=crop',
        sub_category_slug: 'acid-wash-tees',
        is_featured: false,
        is_new_arrival: true,
        is_best_seller: true,
        sizes: JSON.stringify(['S', 'M', 'L']),
        colors: JSON.stringify([{ name: 'Black', hex: '#000000' }]),
        stock: 20,
        sku: 'RVZ-AWT-005'
      },

      // Graphic Tees products
      {
        name: 'Graphic Dragon Tee',
        slug: 'graphic-dragon-tee',
        description: 'Bold dragon graphic t-shirt',
        actual_price: '2200',
        compare_price: '2600',
        thumbnail_image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=450&fit=crop',
        sub_category_slug: 'graphic-tees',
        is_featured: true,
        is_new_arrival: true,
        is_best_seller: false,
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify([{ name: 'Red', hex: '#FF0000' }]),
        stock: 35,
        sku: 'RVZ-GT-001'
      },
      {
        name: 'Graphic Skull Tee',
        slug: 'graphic-skull-tee',
        description: 'Edgy skull graphic t-shirt',
        actual_price: '2300',
        compare_price: null,
        thumbnail_image: 'https://images.unsplash.com/photo-1562157873-818bc0726f38?w=800&h=450&fit=crop',
        sub_category_slug: 'graphic-tees',
        is_featured: true,
        is_new_arrival: false,
        is_best_seller: true,
        sizes: JSON.stringify(['M', 'L', 'XL']),
        colors: JSON.stringify([{ name: 'Black', hex: '#000000' }]),
        stock: 45,
        sku: 'RVZ-GT-002'
      },
      {
        name: 'Graphic Street Tee',
        slug: 'graphic-street-tee',
        description: 'Street style graphic t-shirt',
        actual_price: '2100',
        compare_price: '2500',
        thumbnail_image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=450&fit=crop',
        sub_category_slug: 'graphic-tees',
        is_featured: false,
        is_new_arrival: true,
        is_best_seller: false,
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify([{ name: 'White', hex: '#FFFFFF' }]),
        stock: 30,
        sku: 'RVZ-GT-003'
      },
      {
        name: 'Graphic Urban Tee',
        slug: 'graphic-urban-tee',
        description: 'Urban style graphic t-shirt',
        actual_price: '2400',
        compare_price: null,
        thumbnail_image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=450&fit=crop',
        sub_category_slug: 'graphic-tees',
        is_featured: true,
        is_new_arrival: false,
        is_best_seller: true,
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', '2XL']),
        colors: JSON.stringify([{ name: 'Grey', hex: '#808080' }]),
        stock: 50,
        sku: 'RVZ-GT-004'
      },
      {
        name: 'Graphic Art Tee',
        slug: 'graphic-art-tee',
        description: 'Artistic graphic t-shirt',
        actual_price: '2500',
        compare_price: '2900',
        thumbnail_image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=450&fit=crop',
        sub_category_slug: 'graphic-tees',
        is_featured: false,
        is_new_arrival: true,
        is_best_seller: false,
        sizes: JSON.stringify(['M', 'L', 'XL']),
        colors: JSON.stringify([{ name: 'Blue', hex: '#0000FF' }]),
        stock: 25,
        sku: 'RVZ-GT-005'
      },

      // Hoodies products
      {
        name: 'Classic Pullover Hoodie',
        slug: 'classic-pullover-hoodie',
        description: 'Comfortable classic pullover hoodie',
        actual_price: '3500',
        compare_price: '4000',
        thumbnail_image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=450&fit=crop',
        sub_category_slug: 'hoodies',
        is_featured: true,
        is_new_arrival: false,
        is_best_seller: true,
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify([{ name: 'Black', hex: '#000000' }, { name: 'Grey', hex: '#808080' }]),
        stock: 40,
        sku: 'RVZ-HD-001'
      },
      {
        name: 'Zip-Up Hoodie',
        slug: 'zip-up-hoodie',
        description: 'Stylish zip-up hoodie',
        actual_price: '3800',
        compare_price: null,
        thumbnail_image: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=450&fit=crop',
        sub_category_slug: 'hoodies',
        is_featured: true,
        is_new_arrival: true,
        is_best_seller: false,
        sizes: JSON.stringify(['M', 'L', 'XL']),
        colors: JSON.stringify([{ name: 'Navy', hex: '#000080' }]),
        stock: 30,
        sku: 'RVZ-HD-002'
      },
      {
        name: 'Oversized Hoodie',
        slug: 'oversized-hoodie',
        description: 'Trendy oversized hoodie',
        actual_price: '4000',
        compare_price: '4500',
        thumbnail_image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=450&fit=crop',
        sub_category_slug: 'hoodies',
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: true,
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', '2XL']),
        colors: JSON.stringify([{ name: 'White', hex: '#FFFFFF' }]),
        stock: 35,
        sku: 'RVZ-HD-003'
      },
      {
        name: 'Graphic Hoodie',
        slug: 'graphic-hoodie',
        description: 'Hoodie with graphic print',
        actual_price: '3600',
        compare_price: null,
        thumbnail_image: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=450&fit=crop',
        sub_category_slug: 'hoodies',
        is_featured: true,
        is_new_arrival: true,
        is_best_seller: false,
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify([{ name: 'Black', hex: '#000000' }]),
        stock: 45,
        sku: 'RVZ-HD-004'
      },
      {
        name: 'Premium Hoodie',
        slug: 'premium-hoodie',
        description: 'Premium quality hoodie',
        actual_price: '4200',
        compare_price: '4800',
        thumbnail_image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=450&fit=crop',
        sub_category_slug: 'hoodies',
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: false,
        sizes: JSON.stringify(['M', 'L', 'XL']),
        colors: JSON.stringify([{ name: 'Charcoal', hex: '#36454F' }]),
        stock: 20,
        sku: 'RVZ-HD-005'
      }
    ];

    for (const product of sampleProducts) {
      // Get sub-category ID
      const subCat = await sql`SELECT id FROM categories WHERE slug = ${product.sub_category_slug}`;
      
      if (subCat.length > 0) {
        await sql`
          INSERT INTO products (
            name, 
            slug, 
            description, 
            actual_price,
            compare_price,
            thumbnail_image, 
            main_category_id, 
            sub_category_id, 
            is_featured,
            is_new_arrival,
            is_best_seller,
            sizes,
            colors,
            stock,
            sku,
            is_in_stock
          )
          VALUES (
            ${product.name},
            ${product.slug},
            ${product.description},
            ${product.actual_price},
            ${product.compare_price},
            ${product.thumbnail_image},
            ${mainCategoryId},
            ${subCat[0].id},
            ${product.is_featured},
            ${product.is_new_arrival},
            ${product.is_best_seller},
            ${product.sizes},
            ${product.colors},
            ${product.stock},
            ${product.sku},
            ${product.stock > 0}
          )
          ON CONFLICT (slug) DO NOTHING
        `;
        console.log(`  ✓ Created product: ${product.name}`);
      }
    }

    // Step 5: Update product counts for all categories
    console.log('\n📦 Updating product counts...');
    
    await sql`
      UPDATE categories
      SET product_count = (
        SELECT COUNT(*) 
        FROM products 
        WHERE products.sub_category_id = categories.id
      )
      WHERE is_main_category = false
    `;
    
    await sql`
      UPDATE categories
      SET product_count = (
        SELECT COUNT(*) 
        FROM products 
        WHERE products.main_category_id = categories.id
      )
      WHERE is_main_category = true
    `;
    
    console.log('  ✓ Product counts updated');

    // Step 6: Create 4 categories for Collections in Focus section
    console.log('\n📦 Creating Collections in Focus categories...');
    
    const collectionsInFocus = [
      { 
        name: 'Graphic Co-Ord Sets', 
        slug: 'graphic-co-ord-sets', 
        description: 'Designed to deliver effortless coordination with premium comfort, refined silhouettes, and versatile style for every occasion.',
        image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
        display_order: 1
      },
      { 
        name: 'Acid Wash Tees', 
        slug: 'acid-wash-tees-focus', 
        description: 'Finished with authentic vintage washes, premium softness, and oversized fits that bring timeless character to every outfit.',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
        display_order: 2
      },
      { 
        name: 'Oversize Tees', 
        slug: 'oversize-tees-focus', 
        description: 'Bold, comfortable, and effortlessly stylish. Our oversize tees are perfect for making a statement.',
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop',
        display_order: 3
      },
      { 
        name: 'Trackpants', 
        slug: 'trackpants-focus', 
        description: 'Premium comfort meets street style. Relaxed fit trackpants for the ultimate urban look.',
        image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop',
        display_order: 4
      }
    ];

    for (const collection of collectionsInFocus) {
      await sql`
        INSERT INTO categories (
          name, 
          slug, 
          description, 
          thumbnail_image,
          is_featured_in_focus,
          display_order_in_focus,
          is_main_category,
          is_active,
          product_count
        )
        VALUES (
          ${collection.name},
          ${collection.slug},
          ${collection.description},
          ${collection.image},
          true,
          ${collection.display_order},
          false,
          true,
          0
        )
        ON CONFLICT (slug) DO UPDATE
        SET 
          is_featured_in_focus = true,
          display_order_in_focus = ${collection.display_order}
      `;
      console.log(`  ✓ Created collection: ${collection.name}`);
    }

    // Step 7: Create 1 more category (not featured) for testing max 4 validation
    console.log('\n📦 Creating non-featured category for testing...');
    
    await sql`
      INSERT INTO categories (
        name, 
        slug, 
        description, 
        thumbnail_image,
        is_featured_in_focus,
        display_order_in_focus,
        is_main_category,
        is_active,
        product_count
      )
      VALUES (
        'Shirts & Jackets',
        'shirts-jackets',
        'Contemporary shirts and jackets for every occasion.',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop',
        false,
        NULL,
        false,
        true,
        0
      )
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log('  ✓ Created non-featured category: Shirts & Jackets');

    // Step 8: Seed data for empty tables
    console.log('\n📦 Seeding data for empty tables...');

    // Get user ID for references
    const userResult = await sql`SELECT id FROM users LIMIT 1`;
    const userId = userResult.length > 0 ? userResult[0].id : null;

    // Get product IDs for references
    const productsResult = await sql`SELECT id FROM products LIMIT 5`;
    const productIds = productsResult.map((p: any) => p.id);

    // 8.1 Seed addresses table
    if (userId) {
      console.log('  → Seeding addresses...');
      await sql`
        INSERT INTO addresses (user_id, name, phone, address_line_1, address_line_2, city, postal_code, country, is_default)
        VALUES 
          (${userId}, 'Ahmed Khan', '03001234567', '123 Main Street, Gulberg', 'Near Park', 'Lahore', '54000', 'Pakistan', true),
          (${userId}, 'Ahmed Khan', '03001234567', '456 Office Complex, DHA', 'Floor 3', 'Karachi', '75500', 'Pakistan', false),
          (${userId}, 'Ahmed Khan', '03001234567', '789 Home Address', 'Apartment 5B', 'Islamabad', '44000', 'Pakistan', false)
      `;
      console.log('  ✓ Created 3 addresses');
    }

    // 8.2 Seed audit_logs table
    console.log('  → Seeding audit logs...');
    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, changes, ip_address, user_agent)
      VALUES 
        ('product', ${productIds[0] || 'test-id'}, 'created', 'admin@ravenza.pk', '{"action": "product_created"}', '192.168.1.1', 'Mozilla/5.0'),
        ('product', ${productIds[1] || 'test-id'}, 'updated', 'admin@ravenza.pk', '{"action": "product_updated"}', '192.168.1.1', 'Mozilla/5.0'),
        ('order', 'test-order-1', 'created', 'customer@test.com', '{"action": "order_created"}', '192.168.1.2', 'Chrome/120.0'),
        ('user', ${userId || 'test-id'}, 'login', 'user@test.com', '{"action": "user_login"}', '192.168.1.3', 'Firefox/121.0'),
        ('category', 'test-cat-1', 'updated', 'admin@ravenza.pk', '{"action": "category_updated"}', '192.168.1.1', 'Mozilla/5.0')
    `;
    console.log('  ✓ Created 5 audit logs');

    // 8.3 Seed collection_products table
    if (productIds.length >= 2) {
      console.log('  → Seeding collection products...');
      // Get collection IDs
      const collectionsResult = await sql`SELECT id FROM categories WHERE is_featured_in_focus = true LIMIT 2`;
      const collectionIds = collectionsResult.map((c: any) => c.id);
      
      if (collectionIds.length >= 2) {
        await sql`
          INSERT INTO collection_products (collection_id, product_id, sort_order, is_active)
          VALUES 
            (${collectionIds[0]}, ${productIds[0]}, 1, true),
            (${collectionIds[0]}, ${productIds[1]}, 2, true),
            (${collectionIds[1]}, ${productIds[2] || productIds[0]}, 1, true),
            (${collectionIds[1]}, ${productIds[3] || productIds[1]}, 2, true)
        `;
        console.log('  ✓ Created 4 collection-product relationships');
      }
    }

    // 8.4 Seed orders and order_items tables
    if (userId && productIds.length >= 2) {
      console.log('  → Seeding orders...');
      
      // Create order items JSON separately to avoid interpolation issues
      const orderItems1 = JSON.stringify([
        { product_id: productIds[0], quantity: 2, price: 2500 }
      ]);
      
      const orderResult = await sql`
        INSERT INTO orders (
          order_number, tracking_id, user_id, customer_email, customer_name, customer_phone,
          shipping_name, shipping_phone, shipping_address_line_1, shipping_city, shipping_postal_code, shipping_country,
          billing_name, billing_phone, billing_address_line_1, billing_city, billing_postal_code, billing_country,
          items, subtotal, shipping_method, shipping_cost, discount, payment_method, payment_status, order_status, order_notes
        )
        VALUES (
          'ORD-2024-001', 'TRK-ABC123', ${userId}, 'ahmed@test.com', 'Ahmed Khan', '03001234567',
          'Ahmed Khan', '03001234567', '123 Main Street', 'Lahore', '54000', 'Pakistan',
          'Ahmed Khan', '03001234567', '123 Main Street', 'Lahore', '54000', 'Pakistan',
          ${orderItems1}::jsonb,
          5000, 'standard', 200, 0, 'cod', 'paid', 'delivered', 'Please deliver in evening'
        )
        RETURNING id
      `;
      
      if (orderResult.length > 0) {
        const orderId = orderResult[0].id;
        
        // Create order items
        await sql`
          INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price, sku, size, color)
          VALUES 
            (${orderId}, ${productIds[0]}, 'Acid Wash Phantom Tee', 2, 2500, 5000, 'RVZ-AWT-001', 'M', 'Black'),
            (${orderId}, ${productIds[1]}, 'Acid Wash Shadow Tee', 1, 2800, 2800, 'RVZ-AWT-002', 'L', 'Charcoal')
        `;
        console.log('  ✓ Created 1 order with 2 items');
      }

      // Create another order
      const orderItems2 = JSON.stringify([
        { product_id: productIds[1], quantity: 1, price: 3500 }
      ]);
      
      const orderResult2 = await sql`
        INSERT INTO orders (
          order_number, tracking_id, user_id, customer_email, customer_name, customer_phone,
          shipping_name, shipping_phone, shipping_address_line_1, shipping_city, shipping_postal_code, shipping_country,
          billing_name, billing_phone, billing_address_line_1, billing_city, billing_postal_code, billing_country,
          items, subtotal, shipping_method, shipping_cost, discount, coupon_code, payment_method, payment_status, order_status, order_notes
        )
        VALUES (
          'ORD-2024-002', 'TRK-DEF456', ${userId}, 'sara@test.com', 'Sara Ali', '03009876543',
          'Sara Ali', '03009876543', '456 Garden Town', 'Karachi', '75500', 'Pakistan',
          'Sara Ali', '03009876543', '456 Garden Town', 'Karachi', '75500', 'Pakistan',
          ${orderItems2}::jsonb,
          3500, 'express', 500, 350, 'WELCOME10', 'online', 'unpaid', 'processing', 'Gift wrap please'
        )
        RETURNING id
      `;
      
      if (orderResult2.length > 0) {
        const orderId2 = orderResult2[0].id;
        await sql`
          INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price, sku, size, color)
          VALUES 
            (${orderId2}, ${productIds[1]}, 'Classic Pullover Hoodie', 1, 3500, 3500, 'RVZ-HD-001', 'L', 'Black')
        `;
        console.log('  ✓ Created 1 more order with 1 item');
      }
    }

    // 8.5 Seed reviews table
    if (userId && productIds.length >= 3) {
      console.log('  → Seeding reviews...');
      await sql`
        INSERT INTO reviews (user_id, product_id, rating, comment, images, is_approved)
        VALUES 
          (${userId}, ${productIds[0]}, 5, 'Amazing quality! The fabric is so soft and the fit is perfect.', '[]'::jsonb, true),
          (${userId}, ${productIds[1]}, 4, 'Good product but shipping was slow.', '[]'::jsonb, true),
          (${userId}, ${productIds[2] || productIds[0]}, 5, 'Love the design! Will buy again.', '[]'::jsonb, true),
          (${userId}, ${productIds[3] || productIds[1]}, 3, 'Average quality, expected better.', '[]'::jsonb, false)
      `;
      console.log('  ✓ Created 4 reviews');
    }

    // 8.6 Seed wishlist table
    if (userId && productIds.length >= 3) {
      console.log('  → Seeding wishlist...');
      await sql`
        INSERT INTO wishlist (user_id, product_id)
        VALUES 
          (${userId}, ${productIds[0]}),
          (${userId}, ${productIds[1]}),
          (${userId}, ${productIds[2] || productIds[0]})
      `;
      console.log('  ✓ Created 3 wishlist items');
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   • Sub-categories: 3');
    console.log('   • Main categories: 1');
    console.log('   • Products: 15');
    console.log('   • Featured products: 8');
    console.log('   • Collections in Focus: 4');
    console.log('   • Addresses: 3');
    console.log('   • Audit logs: 5');
    console.log('   • Collection-products: 4');
    console.log('   • Orders: 2');
    console.log('   • Order items: 3');
    console.log('   • Reviews: 4');
    console.log('   • Wishlist items: 3');

  } catch (error: any) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
