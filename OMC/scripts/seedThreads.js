import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });  // <-- important for your case

import Thread from '../src/models/Thread.js';

async function seed() {
  await mongoose.connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await Thread.deleteMany();

  const threads = [
    {
      slug: 'first-post',
      title: '🔥 Welcome to OhMyCompetitions!',
      body: 'Welcome pioneers, let’s start the first discussions!',
      category: 'general',
      author: 'admin',
    },
    {
      slug: 'vote-next-prize',
      title: '💎 Vote for the Next Big Prize',
      body: 'Suggest and vote for what prizes you want to see!',
      category: 'vote',
      author: 'admin',
    },
  ];

  await Thread.insertMany(threads);
  console.log('✅ Seeded forum threads.');
  process.exit();
}

seed();
