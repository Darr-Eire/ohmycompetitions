import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { slug },
    method,
  } = req

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const competition = await prisma.competition.findUnique({
      where: { slug: slug as string },
    })

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' })
    }

    return res.status(200).json(competition)
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}
