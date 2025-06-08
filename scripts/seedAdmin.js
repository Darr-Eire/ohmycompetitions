// scripts/seedAdmin.js

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import User from '../src/models/User.js';
import { connectToDatabase } from '../src/lib/dbConnect.js';

async function seedAdmin() {
  try {
    await connectToDatabase();

    const email = 'ohmycompetitions@gmail.com';
    const password = 'oppsididitagain';
    const username = 'Darren';  // <-- ✅ added username

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('✅ Admin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      email,
      username,
      password: hashedPassword,
      role: 'admin',
    });

   console.log('✅ Admin user created:', newAdmin?.email ?? '[email not returned]');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin user:', err);
    process.exit(1);
  }
}

seedAdmin();
