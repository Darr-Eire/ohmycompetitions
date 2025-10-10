const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const MONGO_URI = process.env.MONGO_DB_URL;

if (!MONGO_URI) {
  console.error('❌ Missing MONGO_DB_URL in environment');
  process.exit(1);
}

// Country schema (inline for this script)
const countrySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  region: { type: String },
  piNetworkPopular: { type: Boolean, default: false },
  flagUrl: { type: String },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

const Country = mongoose.models.Country || mongoose.model('Country', countrySchema);

// Static data to migrate (from src/data/countries.js)
const countries = [
  // Top Pi Network countries (marked as popular)
  { code: 'NG', name: 'Nigeria', region: 'Africa', piNetworkPopular: true, sortOrder: 1 },
  { code: 'PH', name: 'Philippines', region: 'Asia', piNetworkPopular: true, sortOrder: 2 },
  { code: 'IN', name: 'India', region: 'Asia', piNetworkPopular: true, sortOrder: 3 },
  { code: 'VN', name: 'Vietnam', region: 'Asia', piNetworkPopular: true, sortOrder: 4 },
  { code: 'PK', name: 'Pakistan', region: 'Asia', piNetworkPopular: true, sortOrder: 5 },
  { code: 'ID', name: 'Indonesia', region: 'Asia', piNetworkPopular: true, sortOrder: 6 },
  { code: 'BD', name: 'Bangladesh', region: 'Asia', piNetworkPopular: true, sortOrder: 7 },
  { code: 'EG', name: 'Egypt', region: 'Africa', piNetworkPopular: true, sortOrder: 8 },
  { code: 'KE', name: 'Kenya', region: 'Africa', piNetworkPopular: true, sortOrder: 9 },
  { code: 'GH', name: 'Ghana', region: 'Africa', piNetworkPopular: true, sortOrder: 10 },
  { code: 'TZ', name: 'Tanzania', region: 'Africa', piNetworkPopular: true, sortOrder: 11 },
  { code: 'ET', name: 'Ethiopia', region: 'Africa', piNetworkPopular: true, sortOrder: 12 },
  { code: 'ZA', name: 'South Africa', region: 'Africa', piNetworkPopular: true, sortOrder: 13 },
  { code: 'BR', name: 'Brazil', region: 'South America', piNetworkPopular: true, sortOrder: 14 },
  { code: 'MX', name: 'Mexico', region: 'North America', piNetworkPopular: true, sortOrder: 15 },
  { code: 'TH', name: 'Thailand', region: 'Asia', piNetworkPopular: true, sortOrder: 16 },
  { code: 'CN', name: 'China', region: 'Asia', piNetworkPopular: true, sortOrder: 17 },
  { code: 'IR', name: 'Iran', region: 'Asia', piNetworkPopular: true, sortOrder: 18 },
  { code: 'TR', name: 'Turkey', region: 'Europe', piNetworkPopular: true, sortOrder: 19 },
  { code: 'US', name: 'United States', region: 'North America', piNetworkPopular: true, sortOrder: 20 },

  // UK & Ireland
  { code: 'IE', name: 'Ireland', region: 'Europe', piNetworkPopular: false, sortOrder: 21 },
  { code: 'GB', name: 'United Kingdom', region: 'Europe', piNetworkPopular: false, sortOrder: 22 },
  { code: 'EN', name: 'England', region: 'Europe', piNetworkPopular: false, sortOrder: 23 },
  { code: 'SC', name: 'Scotland', region: 'Europe', piNetworkPopular: false, sortOrder: 24 },
  { code: 'WA', name: 'Wales', region: 'Europe', piNetworkPopular: false, sortOrder: 25 },
  { code: 'NI', name: 'Northern Ireland', region: 'Europe', piNetworkPopular: false, sortOrder: 26 },

  // Known global countries
  { code: 'CA', name: 'Canada', region: 'North America', piNetworkPopular: false, sortOrder: 27 },
  { code: 'AU', name: 'Australia', region: 'Oceania', piNetworkPopular: false, sortOrder: 28 },
  { code: 'DE', name: 'Germany', region: 'Europe', piNetworkPopular: false, sortOrder: 29 },
  { code: 'FR', name: 'France', region: 'Europe', piNetworkPopular: false, sortOrder: 30 },
  { code: 'IT', name: 'Italy', region: 'Europe', piNetworkPopular: false, sortOrder: 31 },
  { code: 'ES', name: 'Spain', region: 'Europe', piNetworkPopular: false, sortOrder: 32 },
  { code: 'RU', name: 'Russia', region: 'Europe', piNetworkPopular: false, sortOrder: 33 },
  { code: 'SA', name: 'Saudi Arabia', region: 'Asia', piNetworkPopular: false, sortOrder: 34 },
  { code: 'MY', name: 'Malaysia', region: 'Asia', piNetworkPopular: false, sortOrder: 35 },
  { code: 'AR', name: 'Argentina', region: 'South America', piNetworkPopular: false, sortOrder: 36 },
  { code: 'CO', name: 'Colombia', region: 'South America', piNetworkPopular: false, sortOrder: 37 },
  { code: 'UA', name: 'Ukraine', region: 'Europe', piNetworkPopular: false, sortOrder: 38 },
  { code: 'JP', name: 'Japan', region: 'Asia', piNetworkPopular: false, sortOrder: 39 },
  { code: 'KR', name: 'South Korea', region: 'Asia', piNetworkPopular: false, sortOrder: 40 }
];

async function seed() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Clearing existing countries...');
    await Country.deleteMany({});

    console.log('🚀 Seeding countries...');
    for (const country of countries) {
      const created = await Country.create({
        ...country,
        isActive: true,
        flagUrl: `/flags/${country.code.toLowerCase()}.png`
      });
      console.log(`✅ Created: ${created.name} (${created.code}) - ${created.piNetworkPopular ? 'Popular' : 'Standard'}`);
    }

    console.log(`🎉 ${countries.length} countries seeded successfully!`);
    console.log(`📊 Pi Network Popular: ${countries.filter(c => c.piNetworkPopular).length}`);
    console.log(`📊 Standard Countries: ${countries.filter(c => !c.piNetworkPopular).length}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding countries:', err);
    process.exit(1);
  }
}

seed(); 