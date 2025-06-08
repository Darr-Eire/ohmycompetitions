import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import User from '../src/models/User.js';
import { connectToDatabase } from '../src/lib/dbConnect.js';

async function seedAdmin() {
  try {
    await connectToDatabase();

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const username = process.env.ADMIN_USERNAME;

    if (!email || !password || !username) {
      console.error('❌ Missing ADMIN credentials in env file.');
      process.exit(1);
    }

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
      piUserId: 'admin-seed-user'
    });

    const adminObject = newAdmin.toObject();
    console.log('✅ Admin user created:', adminObject.email);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin user:', err);
    process.exit(1);
  }
}

seedAdmin();
