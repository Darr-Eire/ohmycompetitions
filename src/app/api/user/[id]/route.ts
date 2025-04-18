// src/app/api/user/[id]/route.ts

import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

// ✅ CORRECT CONTEXT TYPE for App Router dynamic route
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const userId = context.params?.id

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        entries: {
          include: {
            competition: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (err) {
    console.error('Error fetching user:', err)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
