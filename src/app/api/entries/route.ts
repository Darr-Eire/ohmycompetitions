import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { userId, competitionId, quantity } = await req.json()

    if (!userId || !competitionId || !quantity) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const entry = await prisma.entry.create({
      data: { userId, competitionId, quantity },
    })

    await prisma.competition.update({
      where: { id: competitionId },
      data: {
        ticketsSold: { increment: quantity },
      },
    })

    return NextResponse.json({ entry })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
}
