export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    piSandbox: process.env.PI_SANDBOX,
    frontendSandbox: process.env.NEXT_PUBLIC_SANDBOX_SDK,
    mongoConfigured: !!process.env.MONGO_DB_URL,
    piApiConfigured: !!process.env.PI_API_KEY,
    urls: {
      backend: process.env.NEXT_PUBLIC_BACKEND_URL,
      site: process.env.NEXT_PUBLIC_SITE_URL,
      app: process.env.NEXT_PUBLIC_APP_URL
    }
  };

  res.status(200).json(healthData);
} 