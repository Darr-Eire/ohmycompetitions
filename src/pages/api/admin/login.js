import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find admin user
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      role: 'admin' 
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a simple token (in production, use JWT)
    const token = crypto.randomBytes(32).toString('hex');

    // Create session (simplified - you may want to use JWT)
    const adminSession = {
      userId: user._id,
      email: user.email,
      role: user.role,
      token: token,
      isAdmin: true
    };

    // Set session cookie (simplified)
    res.setHeader('Set-Cookie', `admin-session=${JSON.stringify(adminSession)}; HttpOnly; Path=/; Max-Age=86400`);

    return res.status(200).json({ 
      success: true,
      message: 'Admin login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        token: token
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
