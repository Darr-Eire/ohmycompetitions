import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { paymentId } = await req.json()

    console.log('Approving payment with ID:', paymentId)
    console.log('Using Pi API key:', process.env.PI_API_KEY)

    const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Approval error:', data)
      return NextResponse.json({ error: data }, { status: 500 })
    }

    return NextResponse.json({ message: 'Payment approved', data })
  } catch (err) {
    console.error('Approval failed:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
