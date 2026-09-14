import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  console.log('🌱 Starting comprehensive database seed...\n');

  // ==================== CATEGORIES ====================
  console.log('📦 Seeding categories...');
  
  const mainCategories = [
    { name: 'Co-Ord Sets', slug: 'co-ord-sets', description: 'Premium matching sets for effortless style', badge: 'TRENDING', tag: 'WINTER ESSENTIALS', sort_order: 1 },
    { name: 'Oversize Tees', slug: 'oversize-tees', description: 'Bold graphic tees with premium acid wash', badge: 'POPULAR', tag: 'STREETWEAR', sort_order: 2 },
    { name: 'Graphic Trousers', slug: 'graphic-trousers', description: 'Wide leg trousers with signature prints', badge: null, tag: 'NEW DROP', sort_order: 3 },
    { name: 'Trackpants', slug: 'trackpants', description: 'Comfortable trackpants for everyday wear', badge: null, tag: 'ESSENTIALS', sort_order: 4 },
    { name: 'Graphic Shorts', slug: 'graphic-shorts', description: 'Statement shorts with unique graphics', badge: 'NEW', tag: 'SUMMER', sort_order: 5 },
    { name: 'Shirts & Jackets', slug: 'shirts-jackets', description: 'Premium outerwear and shirts', badge: null, tag: 'LAYERING', sort_order: 6 },
  ];

  for (const cat of mainCategories) {
    await sql`
      INSERT INTO categories (name, slug, description, badge, tag, sort_order, is_active, cover_image_url)
      VALUES (
        ${cat.name}, 
        ${cat.slug}, 
        ${cat.description}, 
        ${cat.badge}, 
        ${cat.tag}, 
        ${cat.sort_order}, 
        true,
        ${`https://images.unsplash.com/photo-${cat.slug === 'co-ord-sets' ? '1618354691373-d851c5c3a990' : 
          cat.slug === 'oversize-tees' ? '1521572163474-6864f9cf17ab' :
          cat.slug === 'graphic-trousers' ? '1624378439575-d8705ad7ae80' :
          cat.slug === 'trackpants' ? '1552902865-b72c031ac5ea' :
          cat.slug === 'graphic-shorts' ? '1591195853828-11db59a44f6b' :
          '1551028719-00167b16eac5'}?w=800&h=600&fit=crop`}
      )
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  // Get category IDs
  const categoryRows = await sql`SELECT id, slug FROM categories WHERE parent_id IS NULL`;
  const categoryMap = new Map(categoryRows.map((c: any) => [c.slug, c.id]));

  // Subcategories
  const subcategories = [
    { name: 'Acid Wash Tees', slug: 'acid-wash-tees', parent_slug: 'oversize-tees', description: 'Vintage acid wash collection', sort_order: 1 },
    { name: 'Graphic Tees', slug: 'graphic-tees', parent_slug: 'oversize-tees', description: 'Bold graphic prints', sort_order: 2 },
    { name: 'Hoodies', slug: 'hoodies', parent_slug: 'oversize-tees', description: 'Premium fleece hoodies', sort_order: 3 },
    { name: 'Wide Leg', slug: 'wide-leg', parent_slug: 'graphic-trousers', description: 'Relaxed wide leg fit', sort_order: 1 },
    { name: 'Cargo Style', slug: 'cargo-style', parent_slug: 'graphic-trousers', description: 'Utility cargo trousers', sort_order: 2 },
  ];

  for (const sub of subcategories) {
    const parentId = categoryMap.get(sub.parent_slug);
    if (parentId) {
      await sql`
        INSERT INTO categories (name, slug, parent_id, description, sort_order, is_active)
        VALUES (${sub.name}, ${sub.slug}, ${parentId}, ${sub.description}, ${sub.sort_order}, true)
        ON CONFLICT (slug) DO NOTHING
      `;
    }
  }

  // Refresh category map with subcategories
  const allCategories = await sql`SELECT id, slug FROM categories`;
  const fullCategoryMap = new Map(allCategories.map((c: any) => [c.slug, c.id]));

  console.log(`✅ Created ${allCategories.length} categories\n`);

  // ==================== PRODUCTS ====================
  console.log('👕 Seeding products...');

  const products = [
    // Co-Ord Sets
    {
      name: 'Shadow Realm Co-Ord Set',
      slug: 'shadow-realm-co-ord-set',
      description: 'Premium cotton co-ord set featuring shadow realm graphic print. Oversized fit for maximum comfort and street-ready aesthetics.',
      base_price: 4500,
      compare_at_price: 3990,
      category_slug: 'co-ord-sets',
      fabric: '100% Cotton',
      fabric_composition: '100% Premium Cotton',
      fabric_finish: 'Matte Finish',
      fit: 'Oversized',
      graphic_print: 'Shadow Realm Screen Print',
      garment_specs: '260 GSM',
      garment_care: 'Machine wash cold, tumble dry low',
      shipping_delivery: '3-5 business days across Pakistan',
      model_size: 'Model wears size L',
      sku: 'RVZ-CO-001',
      is_new_arrival: true,
      is_best_seller: true,
      is_featured: true,
      badge: 'NEW',
      images: [
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Charcoal'] },
    },
    {
      name: 'Midnight Vortex Co-Ord',
      slug: 'midnight-vortex-co-ord',
      description: 'Premium midnight vortex graphic co-ord set with puff print details. Effortless coordination with refined silhouettes.',
      base_price: 4800,
      compare_at_price: 4290,
      category_slug: 'co-ord-sets',
      fabric: 'Cotton Blend',
      fabric_composition: '80% Cotton, 20% Polyester',
      fabric_finish: 'Soft Touch',
      fit: 'Relaxed',
      graphic_print: 'Vortex Puff Print',
      garment_specs: '280 GSM',
      garment_care: 'Hand wash recommended',
      shipping_delivery: '3-5 business days',
      model_size: 'Model wears size M',
      sku: 'RVZ-CO-002',
      is_new_arrival: true,
      is_best_seller: false,
      is_featured: true,
      badge: 'LIMITED',
      images: [
        'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Dark Navy'] },
    },
    {
      name: 'Reaper X Graphic Co-Ord',
      slug: 'reaper-x-graphic-co-ord',
      description: 'Bold reaper graphics on premium cotton. The ultimate streetwear statement piece with limited edition design.',
      base_price: 4800,
      compare_at_price: 4290,
      category_slug: 'co-ord-sets',
      fabric: 'Premium Cotton',
      fabric_composition: '100% Premium Cotton',
      fabric_finish: 'Matte',
      fit: 'Oversized',
      graphic_print: 'Reaper X All-Over',
      garment_specs: '260 GSM',
      garment_care: 'Machine wash cold',
      shipping_delivery: '3-5 business days',
      model_size: 'Model wears size L',
      sku: 'RVZ-CO-003',
      is_new_arrival: true,
      is_best_seller: true,
      is_featured: true,
      badge: 'HOT',
      images: [
        'https://images.unsplash.com/photo-1578593139862-435adc1d20b8?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Dark Grey'] },
    },

    // Oversize Tees
    {
      name: 'Acid Wash Phantom Tee',
      slug: 'acid-wash-phantom-tee',
      description: 'Authentic acid wash oversized tee with phantom graphic. Premium softness and vintage character that stands out.',
      base_price: 2800,
      compare_at_price: 2499,
      category_slug: 'oversize-tees',
      fabric: 'Acid Wash Cotton',
      fabric_composition: '100% Acid Wash Cotton',
      fabric_finish: 'Acid Washed',
      fit: 'Oversized',
      graphic_print: 'Phantom Back Print',
      garment_specs: '240 GSM',
      garment_care: 'Wash separately, cold water',
      shipping_delivery: '3-5 business days',
      model_size: 'Model wears size M',
      sku: 'RVZ-TS-001',
      is_new_arrival: true,
      is_best_seller: true,
      is_featured: true,
      badge: 'BESTSELLER',
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Smoky Black', 'Faded Teal', 'Dusty Mocha'] },
    },
    {
      name: 'Classic Pullover Hoodie',
      slug: 'classic-pullover-hoodie',
      description: 'Classic pullover hoodie in premium fleece. Warm, comfortable, and timeless for everyday wear.',
      base_price: 2500,
      compare_at_price: 2240,
      category_slug: 'oversize-tees',
      fabric: 'Cotton Fleece',
      fabric_composition: '100% Cotton Fleece',
      fabric_finish: 'Brushed Interior',
      fit: 'Regular',
      graphic_print: 'Chest Embroidery',
      garment_specs: '350 GSM',
      garment_care: 'Machine wash cold',
      shipping_delivery: '3-5 business days',
      model_size: 'Model wears size L',
      sku: 'RVZ-HD-001',
      is_new_arrival: false,
      is_best_seller: false,
      is_featured: true,
      badge: null,
      images: [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'Grey', 'Navy'] },
    },

    // Graphic Trousers
    {
      name: 'Wide Leg Graphic Trouser',
      slug: 'wide-leg-graphic-trouser',
      description: 'Premium wide leg trouser with signature graphic print. Relaxed fit for effortless streetwear style.',
      base_price: 3200,
      compare_at_price: 2890,
      category_slug: 'graphic-trousers',
      fabric: 'Premium Twill',
      fabric_composition: '100% Premium Twill Cotton',
      fabric_finish: 'Matte Twill',
      fit: 'Wide Leg',
      graphic_print: 'All-Over Graphic',
      garment_specs: '280 GSM',
      garment_care: 'Machine wash cold',
      shipping_delivery: '3-5 business days',
      model_size: 'Model wears size M',
      sku: 'RVZ-TR-001',
      is_new_arrival: false,
      is_best_seller: true,
      is_featured: true,
      badge: null,
      images: [
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Navy'] },
    },

    // Trackpants
    {
      name: 'Urban Drift Trackpants',
      slug: 'urban-drift-trackpants',
      description: 'Premium fabric trackpants with relaxed wide-leg fit. Contemporary streetwear style with ultimate comfort.',
      base_price: 2900,
      compare_at_price: 2599,
      category_slug: 'trackpants',
      fabric: 'French Terry',
      fabric_composition: '100% French Terry Cotton',
      fabric_finish: 'Brushed Interior',
      fit: 'Relaxed',
      graphic_print: 'Contrast Side Stripe',
      garment_specs: '320 GSM',
      garment_care: 'Machine wash cold',
      shipping_delivery: '3-5 business days',
      model_size: 'Model wears size L',
      sku: 'RVZ-TP-001',
      is_new_arrival: false,
      is_best_seller: false,
      is_featured: true,
      badge: null,
      images: [
        'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'Grey', 'Navy'] },
    },

    // Graphic Shorts
    {
      name: 'Neon Pulse Graphic Shorts',
      slug: 'neon-pulse-graphic-shorts',
      description: 'Breathable graphic shorts with signature neon pulse design. Perfect for warmer days with bold aesthetics.',
      base_price: 2200,
      compare_at_price: 1990,
      category_slug: 'graphic-shorts',
      fabric: 'Polyester Blend',
      fabric_composition: '100% Polyester Mesh Blend',
      fabric_finish: 'Smooth',
      fit: 'Regular',
      graphic_print: 'Neon Pulse All-Over',
      garment_specs: '150 GSM',
      garment_care: 'Machine wash cold',
      shipping_delivery: '3-5 business days',
      model_size: 'Model wears size M',
      sku: 'RVZ-SH-001',
      is_new_arrival: true,
      is_best_seller: false,
      is_featured: false,
      badge: 'NEW',
      images: [
        'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1562157873-818bc0726f38?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White'] },
    },

    // Shirts & Jackets
    {
      name: 'Denim Jacket - Raven Black',
      slug: 'denim-jacket-raven-black',
      description: 'Premium denim jacket with classic fit. Perfect layering piece for any season with timeless appeal.',
      base_price: 3990,
      compare_at_price: null,
      category_slug: 'shirts-jackets',
      fabric: 'Cotton Denim',
      fabric_composition: '100% Cotton Denim',
      fabric_finish: 'Raw Denim',
      fit: 'Classic',
      graphic_print: 'Embroidered Logo',
      garment_specs: '14oz Denim',
      garment_care: 'Wash inside out',
      shipping_delivery: '3-5 business days',
      model_size: 'Model wears size L',
      sku: 'RVZ-JK-001',
      is_new_arrival: false,
      is_best_seller: false,
      is_featured: true,
      badge: null,
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'Brown', 'Light Blue'] },
    },
  ];

  for (const product of products) {
    const categoryId = fullCategoryMap.get(product.category_slug);
    
    await sql`
      INSERT INTO products (
        name, slug, description, base_price, compare_at_price, category_id,
        fabric, fabric_composition, fabric_finish, fit, graphic_print,
        garment_specs, garment_care, shipping_delivery, model_size,
        sku, is_new_arrival, is_best_seller, is_featured,
        badge, images, image_url, attributes, status, is_active
      ) VALUES (
        ${product.name}, ${product.slug}, ${product.description}, ${product.base_price},
        ${product.compare_at_price}, ${categoryId}, ${product.fabric}, ${product.fabric_composition},
        ${product.fabric_finish}, ${product.fit}, ${product.graphic_print},
        ${product.garment_specs}, ${product.garment_care}, ${product.shipping_delivery},
        ${product.model_size}, ${product.sku}, ${product.is_new_arrival}, ${product.is_best_seller},
        ${product.is_featured}, ${product.badge},
        ${JSON.stringify(product.images)}, ${product.images[0]},
        ${JSON.stringify(product.attributes)}, 'active', true
      )
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  const productCount = await sql`SELECT COUNT(*) as count FROM products`;
  console.log(`✅ Created ${productCount[0].count} products\n`);

  // ==================== COLLECTIONS ====================
  console.log('📚 Seeding collections...');

  const collections = [
    {
      name: 'Winter Essentials',
      slug: 'winter-essentials',
      description: 'Premium winter collection featuring co-ord sets and layering pieces',
      show_in_focus: true,
      show_explore_banner: true,
      explore_title: 'Explore Winter Collection',
      show_on_home_chapter: true,
      chapter_title: 'WARM CHAPTER I',
      edition_name: 'MAIN EDITION',
    },
    {
      name: 'Streetwear Classics',
      slug: 'streetwear-classics',
      description: 'Timeless streetwear pieces that define the culture',
      show_in_focus: true,
      show_explore_banner: false,
      show_on_home_chapter: false,
    },
    {
      name: 'New Arrivals',
      slug: 'new-arrivals',
      description: 'Latest drops and fresh styles',
      show_in_focus: false,
      show_explore_banner: true,
      explore_title: 'Shop New Arrivals',
      show_on_home_chapter: false,
    },
  ];

  for (const collection of collections) {
    await sql`
      INSERT INTO collections (
        name, slug, description, show_in_focus, show_explore_banner,
        explore_title, show_on_home_chapter, chapter_title, edition_name,
        is_active, sort_order
      ) VALUES (
        ${collection.name}, ${collection.slug}, ${collection.description},
        ${collection.show_in_focus}, ${collection.show_explore_banner},
        ${collection.explore_title}, ${collection.show_on_home_chapter},
        ${collection.chapter_title}, ${collection.edition_name},
        true, 0
      )
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  const collectionCount = await sql`SELECT COUNT(*) as count FROM collections`;
  console.log(`✅ Created ${collectionCount[0].count} collections\n`);

  // ==================== JOURNAL ENTRIES ====================
  console.log('📰 Seeding journal entries...');

  const journalEntries = [
    {
      title: 'The Birth of Ravenza',
      subtitle: 'Our journey from concept to reality',
      content: 'Ravenza was born from a simple vision: to create streetwear that speaks to the bold, the creative, and the unapologetically authentic. What started as a passion project in a small studio has grown into a movement that resonates with thousands across Pakistan.',
      featured_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop',
      category: 'Brand Story',
      author: 'Ravenza Team',
      published_date: new Date('2024-01-15'),
      display_order: 1,
    },
    {
      title: 'Behind the Design: Shadow Realm',
      subtitle: 'The inspiration behind our best-selling collection',
      content: 'The Shadow Realm collection draws inspiration from urban mythology and the duality of modern life. Each piece is carefully crafted to represent the balance between light and shadow, comfort and edge.',
      featured_image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&h=800&fit=crop',
      category: 'Design',
      author: 'Creative Director',
      published_date: new Date('2024-02-01'),
      display_order: 2,
    },
    {
      title: 'Sustainability in Streetwear',
      subtitle: 'Our commitment to responsible fashion',
      content: 'At Ravenza, we believe that great fashion shouldnt come at the cost of our planet. We are committed to using sustainable materials and ethical manufacturing processes wherever possible.',
      featured_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=800&fit=crop',
      category: 'Sustainability',
      author: 'Ravenza Team',
      published_date: new Date('2024-03-01'),
      display_order: 3,
    },
  ];

  for (const entry of journalEntries) {
    await sql`
      INSERT INTO journal_entries (
        title, subtitle, content, featured_image, category, author,
        published_date, is_active, display_order
      ) VALUES (
        ${entry.title}, ${entry.subtitle}, ${entry.content}, ${entry.featured_image},
        ${entry.category}, ${entry.author}, ${entry.published_date}, true, ${entry.display_order}
      )
    `;
  }

  const journalCount = await sql`SELECT COUNT(*) as count FROM journal_entries`;
  console.log(`✅ Created ${journalCount[0].count} journal entries\n`);

  // ==================== FAQs ====================
  console.log('❓ Seeding FAQs...');

  const faqs = [
    {
      question: 'What is your return policy?',
      answer: 'We offer a 7-day easy return policy. Items must be unworn, unwashed, with original tags attached. Contact our support team to initiate a return.',
      category: 'Shipping & Returns',
      display_order: 1,
    },
    {
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 3-5 business days for major cities and 5-7 days for other areas. Express delivery (1-2 days) is available for select locations.',
      category: 'Shipping & Returns',
      display_order: 2,
    },
    {
      question: 'Do you offer cash on delivery?',
      answer: 'Yes! COD is available across Pakistan. A small COD handling fee of Rs.100 may apply.',
      category: 'Payment',
      display_order: 3,
    },
    {
      question: 'What sizes do you offer?',
      answer: 'We offer sizes from S to 3XL depending on the product. Check the size guide on each product page for detailed measurements.',
      category: 'Sizing',
      display_order: 4,
    },
    {
      question: 'Are your products unisex?',
      answer: 'Most of our products are designed as unisex. Check the product description for specific fit details.',
      category: 'Sizing',
      display_order: 5,
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via email and SMS. You can also track your order on our Track Order page.',
      category: 'Shipping & Returns',
      display_order: 6,
    },
  ];

  for (const faq of faqs) {
    await sql`
      INSERT INTO faqs (question, answer, category, display_order, is_active)
      VALUES (${faq.question}, ${faq.answer}, ${faq.category}, ${faq.display_order}, true)
    `;
  }

  const faqCount = await sql`SELECT COUNT(*) as count FROM faqs`;
  console.log(`✅ Created ${faqCount[0].count} FAQs\n`);

  // ==================== ADMIN USER ====================
  console.log('👤 Creating admin user...');

  await sql`
    INSERT INTO users (email, name, role, is_verified, is_active, password)
    VALUES ('admin@ravenza.pk', 'Admin', 'admin', true, true, 'admin123')
    ON CONFLICT (email) DO NOTHING
  `;

  console.log('✅ Admin user created (admin@ravenza.pk / admin123)\n');

  // ==================== SUMMARY ====================
  console.log('═══════════════════════════════════════');
  console.log('✅ DATABASE SEEDING COMPLETE!');
  console.log('═══════════════════════════════════════');
  console.log('\n📊 Summary:');
  console.log(`   • Categories: ${allCategories.length}`);
  console.log(`   • Products: ${productCount[0].count}`);
  console.log(`   • Collections: ${collectionCount[0].count}`);
  console.log(`   • Journal Entries: ${journalCount[0].count}`);
  console.log(`   • FAQs: ${faqCount[0].count}`);
  console.log('\n🚀 Next steps:');
  console.log('   1. Start backend: cd server && npm run dev');
  console.log('   2. Start frontend: npm run dev');
  console.log('   3. Open: http://localhost:5173');
  console.log('\n🔐 Admin login:');
  console.log('   Email: admin@ravenza.pk');
  console.log('   Password: admin123\n');
}

seed().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
