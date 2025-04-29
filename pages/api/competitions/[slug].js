import clientPromise from '@/lib/mongodb'

export default async function handler(req, res) {
  const { slug } = req.query

  try {
    const client = await clientPromise
    const db = client.db('ohmycompetitions')
    const competition = await db
      .collection('competitions')
      .findOne({ slug })

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' })
    }

    res.status(200).json(competition)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching competition', error })
  }
}
