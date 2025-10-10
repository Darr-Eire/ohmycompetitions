// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// CORS middleware configuration
const cors = async (req, res) => {
  // Get the allowed origin from environment variable or use a default value
  const allowedOrigins = [
    'http://localhost:3000',
    'https://ohmycompetitions.vercel.app',
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL
  ].filter(Boolean);

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }

  // Set other CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cache-Control, Pragma'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

export default async function initCORS(req, res) {
  try {
    const shouldEndRequest = await cors(req, res);
    return shouldEndRequest;
  } catch (err) {
    console.error('❌ CORS Error:', err);
    return false;
  }
} 