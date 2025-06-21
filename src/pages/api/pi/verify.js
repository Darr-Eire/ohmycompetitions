// pages/api/pi/verify.js
import axios from 'axios';
import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://ohmycompetitions:DarrenMongo2025@ohmycompetitions.ffrvvr5.mongodb.net/ohmycompetitions?retryWrites=true&w=majority&appName=ohmycompetitions';

// Create a MongoDB client
const client = new MongoClient(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { accessToken, userData } = req.body;
  
  if (!accessToken) {
    console.error('❌ Missing access token in request');
    return res.status(400).json({ error: 'Missing access token' });
  }

  let mongoConnection = null;

  try {
    console.log('🔄 Starting verification process...');

    // Verify with Pi Network API
    console.log('🔄 Verifying Pi access token...');
    const { data: piUser } = await axios.get('https://api.minepi.com/v2/me', {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    }).catch(error => {
      console.error('❌ Pi API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    });

    console.log('✅ Pi API response received:', {
      username: piUser.username,
      uid: piUser.uid,
      roles: piUser.roles
    });

    // Validate Pi user data
    if (!piUser.uid || !piUser.username) {
      console.error('❌ Invalid Pi user data:', piUser);
      return res.status(400).json({ 
        error: 'Invalid user data from Pi Network',
        details: 'Missing required user information'
      });
    }

    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    mongoConnection = await client.connect();
    const db = client.db();
    console.log('✅ MongoDB connected');

    // First, try to find the existing user
    const existingUser = await db.collection('users').findOne({ 
      $or: [
        { uid: piUser.uid },
        { username: piUser.username }
      ]
    });

    let user;
    if (existingUser) {
      // Update existing user
      user = await db.collection('users').findOneAndUpdate(
        { _id: existingUser._id },
        { 
          $set: {
            username: piUser.username,
            uid: piUser.uid,
            lastLogin: new Date(),
            accessToken,
            roles: piUser.roles || []
          }
        },
        { returnDocument: 'after' }
      );
    } else {
      // Create new user
      const newUser = {
        username: piUser.username,
        uid: piUser.uid,
        createdAt: new Date(),
        lastLogin: new Date(),
        accessToken,
        roles: piUser.roles || [],
        tickets: 0,
        country: userData?.country || null
      };

      const result = await db.collection('users').insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    }

    console.log('✅ User verified and updated:', {
      username: user.username,
      uid: user.uid,
      _id: user._id
    });
    
    // Return user data without sensitive fields
    const { accessToken: _, ...safeUserData } = user;
    res.status(200).json(safeUserData);

  } catch (err) {
    console.error('❌ Verification failed:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    
    // Handle specific error cases
    if (err.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: err.response.data 
      });
    }
    
    if (err.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Too many requests to Pi Network API',
        details: err.response.data
      });
    }
    
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Could not connect to Pi Network API',
        details: err.message
      });
    }

    // Database connection errors
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      console.error('❌ Database error:', {
        name: err.name,
        code: err.code,
        message: err.message
      });
      return res.status(500).json({ 
        error: 'Database error occurred',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    // Generic error
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        name: err.name,
        code: err.code
      } : undefined
    });
  } finally {
    try {
      if (mongoConnection) {
        console.log('🔄 Closing MongoDB connection...');
        await client.close();
        console.log('✅ MongoDB connection closed');
      }
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }
  }
}
