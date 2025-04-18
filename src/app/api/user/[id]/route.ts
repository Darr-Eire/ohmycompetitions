import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const userId = context.params.id

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { entries: true },
    })

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    return new Response(JSON.stringify(user), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 })
  }
}

