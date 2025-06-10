import dbConnect from 'lib/dbConnect';

import Message from 'models/Message';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Optional basic spam guard
  if (message.length > 1000) {
    return res.status(400).json({ error: 'Message too long' });
  }

  try {
    await connectToDatabase();
    const saved = await Message.create({ name, email, message });
    return res.status(200).json({ success: true, data: saved });
  } catch (err) {
    console.error('[CONTACT API ERROR]', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
