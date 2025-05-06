import { NextResponse } from 'next/server'

export async function POST(req) {
  const { paymentId } = await req.json()

  const apiKey = process.env.PI_API_KEY
  if (!apiKey) {
    console.error('❌ PI_API_KEY is missing from environment')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    const piRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!piRes.ok) {
      const errData = await piRes.json()
      console.error('❌ Pi approval failed:', errData)
      return NextResponse.json({ error: 'Payment approval failed' }, { status: 500 })
    }

    const data = await piRes.json()
    return NextResponse.json({ message: 'Payment approved', data })
  } catch (err) {
    console.error('❌ Approval error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
