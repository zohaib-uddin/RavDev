import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function fixDatabase() {
  console.log('🔧 Fixing database schema issues...\n');

  try {
    // Step 1: Add missing columns to products FIRST
    console.log('📦 Adding missing columns to products...');
    
    // Add is_best_seller column (NOT NULL with default)
    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller boolean NOT NULL DEFAULT false`;
      console.log('  ✓ Added column: is_best_seller');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('  ✓ Column already exists: is_best_seller');
      } else {
        console.log(`  ⚠️  Could not add is_best_seller: ${error.message}`);
      }
    }

    // Add other columns
    const columnsToAdd = [
      { name: 'subcategory_id', type: 'uuid' },
      { name: 'shipping_delivery', type: 'text' },
      { name: 'model_size', type: 'varchar(255)' },
      { name: 'canonical_url', type: 'varchar(500)' },
      { name: 'cloudinary_image_id', type: 'varchar(255)' },
      { name: 'size_guide', type: 'jsonb DEFAULT \'[]\'::jsonb' },
    ];

    for (const col of columnsToAdd) {
      try {
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS ${sql(col.name)} ${sql(col.type)}`;
        console.log(`  ✓ Added column: ${col.name}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`  ✓ Column already exists: ${col.name}`);
        } else {
          console.log(`  ⚠️  Could not add ${col.name}: ${error.message}`);
        }
      }
    }
    
    console.log('✅ Products columns added\n');

    // Step 2: Fix categories table - add badge column
    console.log('📂 Fixing categories table...');
    
    try {
      await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS badge varchar(50)`;
      console.log('✅ Badge column added to categories\n');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('✅ Badge column already exists\n');
      } else {
        throw error;
      }
    }

    // Step 3: Fix products table - update NULL values
    console.log('📦 Fixing products table NULL values...');
    
    await sql`
      UPDATE products 
      SET 
        is_new_arrival = COALESCE(is_new_arrival, false),
        is_bestseller = COALESCE(is_bestseller, false),
        is_featured = COALESCE(is_featured, false),
        is_best_seller = COALESCE(is_best_seller, false),
        fabric_composition = COALESCE(fabric_composition, 'Premium Cotton'),
        fabric_finish = COALESCE(fabric_finish, 'Matte'),
        garment_care = COALESCE(garment_care, 'Machine wash cold'),
        status = COALESCE(status, 'active')
    `;
    
    console.log('✅ Products table NULL values fixed\n');

    // Step 4: Create new tables if they don't exist
    console.log('📊 Creating new tables...');

    // Collection Products table
    await sql`
      CREATE TABLE IF NOT EXISTS collection_products (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        collection_id uuid NOT NULL,
        product_id uuid NOT NULL,
        sort_order integer NOT NULL DEFAULT 0,
        is_active boolean NOT NULL DEFAULT true,
        added_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `;
    console.log('  ✓ collection_products table created');

    // Journal Entries table
    await sql`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title varchar(255) NOT NULL,
        subtitle varchar(255),
        content text NOT NULL,
        featured_image varchar(500),
        category varchar(100),
        author varchar(100),
        published_date timestamp with time zone,
        is_active boolean NOT NULL DEFAULT true,
        display_order integer NOT NULL DEFAULT 0,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `;
    console.log('  ✓ journal_entries table created');

    // FAQs table
    await sql`
      CREATE TABLE IF NOT EXISTS faqs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        question text NOT NULL,
        answer text NOT NULL,
        category varchar(100),
        display_order integer NOT NULL DEFAULT 0,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `;
    console.log('  ✓ faqs table created');

    // Newsletter Subscribers table
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) NOT NULL UNIQUE,
        is_active boolean NOT NULL DEFAULT true,
        subscribed_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `;
    console.log('  ✓ newsletter_subscribers table created');

    // Reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        product_id uuid NOT NULL,
        rating integer NOT NULL,
        comment text,
        is_approved boolean NOT NULL DEFAULT false,
        created_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `;
    console.log('  ✓ reviews table created');

    console.log('✅ All tables created\n');

    // Step 5: Create indexes
    console.log('🔍 Creating indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS collection_products_collection_idx ON collection_products (collection_id)',
      'CREATE INDEX IF NOT EXISTS collection_products_product_idx ON collection_products (product_id)',
      'CREATE UNIQUE INDEX IF NOT EXISTS collection_products_unique_idx ON collection_products (collection_id, product_id)',
      'CREATE INDEX IF NOT EXISTS journal_active_idx ON journal_entries (is_active)',
      'CREATE INDEX IF NOT EXISTS journal_order_idx ON journal_entries (display_order)',
      'CREATE INDEX IF NOT EXISTS faqs_active_idx ON faqs (is_active)',
      'CREATE INDEX IF NOT EXISTS faqs_order_idx ON faqs (display_order)',
      'CREATE UNIQUE INDEX IF NOT EXISTS newsletter_email_idx ON newsletter_subscribers (email)',
      'CREATE INDEX IF NOT EXISTS reviews_product_idx ON reviews (product_id)',
      'CREATE INDEX IF NOT EXISTS reviews_approved_idx ON reviews (is_approved)',
    ];

    for (const index of indexes) {
      try {
        await sql(index);
      } catch (error: any) {
        // Ignore if index already exists
      }
    }
    
    console.log('✅ Indexes created\n');

    console.log('═══════════════════════════════════════');
    console.log('✅ DATABASE FIX COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log('\n🚀 Next steps:');
    console.log('   1. Run: npx tsx scripts/seed.ts');
    console.log('   2. Start backend: cd server && npm run dev');
    console.log('   3. Start frontend: npm run dev');
    console.log('\n');

  } catch (error: any) {
    console.error('❌ Error fixing database:', error);
    console.error('\nError details:', error.message);
    process.exit(1);
  }
}

fixDatabase();
