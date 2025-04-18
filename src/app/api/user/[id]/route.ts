import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.pathname.split('/').pop() // or better: extract from searchParams if you prefer

  if (!id) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: id as string },
      include: {
        entries: true,
      },
    })

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    return new Response(JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}

