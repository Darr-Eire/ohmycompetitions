const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const MONGO_URI = process.env.MONGO_DB_URL;

if (!MONGO_URI) {
  console.error('❌ Missing MONGO_DB_URL in environment');
  process.exit(1);
}

// MysteryBox schema (inline for this script)
const mysteryBoxSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  priceInPi: { type: Number, required: true },
  rewards: [{
    name: { type: String, required: true },
    value: { type: String },
    chance: { type: Number, required: true, min: 0, max: 1 }
  }],
  imageUrl: { type: String },
  themeColor: { type: String },
  isActive: { type: Boolean, default: true },
  description: { type: String },
  rarity: { 
    type: String, 
    enum: ['bronze', 'silver', 'gold', 'platinum'], 
    default: 'bronze' 
  }
}, { timestamps: true });

const MysteryBox = mongoose.models.MysteryBox || mongoose.model('MysteryBox', mysteryBoxSchema);

// Static data to migrate
const mysteryBoxes = [
  {
    id: 'bronze',
    name: 'Bronze Box',
    priceInPi: 0.05,
    rewards: [
      { name: '0.01 Pi', value: '0.01 Pi', chance: 0.4 },
      { name: '0.02 Pi', value: '0.02 Pi', chance: 0.3 },
      { name: 'No Reward', value: 'No Reward', chance: 0.2 },
      { name: '5 Pi Competition Ticket', value: '5 Competition Tickets', chance: 0.1 }
    ],
    imageUrl: '/images/bronze-box.png',
    themeColor: '#cd7f32',
    rarity: 'bronze',
    description: 'Small rewards for beginner Pioneers',
    isActive: true
  },
  {
    id: 'silver',
    name: 'Silver Box',
    priceInPi: 0.15,
    rewards: [
      { name: '0.05 Pi', value: '0.05 Pi', chance: 0.3 },
      { name: '0.1 Pi', value: '0.1 Pi', chance: 0.25 },
      { name: 'No Reward', value: 'No Reward', chance: 0.2 },
      { name: '15 Pi Competition Ticket', value: '15 Competition Tickets', chance: 0.15 },
      { name: 'Wireless Controller', value: 'Gaming Controller', chance: 0.1 }
    ],
    imageUrl: '/images/silver-box.png',
    themeColor: '#c0c0c0',
    rarity: 'silver',
    description: 'Better rewards for experienced Pioneers',
    isActive: true
  },
  {
    id: 'gold',
    name: 'Gold Box',
    priceInPi: 0.5,
    rewards: [
      { name: '0.25 Pi', value: '0.25 Pi', chance: 0.2 },
      { name: '0.5 Pi', value: '0.5 Pi', chance: 0.15 },
      { name: 'No Reward', value: 'No Reward', chance: 0.2 },
      { name: '50 Pi Competition Ticket', value: '50 Competition Tickets', chance: 0.2 },
      { name: 'Apple AirPods', value: 'Apple AirPods', chance: 0.1 },
      { name: 'Xbox Series S', value: 'Xbox Series S', chance: 0.1 },
      { name: 'PlayStation 5', value: 'PlayStation 5', chance: 0.05 }
    ],
    imageUrl: '/images/gold-box.png',
    themeColor: '#ffd700',
    rarity: 'gold',
    description: 'Premium rewards for dedicated Pioneers',
    isActive: true
  }
];

async function seed() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Clearing existing mystery boxes...');
    await MysteryBox.deleteMany({});

    console.log('🚀 Seeding mystery boxes...');
    for (const box of mysteryBoxes) {
      const created = await MysteryBox.create(box);
      console.log(`✅ Created: ${created.name} (${created.id})`);
    }

    console.log('🎉 Mystery boxes seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding mystery boxes:', err);
    process.exit(1);
  }
}

seed(); 