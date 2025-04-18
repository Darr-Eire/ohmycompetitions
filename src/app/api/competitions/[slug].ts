import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params

  try {
    const competition = await prisma.competition.findUnique({
      where: { slug },
    })

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    return NextResponse.json(competition)
  } catch (err) {
    console.error('Error fetching competition:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
