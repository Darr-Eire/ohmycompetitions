import { connectToDatabase } from 'lib/dbConnect';import Competition from 'models/Competition';


import mongoose from 'mongoose';

export default async function handler(req, res) {
  await dbConnect();
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user?.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  let objectId;
  try {
    objectId = new mongoose.Types.ObjectId(id);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid competition ID' });
  }

  if (req.method === 'GET') {
    const competition = await Competition.findById(objectId);
    if (!competition) return res.status(404).json({ message: 'Not found' });
    return res.status(200).json(competition);
  }

  if (req.method === 'PUT') {
    const update = req.body;
    await Competition.findByIdAndUpdate(objectId, update);
    return res.status(200).json({ message: 'Updated' });
  }

  if (req.method === 'DELETE') {
    await Competition.findByIdAndDelete(objectId);
    return res.status(200).json({ message: 'Deleted' });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end();
}
