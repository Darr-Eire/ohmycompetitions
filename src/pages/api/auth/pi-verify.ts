// pages/api/auth/pi-verify.ts
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

type UserDTO = {
  uid: string;
  username: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserDTO|{error:string}>
) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/, '');
  if (!token) {
    return res.status(400).json({ error: 'Missing token' });
  }

  try {
    const { data } = await axios.get<UserDTO>(
      'https://api.minepi.com/v2/me',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Echo back the Pi user
    return res.status(200).json(data);
  } catch (e: any) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
