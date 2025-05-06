export async function POST(req) {
    const { paymentId, txid } = await req.json()
  
    try {
      const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txid }),
      })
  
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Completion failed')
  
      return new Response(JSON.stringify({ message: 'Completed', data }), { status: 200 })
    } catch (err) {
      console.error('Completion error:', err)
      return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
  }
  