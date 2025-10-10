// src/pages/api/_env.js
export default function handler(req, res) {
  res.json({
    piEnv: process.env.PI_ENV,
    publicPiEnv: process.env.NEXT_PUBLIC_PI_ENV,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    hasTestnetKey: Boolean(process.env.PI_API_KEY_TESTNET),
    hasMongoUri: Boolean(process.env.MONGODB_URI || process.env.MONGO_DB_URL),
  });
}
