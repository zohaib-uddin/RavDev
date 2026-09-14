import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  console.log('🌱 Seeding database...');

  // Seed Categories
  console.log('📦 Seeding categories...');
  const categories = [
    { name: 'Co-Ord Sets', slug: 'co-ord-sets', description: 'Matching top and bottom sets', tag: 'TRENDING', sort_order: 1 },
    { name: 'Oversize Tees', slug: 'oversize-tees', description: 'Oversized t-shirts and hoodies', tag: 'POPULAR', sort_order: 2 },
    { name: 'Graphic Trousers', slug: 'graphic-trousers', description: 'Wide leg graphic trousers', sort_order: 3 },
    { name: 'Trackpants', slug: 'trackpants', description: 'Comfortable trackpants', tag: 'WARM CHAPTER', sort_order: 4 },
    { name: 'Graphic Shorts', slug: 'graphic-shorts', description: 'Bold graphic shorts', tag: 'NEW', sort_order: 5 },
    { name: 'Shirts & Jackets', slug: 'shirts', description: 'Shirts, jackets and outerwear', sort_order: 6 },
  ];

  for (const cat of categories) {
    await sql`
      INSERT INTO categories (name, slug, description, tag, sort_order, is_active)
      VALUES (${cat.name}, ${cat.slug}, ${cat.description}, ${cat.tag}, ${cat.sort_order}, true)
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  // Get category IDs
  const categoryRows = await sql`SELECT id, slug FROM categories`;
  const categoryMap = new Map(categoryRows.map((c: any) => [c.slug, c.id]));

  // Seed Products
  console.log('👕 Seeding products...');
  const products = [
    {
      name: 'Shadow Realm Co-Ord Set',
      slug: 'shadow-realm-co-ord',
      description: 'Premium cotton co-ord set with shadow realm graphic print. Oversized fit for maximum comfort.',
      base_price: 4500,
      compare_at_price: 3990,
      category_slug: 'co-ord-sets',
      fabric: '100% Cotton',
      fit: 'Oversized',
      sku: 'RVZ-CO-001',
      is_new_arrival: true,
      is_bestseller: true,
      is_featured: true,
      badge: 'NEW',
      images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=750&fit=crop'],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Charcoal'] },
      fabric_composition: '100% Premium Cotton',
      graphic_print: 'Shadow Realm Screen Print',
      garment_specs: '260 GSM',
    },
    {
      name: 'Acid Wash Phantom Tee',
      slug: 'acid-wash-phantom',
      description: 'Authentic acid wash oversized tee with phantom graphic. Premium softness and vintage character.',
      base_price: 2800,
      compare_at_price: 2499,
      category_slug: 'oversize-tees',
      fabric: 'Acid Wash Cotton',
      fit: 'Oversized',
      sku: 'RVZ-TS-002',
      is_new_arrival: true,
      is_bestseller: true,
      is_featured: true,
      badge: 'BESTSELLER',
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=750&fit=crop'],
      attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Smoky Black', 'Faded Teal', 'Dusty Mocha'] },
      fabric_composition: 'Acid Wash Cotton',
      graphic_print: 'Phantom Back Print',
      garment_specs: '240 GSM',
    },
    {
      name: 'Wide Leg Graphic Trouser',
      slug: 'wide-leg-graphic',
      description: 'Premium wide leg trouser with signature graphic print. Relaxed fit for effortless streetwear style.',
      base_price: 3200,
      compare_at_price: 2890,
      category_slug: 'graphic-trousers',
      fabric: 'Premium Twill',
      fit: 'Wide Leg',
      sku: 'RVZ-TR-003',
      is_bestseller: true,
      is_featured: true,
      images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=750&fit=crop'],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Navy'] },
      fabric_composition: 'Premium Twill Cotton',
      graphic_print: 'All-Over Graphic',
      garment_specs: '280 GSM',
    },
    {
      name: 'Urban Drift Trackpants',
      slug: 'urban-drift-trackpants',
      description: 'Premium fabric trackpants with relaxed wide-leg fit. Contemporary streetwear style.',
      base_price: 2900,
      compare_at_price: 2599,
      category_slug: 'trackpants',
      fabric: 'French Terry',
      fit: 'Relaxed',
      sku: 'RVZ-TP-004',
      is_featured: true,
      images: ['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=750&fit=crop'],
      attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'Grey', 'Navy'] },
      fabric_composition: 'French Terry Cotton',
      garment_specs: '320 GSM',
    },
    {
      name: 'Neon Pulse Graphic Shorts',
      slug: 'neon-pulse-shorts',
      description: 'Breathable graphic shorts with signature neon pulse design. Perfect for warmer days.',
      base_price: 2200,
      compare_at_price: 1990,
      category_slug: 'graphic-shorts',
      fabric: 'Polyester Blend',
      fit: 'Regular',
      sku: 'RVZ-SH-005',
      is_new_arrival: true,
      badge: 'NEW',
      images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=750&fit=crop'],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White'] },
      fabric_composition: 'Polyester Mesh Blend',
      graphic_print: 'Neon Pulse All-Over',
    },
    {
      name: 'Reaper X Graphic Co-Ord',
      slug: 'reaper-x-coord',
      description: 'Bold reaper graphics on premium cotton. The ultimate streetwear statement piece.',
      base_price: 4800,
      compare_at_price: 4290,
      category_slug: 'co-ord-sets',
      fabric: 'Premium Cotton',
      fit: 'Oversized',
      sku: 'RVZ-CO-007',
      is_new_arrival: true,
      is_bestseller: true,
      is_featured: true,
      badge: 'HOT',
      images: ['https://images.unsplash.com/photo-1578593139862-435adc1d20b8?w=600&h=750&fit=crop', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop'],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Dark Grey'] },
      fabric_composition: '100% Premium Cotton',
      graphic_print: 'Reaper X All-Over',
      garment_specs: '260 GSM',
    },
    {
      name: 'Denim Jacket - Raven Black',
      slug: 'denim-jacket-raven',
      description: 'Premium denim jacket with classic fit. Perfect layering piece for any season.',
      base_price: 3990,
      category_slug: 'shirts',
      fabric: 'Cotton Denim',
      fit: 'Classic',
      sku: 'RVZ-JK-008',
      is_featured: true,
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=750&fit=crop'],
      attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'Brown', 'Light Blue'] },
      fabric_composition: '100% Cotton Denim',
      garment_specs: '14oz Denim',
    },
    {
      name: 'Classic Pullover Hoodie',
      slug: 'classic-pullover-hoodie',
      description: 'Classic pullover hoodie in premium fleece. Warm, comfortable, and timeless.',
      base_price: 2500,
      compare_at_price: 2240,
      category_slug: 'oversize-tees',
      fabric: 'Cotton Fleece',
      fit: 'Regular',
      sku: 'RVZ-HD-009',
      is_featured: true,
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop'],
      attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'Grey', 'Navy'] },
      fabric_composition: 'Cotton Fleece',
      garment_specs: '350 GSM',
    },
  ];

  for (const product of products) {
    const categoryId = categoryMap.get(product.category_slug);
    await sql`
      INSERT INTO products (
        name, slug, description, base_price, compare_at_price, category_id,
        fabric, fit, sku, is_new_arrival, is_bestseller, is_featured,
        badge, images, image_url, attributes, fabric_composition, graphic_print,
        garment_specs, status, is_active
      ) VALUES (
        ${product.name}, ${product.slug}, ${product.description}, ${product.base_price},
        ${product.compare_at_price}, ${categoryId}, ${product.fabric}, ${product.fit},
        ${product.sku}, ${product.is_new_arrival}, ${product.is_bestseller},
        ${product.is_featured}, ${product.badge},
        ${JSON.stringify(product.images)}, ${product.images[0]},
        ${JSON.stringify(product.attributes)}, ${product.fabric_composition},
        ${product.graphic_print}, ${product.garment_specs}, 'active', true
      )
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  // Seed Admin User
  console.log('👤 Seeding admin user...');
  await sql`
    INSERT INTO users (email, name, role, is_verified, is_active, password)
    VALUES ('admin@ravenza.pk', 'Admin', 'admin', true, true, 'admin123')
    ON CONFLICT (email) DO NOTHING
  `;

  // Seed Reviews
  console.log('⭐ Seeding reviews...');
  const reviews = [
    { product_slug: 'shadow-realm-co-ord', user_name: 'Ahmed Khan', rating: 5, comment: 'Amazing quality! The fabric is so soft and the fit is perfect.' },
    { product_slug: 'acid-wash-phantom', user_name: 'Sara Ali', rating: 5, comment: 'Love the acid wash effect. Looks exactly like the photos!' },
    { product_slug: 'wide-leg-graphic', user_name: 'Bilal Hassan', rating: 5, comment: 'Best wide leg trousers I have ever owned. Premium quality!' },
    { product_slug: 'reaper-x-coord', user_name: 'Hamza Sheikh', rating: 5, comment: 'The reaper graphic is insane! Got so many compliments.' },
  ];

  for (const review of reviews) {
    const productRow = await sql`SELECT id FROM products WHERE slug = ${review.product_slug}`;
    if (productRow.length > 0) {
      await sql`
        INSERT INTO reviews (product_id, user_id, rating, comment, is_approved)
        VALUES (${productRow[0].id}, '00000000-0000-0000-0000-000000000000', ${review.rating}, ${review.comment}, true)
      `;
    }
  }

  console.log('✅ Database seeded successfully!');
}

seed().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
