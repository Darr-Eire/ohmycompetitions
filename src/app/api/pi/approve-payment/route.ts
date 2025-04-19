import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { paymentId, userId, competitionId /* quantity */ } = await req.json()

    // ✅ Check for existing entry with same paymentId to avoid duplicates
    const existing = await prisma.entry.findUnique({
      where: { paymentId },
    })

    if (existing) {
      return NextResponse.json({ error: 'Duplicate paymentId' }, { status: 400 })
    }

    // ✅ Create new pending entry
    const entry = await prisma.entry.create({
      data: {
        paymentId,
        userId,
        competitionId,
        status: 'pending',
        // You can include quantity here if your schema supports it
      },
    })

    return NextResponse.json({ success: true, entry }, { status: 201 })
  } catch (error) {
    console.error('❌ Approve Payment Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
