import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function comprehensiveTest() {
  console.log('═══════════════════════════════════════');
  console.log('🧪 RAVENZA COMPREHENSIVE TESTING');
  console.log('═══════════════════════════════════════\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Database Connection
  console.log('📡 Test 1: Database Connection');
  totalTests++;
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connected successfully');
    console.log(`   Server time: ${result[0].now}\n`);
    passedTests++;
  } catch (error: any) {
    console.log('❌ Database connection failed');
    console.log(`   Error: ${error.message}\n`);
    failedTests++;
  }

  // Test 2: Tables Exist
  console.log('📊 Test 2: Verify Tables Exist');
  totalTests++;
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    const requiredTables = [
      'products', 'categories', 'users', 'orders', 'order_items',
      'reviews', 'wishlist', 'addresses', 'otp_verifications',
      'collections', 'collection_products', 'warm_chapters',
      'faqs', 'journal_entries', 'newsletter_subscribers', 'cities'
    ];

    const existingTables = tables.map((t: any) => t.table_name);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    if (missingTables.length === 0) {
      console.log(`✅ All ${requiredTables.length} required tables exist`);
      console.log(`   Tables: ${existingTables.join(', ')}\n`);
      passedTests++;
    } else {
      console.log(`❌ Missing tables: ${missingTables.join(', ')}\n`);
      failedTests++;
    }
  } catch (error: any) {
    console.log('❌ Failed to check tables');
    console.log(`   Error: ${error.message}\n`);
    failedTests++;
  }

  // Test 3: Products Data
  console.log('👕 Test 3: Verify Products Data');
  totalTests++;
  try {
    const products = await sql`SELECT COUNT(*) as count FROM products`;
    const count = parseInt(products[0].count);
    
    if (count >= 15) {
      console.log(`✅ Found ${count} products (expected: 15+)`);
      
      // Check product fields
      const sampleProduct = await sql`
        SELECT 
          id, name, slug, actual_price, thumbnail_image,
          main_category_id, sub_category_id, is_featured,
          sizes, colors, stock
        FROM products 
        LIMIT 1
      `;
      
      if (sampleProduct[0]) {
        console.log('   Sample product fields:');
        console.log(`   - Name: ${sampleProduct[0].name}`);
        console.log(`   - Price: Rs. ${sampleProduct[0].actual_price}`);
        console.log(`   - Featured: ${sampleProduct[0].is_featured}`);
        console.log(`   - Stock: ${sampleProduct[0].stock}`);
      }
      console.log();
      passedTests++;
    } else {
      console.log(`❌ Only ${count} products found (expected: 15+)\n`);
      failedTests++;
    }
  } catch (error: any) {
    console.log('❌ Failed to check products');
    console.log(`   Error: ${error.message}\n`);
    failedTests++;
  }

  // Test 4: Categories Data
  console.log('📂 Test 4: Verify Categories Data');
  totalTests++;
  try {
    const categories = await sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_main_category = true THEN 1 ELSE 0 END) as main_count,
        SUM(CASE WHEN is_main_category = false THEN 1 ELSE 0 END) as sub_count
      FROM categories
    `;
    
    const total = parseInt(categories[0].total);
    const mainCount = parseInt(categories[0].main_count);
    const subCount = parseInt(categories[0].sub_count);
    
    if (total >= 10) {
      console.log(`✅ Found ${total} categories`);
      console.log(`   - Main categories: ${mainCount}`);
      console.log(`   - Sub-categories: ${subCount}\n`);
      passedTests++;
    } else {
      console.log(`❌ Only ${total} categories found (expected: 10+)\n`);
      failedTests++;
    }
  } catch (error: any) {
    console.log('❌ Failed to check categories');
    console.log(`   Error: ${error.message}\n`);
    failedTests++;
  }

  // Test 5: Warm Chapters Data
  console.log('🔥 Test 5: Verify Warm Chapters Data');
  totalTests++;
  try {
    const chapters = await sql`SELECT COUNT(*) as count FROM warm_chapters`;
    const count = parseInt(chapters[0].count);
    
    if (count >= 8) {
      console.log(`✅ Found ${count} warm chapters (expected: 8)\n`);
      passedTests++;
    } else {
      console.log(`❌ Only ${count} warm chapters found (expected: 8)\n`);
      failedTests++;
    }
  } catch (error: any) {
    console.log('❌ Failed to check warm chapters');
    console.log(`   Error: ${error.message}\n`);
    failedTests++;
  }

  // Test 6: Collections in Focus
  console.log('🎯 Test 6: Verify Collections in Focus');
  totalTests++;
  try {
    const collections = await sql`
      SELECT COUNT(*) as count 
      FROM categories 
      WHERE is_featured_in_focus = true
    `;
    const count = parseInt(collections[0].count);
    
    if (count >= 4) {
      console.log(`✅ Found ${count} featured collections (expected: 4)\n`);
      passedTests++;
    } else {
      console.log(`❌ Only ${count} featured collections found (expected: 4)\n`);
      failedTests++;
    }
  } catch (error: any) {
    console.log('❌ Failed to check collections');
    console.log(`   Error: ${error.message}\n`);
    failedTests++;
  }

  // Test 7: Users Data
  console.log('👤 Test 7: Verify Users Data');
  totalTests++;
  try {
    const users = await sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
        SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as customer_count
      FROM users
    `;
    
    const total = parseInt(users[0].total);
    const adminCount = parseInt(users[0].admin_count);
    const customerCount = parseInt(users[0].customer_count);
    
    if (total >= 1) {
      console.log(`✅ Found ${total} users`);
      console.log(`   - Admins: ${adminCount}`);
      console.log(`   - Customers: ${customerCount}\n`);
      passedTests++;
    } else {
      console.log(`❌ No users found\n`);
      failedTests++;
    }
  } catch (error: any) {
    console.log('❌ Failed to check users');
    console.log(`   Error: ${error.message}\n`);
    failedTests++;
  }

  // Test 8: Orders Data
  console.log('📦 Test 8: Verify Orders Data');
  totalTests++;
  try {
    const orders = await sql`SELECT COUNT(*) as count FROM orders`;
    const count = parseInt(orders[0].count);
    
    console.log(`✅ Found ${count} orders\n`);
    passedTests++;
  } catch (error: any) {
    console.log('❌ Failed to check orders');
    console.log(`   Error: ${error.message}\n`);
    failedTests++;
  }

  // Test 9: Reviews Data
  console.log('⭐ Test 9: Verify Reviews Data');
  totalTests++;
  try {
    const reviews = await sql`SELECT COUNT(*) as count FROM reviews`;
    const count = parseInt(reviews[0].count);
    
    console.log(`✅ Found ${count} reviews\n`);
    passedTests++;
  } catch (error: any) {
    console.log('❌ Failed to check reviews');
    console.log(`   Error: ${error.message}\n`);
    failedTests++;
  }

  // Test 10: API Endpoints
  console.log('🌐 Test 10: Verify API Endpoints');
  totalTests++;
  try {
    const endpoints = [
      'http://localhost:3001/api/products',
      'http://localhost:3001/api/admin/categories?type=main',
      'http://localhost:3001/api/warm-chapters',
      'http://localhost:3001/api/collections-in-focus'
    ];

    let allEndpointsWorking = true;
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          console.log(`   ✅ ${endpoint}`);
        } else {
          console.log(`   ❌ ${endpoint} - Status: ${response.status}`);
          allEndpointsWorking = false;
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint} - Connection failed`);
        allEndpointsWorking = false;
      }
    }
    
    if (allEndpointsWorking) {
      console.log('✅ All API endpoints working\n');
      passedTests++;
    } else {
      console.log('❌ Some API endpoints failed\n');
      failedTests++;
    }
  } catch (error: any) {
    console.log('❌ Failed to test API endpoints');
    console.log(`   Error: ${error.message}\n`);
    failedTests++;
  }

  // Test Summary
  console.log('═══════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════\n');

  if (failedTests === 0) {
    console.log('🎉 ALL TESTS PASSED! System is ready for deployment.\n');
  } else {
    console.log(`⚠️  ${failedTests} test(s) failed. Please review and fix issues.\n`);
  }
}

comprehensiveTest().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
