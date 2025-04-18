import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

// Properly typed context object for App Router dynamic route
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const userId = context.params.id

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        entries: {
          include: { competition: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

