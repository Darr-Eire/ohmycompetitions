// src/pages/api/debug/env.js
export default function handler(req, res) {
  res.json({
    NEXT_PUBLIC_PI_ENV: process.env.NEXT_PUBLIC_PI_ENV,
    PI_BACKEND_URL: process.env.PI_BACKEND_URL,
    PI_NETWORK_PASSPHRASE: process.env.PI_NETWORK_PASSPHRASE,
    MONGODB_URI: process.env.MONGODB_URI ? '✅ set' : '❌ missing',
    NODE_ENV: process.env.NODE_ENV,
  });
}
