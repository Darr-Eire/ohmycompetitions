import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../../lib/dbConnect.js';
import User from '../../../models/User.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectToDatabase();

  const { email, password } = req.body;

  const user = await User.findOne({ email, role: 'admin' });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  // ✅ Success (later we add real session / JWT here)
  return res.status(200).json({ message: 'Login successful' });
}
