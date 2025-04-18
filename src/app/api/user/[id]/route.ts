import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = params.id

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        entries: {
          include: {
            competition: true,
          },
        },
      },
    })

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    return new Response(JSON.stringify(user), { status: 200 })
} catch {
    return new Response("Something went wrong", { status: 500 })
  }
  
}
