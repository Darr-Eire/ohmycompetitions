import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { paymentId, userId, competitionId, quantity } = await req.json()

    // Prevent duplicate entry with same paymentId
    const existing =await prisma.entry.findUnique({
        where: { paymentId },
      })
      

    if (existing) {
      return NextResponse.json({ error: 'Duplicate paymentId' })
    }

    const entry = await prisma.entry.create({
      data: {
        paymentId,
        userId,
        competitionId,
        status: 'pending',
      },
    })

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error('Approve Payment Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
