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

    // Step 4: Create 10-15 sample products for each sub-category
    console.log('\n📦 Creating sample products...');

    const sampleProducts = [
      // Acid Wash Tees products
      {
        name: 'Acid Wash Phantom Tee',
        slug: 'acid-wash-phantom-tee',
        description: 'Premium acid wash t-shirt with phantom graphic',
        price: '2500',
        thumbnail_image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=450&fit=crop',
        sub_category_slug: 'acid-wash-tees',
        is_featured: true
      },
      {
        name: 'Acid Wash Shadow Tee',
        slug: 'acid-wash-shadow-tee',
        description: 'Dark acid wash t-shirt with shadow design',
        price: '2800',
        thumbnail_image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=450&fit=crop',
        sub_category_slug: 'acid-wash-tees',
        is_featured: true
      },
      {
        name: 'Acid Wash Vintage Tee',
        slug: 'acid-wash-vintage-tee',
        description: 'Vintage style acid wash t-shirt',
        price: '2600',
        thumbnail_image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=450&fit=crop',
        sub_category_slug: 'acid-wash-tees',
        is_featured: false
      },
      {
        name: 'Acid Wash Classic Tee',
        slug: 'acid-wash-classic-tee',
        description: 'Classic acid wash t-shirt',
        price: '2400',
        thumbnail_image: 'https://images.unsplash.com/photo-1562157873-818bc0726f38?w=800&h=450&fit=crop',
        sub_category_slug: 'acid-wash-tees',
        is_featured: true
      },
      {
        name: 'Acid Wash Premium Tee',
        slug: 'acid-wash-premium-tee',
        description: 'Premium quality acid wash t-shirt',
        price: '3000',
        thumbnail_image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=450&fit=crop',
        sub_category_slug: 'acid-wash-tees',
        is_featured: false
      },

      // Graphic Tees products
      {
        name: 'Graphic Dragon Tee',
        slug: 'graphic-dragon-tee',
        description: 'Bold dragon graphic t-shirt',
        price: '2200',
        thumbnail_image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=450&fit=crop',
        sub_category_slug: 'graphic-tees',
        is_featured: true
      },
      {
        name: 'Graphic Skull Tee',
        slug: 'graphic-skull-tee',
        description: 'Edgy skull graphic t-shirt',
        price: '2300',
        thumbnail_image: 'https://images.unsplash.com/photo-1562157873-818bc0726f38?w=800&h=450&fit=crop',
        sub_category_slug: 'graphic-tees',
        is_featured: true
      },
      {
        name: 'Graphic Street Tee',
        slug: 'graphic-street-tee',
        description: 'Street style graphic t-shirt',
        price: '2100',
        thumbnail_image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=450&fit=crop',
        sub_category_slug: 'graphic-tees',
        is_featured: false
      },
      {
        name: 'Graphic Urban Tee',
        slug: 'graphic-urban-tee',
        description: 'Urban style graphic t-shirt',
        price: '2400',
        thumbnail_image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=450&fit=crop',
        sub_category_slug: 'graphic-tees',
        is_featured: true
      },
      {
        name: 'Graphic Art Tee',
        slug: 'graphic-art-tee',
        description: 'Artistic graphic t-shirt',
        price: '2500',
        thumbnail_image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=450&fit=crop',
        sub_category_slug: 'graphic-tees',
        is_featured: false
      },

      // Hoodies products
      {
        name: 'Classic Pullover Hoodie',
        slug: 'classic-pullover-hoodie',
        description: 'Comfortable classic pullover hoodie',
        price: '3500',
        thumbnail_image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=450&fit=crop',
        sub_category_slug: 'hoodies',
        is_featured: true
      },
      {
        name: 'Zip-Up Hoodie',
        slug: 'zip-up-hoodie',
        description: 'Stylish zip-up hoodie',
        price: '3800',
        thumbnail_image: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=450&fit=crop',
        sub_category_slug: 'hoodies',
        is_featured: true
      },
      {
        name: 'Oversized Hoodie',
        slug: 'oversized-hoodie',
        description: 'Trendy oversized hoodie',
        price: '4000',
        thumbnail_image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=450&fit=crop',
        sub_category_slug: 'hoodies',
        is_featured: false
      },
      {
        name: 'Graphic Hoodie',
        slug: 'graphic-hoodie',
        description: 'Hoodie with graphic print',
        price: '3600',
        thumbnail_image: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=450&fit=crop',
        sub_category_slug: 'hoodies',
        is_featured: true
      },
      {
        name: 'Premium Hoodie',
        slug: 'premium-hoodie',
        description: 'Premium quality hoodie',
        price: '4200',
        thumbnail_image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=450&fit=crop',
        sub_category_slug: 'hoodies',
        is_featured: false
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
            price, 
            thumbnail_image, 
            main_category_id, 
            sub_category_id, 
            is_featured
          )
          VALUES (
            ${product.name},
            ${product.slug},
            ${product.description},
            ${product.price},
            ${product.thumbnail_image},
            ${mainCategoryId},
            ${subCat[0].id},
            ${product.is_featured}
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

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   • Sub-categories: 3');
    console.log('   • Main categories: 1');
    console.log('   • Products: 15');
    console.log('   • Featured products: 8');

  } catch (error: any) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
