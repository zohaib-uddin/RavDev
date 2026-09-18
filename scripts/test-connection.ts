import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function testConnection() {
  console.log('🧪 Testing database connection...\n');

  try {
    // Test 1: Basic connection
    console.log('📡 Connecting to NeonDB...');
    const timeResult = await sql`SELECT NOW()`;
    console.log('✅ Database connected successfully!');
    console.log(`📅 Database time: ${timeResult[0].now}\n`);

    // Test 2: Check tables
    console.log('📊 Checking tables...');
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log(`✅ Found ${tablesResult.length} tables:`);
    tablesResult.forEach((t: any) => console.log(`   • ${t.table_name}`));
    console.log();

    // Test 3: Check categories
    console.log('📦 Checking categories...');
    const categoriesResult = await sql`SELECT COUNT(*) as count FROM categories`;
    console.log(`✅ Found ${categoriesResult[0].count} categories\n`);

    // Test 4: Check products
    console.log('👕 Checking products...');
    const productsResult = await sql`SELECT COUNT(*) as count FROM products`;
    console.log(`✅ Found ${productsResult[0].count} products\n`);

    // Test 5: Sample data
    console.log('🔍 Sample products:');
    const sampleProducts = await sql`
      SELECT name, actual_price, thumbnail_image 
      FROM products 
      LIMIT 3
    `;
    sampleProducts.forEach((p: any) => {
      console.log(`   • ${p.name} - Rs. ${p.actual_price}`);
    });

    console.log('\n═══════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════');
    console.log('\n🚀 Database is ready!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start backend: cd server && npm run dev');
    console.log('   2. Start frontend: npm run dev');
    console.log('   3. Open browser: http://localhost:5173\n');

  } catch (error: any) {
    console.error('\n❌ Connection test failed!');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check DATABASE_URL in .env file');
    console.error('   2. Verify NeonDB project is active');
    console.error('   3. Check internet connection');
    console.error('   4. Run: npx drizzle-kit push (to create tables)');
    process.exit(1);
  }
}

testConnection();
