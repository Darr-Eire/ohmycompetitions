import { dbConnect } from 'lib/dbConnect'
import Ticket from 'models/Ticket'
import User from 'models/User'
import Competition from 'models/Competition'
import { verifyPayment } from 'lib/pi/verifyPayment'
import crypto from 'crypto'

// Simple in-memory IP limiter
const recentGifts = new Map()

export default async function handler(req, res) {
  const reqId = req.headers['x-request-id'] || crypto.randomUUID()
  res.setHeader('x-request-id', reqId)
  const LOG  = (...a) => console.log('[OMC][Gift]', reqId, ...a)
  const WARN = (...a) => console.warn('[OMC][Gift]', reqId, ...a)
  const ERR  = (...a) => console.error('[OMC][Gift]', reqId, ...a)

  if (req.method !== 'POST') {
    return res.status(405).json({ success:false, error:'Method not allowed' })
  }

  await dbConnect()

  const {
    fromUsername,
    toUsername,
    competitionSlug,
    competitionId,
    quantity = 1,
    paymentId,
    transaction,
  } = req.body || {}

  LOG('Incoming', {
    fromUsername,
    toUsername,
    competitionId,
    competitionSlug,
    quantity,
    hasPayment: !!paymentId,
  })

  // Basic validation
  if (!fromUsername || !toUsername || (!competitionSlug && !competitionId)) {
    WARN('Missing required fields')
    return res.status(400).json({ success:false, error:'Missing required fields' })
  }
  if (String(fromUsername).toLowerCase() === String(toUsername).toLowerCase()) {
    return res.status(400).json({ success:false, error:'You cannot gift a ticket to yourself' })
  }
  const qtyNum = Math.max(1, parseInt(quantity, 10) || 0)
  if (qtyNum < 1 || qtyNum > 50) {
    return res.status(400).json({ success:false, error:'Quantity must be between 1 and 50' })
  }

  // Simple IP rate limit
  const ip = (req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown').trim()
  const now = Date.now()
  if (recentGifts.has(ip) && now - recentGifts.get(ip) < 15_000) {
    WARN('429 rate limit', { ip })
    return res.status(429).json({ success:false, error:'Please wait 15 seconds between gifts' })
  }

  try {
    // Sender/recipient lookup (case-insensitive)
    const sender = await User.findOne({
      $or: [
        { usernameLower: String(fromUsername).toLowerCase() },
        { username: { $regex: new RegExp(`^${fromUsername}$`, 'i') } },
      ],
    }).lean()
    if (!sender) return res.status(404).json({ success:false, error:'Sender not found' })

    const recipient = await User.findOne({
      $or: [
        { usernameLower: String(toUsername).toLowerCase() },
        { username: { $regex: new RegExp(`^${toUsername}$`, 'i') } },
      ],
    }).lean()
    if (!recipient) return res.status(404).json({ success:false, error:'Recipient not found' })

    // Competition lookup by id or slug
    let competition =
      competitionId
        ? await Competition.findById(competitionId).lean()
        : await Competition.findOne({ 'comp.slug': competitionSlug }).lean()

    if (!competition) {
      return res.status(404).json({ success:false, error:'Competition not found' })
    }

    // Normalize nested shape
    const compData = competition.comp ?? competition
    const compStatus = (compData.status || '').toLowerCase()

    if (compStatus && !['active', 'live'].includes(compStatus)) {
      return res.status(400).json({ success:false, error:'Competition is not active' })
    }

    // Optional: stock guard (read from either level)
    const totalTickets = Number(
      compData.totalTickets ?? competition.totalTickets ?? 0
    )
    const ticketsSold = Number(
      compData.ticketsSold ?? competition.ticketsSold ?? 0
    )
    if (totalTickets > 0 && ticketsSold + qtyNum > totalTickets) {
      return res.status(400).json({ success:false, error:'Not enough tickets remaining' })
    }

    // Compute expected amount
    const entryFee = Number(compData.entryFee || 0)
    const expectedAmount = Number((qtyNum * entryFee).toFixed(8))

    // If the gift costs > 0, require payment & verify. If free, skip verification.
    if (expectedAmount > 0) {
      if (!paymentId || !transaction) {
        return res.status(400).json({ success:false, error:'Missing payment data' })
      }

      let paymentOk = false
      try {
        paymentOk = await verifyPayment({
          paymentId,
          transaction,
          expectedAmount,
          username: sender.username,
          reason: 'gift',
        })
      } catch (ve) {
        ERR('verifyPayment error', ve?.message)
        return res.status(500).json({ success:false, error:'Payment verification error' })
      }

      if (!paymentOk) {
        WARN('Payment verification failed', { paymentId, expectedAmount })
        return res.status(402).json({ success:false, error:'Pi payment verification failed' })
      }
    }

    // Per-user cap for recipient
    const compCap       = Number(compData.maxPerUser || 0)
    const userDefault   = Number(recipient.maxTicketsDefault || 0)
    const overrides     = recipient.maxTicketsOverrides || new Map()
    const overrideCap   = typeof overrides.get === 'function'
      ? overrides.get(String(competition._id))
      : overrides[String(competition._id)] || null
    const effectiveCap  = overrideCap || compCap || userDefault || 0

    if (effectiveCap > 0) {
      const currentCount = await Ticket.countDocuments({
        username: recipient.username,
        competitionSlug: compData.slug || competitionSlug,
      })
      if (currentCount + qtyNum > effectiveCap) {
        return res.status(400).json({
          success:false,
          error:`Recipient ticket limit reached. Max ${effectiveCap}. They currently have ${currentCount}.`
        })
      }
    }

    // Generate ticket numbers & create doc
    const ticketNumbers = Array.from({ length: qtyNum }, (_, i) =>
      `GIFT-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i + 1}`
    )

    // Normalize transaction id variants for storage
    const txId =
      (transaction && (transaction.txId || transaction.txid || transaction.identifier)) || null

    const giftTicket = await Ticket.create({
      username: recipient.username,
      competitionSlug: compData.slug || competitionSlug,
      competitionId: competition._id,
      competitionTitle: competition.title || compData.title,
      imageUrl: competition.imageUrl || competition.thumbnail || '/images/default-prize.png',
      quantity: qtyNum,
      ticketNumbers,
      gifted: true,
      giftedBy: sender.username,
      purchasedAt: new Date(),
      payment: {
        paymentId: paymentId || null,
        transactionId: txId,
        amount: expectedAmount,
        type: 'gift',
      },
    })

    recentGifts.set(ip, now)
    LOG('Gift OK', {
      from: sender.username,
      to: recipient.username,
      comp: compData.title || competition.title,
      qty: qtyNum,
      ticketId: String(giftTicket._id)
    })

    return res.status(200).json({
      success: true,
      ticket: {
        id: giftTicket._id,
        competitionTitle: compData.title || competition.title,
        quantity: qtyNum,
        recipient: recipient.username,
        ticketNumbers,
      },
    })
  } catch (error) {
    ERR('Unhandled', error?.message, error)
    return res.status(500).json({ success:false, error:'Server error while gifting ticket' })
  }
}
