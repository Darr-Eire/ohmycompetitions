import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { paymentId, txid } = await req.json()

    const updated = await prisma.entry.update({
      where: { paymentId },
      data: {
        txid,
        status: 'completed',
      },
    })

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error('Complete Payment Error:', error)
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}
