import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Missing title or content' });
    }

    // TODO: Save thread to DB here
    console.log(`User ${session.user.id} created thread:`, title);

    return res.status(201).json({ message: 'Thread created successfully' });
  } catch (error) {
    console.error('Error creating thread:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
