import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function seedCities() {
  console.log('🏙️ Seeding Pakistani cities...\n');

  const cities = [
    // Punjab
    { name: 'Lahore', province: 'Punjab' },
    { name: 'Faisalabad', province: 'Punjab' },
    { name: 'Rawalpindi', province: 'Punjab' },
    { name: 'Multan', province: 'Punjab' },
    { name: 'Gujranwala', province: 'Punjab' },
    { name: 'Sialkot', province: 'Punjab' },
    { name: 'Bahawalpur', province: 'Punjab' },
    { name: 'Sargodha', province: 'Punjab' },
    { name: 'Sahiwal', province: 'Punjab' },
    { name: 'Jhang', province: 'Punjab' },
    { name: 'Gujrat', province: 'Punjab' },
    { name: 'Sheikhupura', province: 'Punjab' },
    { name: 'Rahim Yar Khan', province: 'Punjab' },
    { name: 'Jhelum', province: 'Punjab' },
    { name: 'Dera Ghazi Khan', province: 'Punjab' },
    { name: 'Kasur', province: 'Punjab' },
    { name: 'Okara', province: 'Punjab' },
    { name: 'Vehari', province: 'Punjab' },
    { name: 'Bahawalnagar', province: 'Punjab' },
    { name: 'Mianwali', province: 'Punjab' },
    { name: 'Khushab', province: 'Punjab' },
    { name: 'Muzaffargarh', province: 'Punjab' },
    { name: 'Layyah', province: 'Punjab' },
    { name: 'Bhakkar', province: 'Punjab' },
    { name: 'Chakwal', province: 'Punjab' },
    { name: 'Attock', province: 'Punjab' },
    { name: 'Narowal', province: 'Punjab' },
    { name: 'Hafizabad', province: 'Punjab' },
    { name: 'Mandi Bahauddin', province: 'Punjab' },
    { name: 'Toba Tek Singh', province: 'Punjab' },
    { name: 'Pakpattan', province: 'Punjab' },
    { name: 'Lodhran', province: 'Punjab' },
    { name: 'Khanewal', province: 'Punjab' },
    { name: 'Nankana Sahib', province: 'Punjab' },
    { name: 'Chiniot', province: 'Punjab' },
    { name: 'Wazirabad', province: 'Punjab' },
    { name: 'Daska', province: 'Punjab' },
    { name: 'Kamoke', province: 'Punjab' },
    { name: 'Mustafabad', province: 'Punjab' },
    { name: 'Ahmadpur East', province: 'Punjab' },
    { name: 'Kot Addu', province: 'Punjab' },
    { name: 'Taunsa', province: 'Punjab' },
    { name: 'Dera Ismail Khan', province: 'Punjab' },
    
    // Sindh
    { name: 'Karachi', province: 'Sindh' },
    { name: 'Hyderabad', province: 'Sindh' },
    { name: 'Sukkur', province: 'Sindh' },
    { name: 'Larkana', province: 'Sindh' },
    { name: 'Nawabshah', province: 'Sindh' },
    { name: 'Mirpur Khas', province: 'Sindh' },
    { name: 'Thatta', province: 'Sindh' },
    { name: 'Badin', province: 'Sindh' },
    { name: 'Dadu', province: 'Sindh' },
    { name: 'Jacobabad', province: 'Sindh' },
    { name: 'Shikarpur', province: 'Sindh' },
    { name: 'Tando Adam', province: 'Sindh' },
    { name: 'Khairpur', province: 'Sindh' },
    { name: 'Sanghar', province: 'Sindh' },
    { name: 'Tharparkar', province: 'Sindh' },
    { name: 'Umerkot', province: 'Sindh' },
    { name: 'Ghotki', province: 'Sindh' },
    { name: 'Kashmore', province: 'Sindh' },
    { name: 'Matiari', province: 'Sindh' },
    { name: 'Tando Allahyar', province: 'Sindh' },
    { name: 'Jamshoro', province: 'Sindh' },
    { name: 'Sujawal', province: 'Sindh' },
    
    // Khyber Pakhtunkhwa
    { name: 'Peshawar', province: 'Khyber Pakhtunkhwa' },
    { name: 'Abbottabad', province: 'Khyber Pakhtunkhwa' },
    { name: 'Mardan', province: 'Khyber Pakhtunkhwa' },
    { name: 'Swat', province: 'Khyber Pakhtunkhwa' },
    { name: 'Mingora', province: 'Khyber Pakhtunkhwa' },
    { name: 'Kohat', province: 'Khyber Pakhtunkhwa' },
    { name: 'Bannu', province: 'Khyber Pakhtunkhwa' },
    { name: 'Dera Ismail Khan', province: 'Khyber Pakhtunkhwa' },
    { name: 'Chitral', province: 'Khyber Pakhtunkhwa' },
    { name: 'Dir', province: 'Khyber Pakhtunkhwa' },
    { name: 'Nowshera', province: 'Khyber Pakhtunkhwa' },
    { name: 'Swabi', province: 'Khyber Pakhtunkhwa' },
    { name: 'Haripur', province: 'Khyber Pakhtunkhwa' },
    { name: 'Mansehra', province: 'Khyber Pakhtunkhwa' },
    { name: 'Batkhela', province: 'Khyber Pakhtunkhwa' },
    { name: 'Takht-i-Bahi', province: 'Khyber Pakhtunkhwa' },
    { name: 'Charsadda', province: 'Khyber Pakhtunkhwa' },
    { name: 'Tank', province: 'Khyber Pakhtunkhwa' },
    { name: 'Lakki Marwat', province: 'Khyber Pakhtunkhwa' },
    { name: 'Hangu', province: 'Khyber Pakhtunkhwa' },
    { name: 'Karak', province: 'Khyber Pakhtunkhwa' },
    { name: 'Shangla', province: 'Khyber Pakhtunkhwa' },
    { name: 'Buner', province: 'Khyber Pakhtunkhwa' },
    { name: 'Lower Dir', province: 'Khyber Pakhtunkhwa' },
    { name: 'Upper Dir', province: 'Khyber Pakhtunkhwa' },
    
    // Balochistan
    { name: 'Quetta', province: 'Balochistan' },
    { name: 'Gwadar', province: 'Balochistan' },
    { name: 'Turbat', province: 'Balochistan' },
    { name: 'Khuzdar', province: 'Balochistan' },
    { name: 'Chaman', province: 'Balochistan' },
    { name: 'Sibi', province: 'Balochistan' },
    { name: 'Zhob', province: 'Balochistan' },
    { name: 'Pishin', province: 'Balochistan' },
    { name: 'Kharan', province: 'Balochistan' },
    { name: 'Mastung', province: 'Balochistan' },
    { name: 'Kalat', province: 'Balochistan' },
    { name: 'Nushki', province: 'Balochistan' },
    { name: 'Kech', province: 'Balochistan' },
    { name: 'Panjgur', province: 'Balochistan' },
    { name: 'Lasbela', province: 'Balochistan' },
    { name: 'Awaran', province: 'Balochistan' },
    { name: 'Washuk', province: 'Balochistan' },
    { name: 'Sherani', province: 'Balochistan' },
    { name: 'Musakhel', province: 'Balochistan' },
    { name: 'Barkhan', province: 'Balochistan' },
    { name: 'Kohlu', province: 'Balochistan' },
    { name: 'Dera Bugti', province: 'Balochistan' },
    { name: 'Jafarabad', province: 'Balochistan' },
    { name: 'Jhal Magsi', province: 'Balochistan' },
    { name: 'Nasirabad', province: 'Balochistan' },
    { name: 'Kachhi', province: 'Balochistan' },
    
    // Islamabad & AJK
    { name: 'Islamabad', province: 'Islamabad' },
    { name: 'Muzaffarabad', province: 'Azad Kashmir' },
    { name: 'Mirpur', province: 'Azad Kashmir' },
    { name: 'Kotli', province: 'Azad Kashmir' },
    { name: 'Bhimber', province: 'Azad Kashmir' },
    { name: 'Rawalakot', province: 'Azad Kashmir' },
    { name: 'Bagh', province: 'Azad Kashmir' },
    { name: 'Neelum', province: 'Azad Kashmir' },
    { name: 'Haveli', province: 'Azad Kashmir' },
    { name: 'Sudhanoti', province: 'Azad Kashmir' },
    
    // Gilgit-Baltistan
    { name: 'Gilgit', province: 'Gilgit-Baltistan' },
    { name: 'Skardu', province: 'Gilgit-Baltistan' },
    { name: 'Hunza', province: 'Gilgit-Baltistan' },
    { name: 'Nagar', province: 'Gilgit-Baltistan' },
    { name: 'Ghizer', province: 'Gilgit-Baltistan' },
    { name: 'Diamer', province: 'Gilgit-Baltistan' },
    { name: 'Astore', province: 'Gilgit-Baltistan' },
    { name: 'Ghanche', province: 'Gilgit-Baltistan' },
  ];

  try {
    for (const city of cities) {
      await sql`
        INSERT INTO cities (name, province, is_active)
        VALUES (${city.name}, ${city.province}, true)
        ON CONFLICT DO NOTHING
      `;
    }

    const count = await sql`SELECT COUNT(*) as count FROM cities`;
    console.log(`✅ Successfully seeded ${count[0].count} cities\n`);
    console.log('📊 Breakdown by province:');
    
    const byProvince = await sql`
      SELECT province, COUNT(*) as count 
      FROM cities 
      WHERE is_active = true
      GROUP BY province
      ORDER BY count DESC
    `;
    
    byProvince.forEach((row: any) => {
      console.log(`   • ${row.province}: ${row.count} cities`);
    });

  } catch (error: any) {
    console.error('❌ Error seeding cities:', error.message);
    process.exit(1);
  }
}

seedCities();
