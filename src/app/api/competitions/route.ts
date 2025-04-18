import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const competitions = await prisma.competition.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(competitions)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch competitions' }, { status: 500 })
  }
}
