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

  LOG('Incoming', { fromUsername, toUsername, competitionId, competitionSlug, quantity, hasPayment:!!paymentId })

  if (!fromUsername || !toUsername || (!competitionSlug && !competitionId)) {
    WARN('Missing required fields')
    return res.status(400).json({ success:false, error:'Missing required fields' })
  }
  if (String(fromUsername).toLowerCase() === String(toUsername).toLowerCase()) {
    return res.status(400).json({ success:false, error:'You cannot gift a ticket to yourself' })
  }
  if (+quantity < 1 || +quantity > 50) {
    return res.status(400).json({ success:false, error:'Quantity must be between 1 and 50' })
  }

  const ip = (req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown').trim()
  const now = Date.now()
  if (recentGifts.has(ip) && now - recentGifts.get(ip) < 15_000) {
    WARN('429 rate limit', { ip })
    return res.status(429).json({ success:false, error:'Please wait 15 seconds between gifts' })
  }

  try {
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

    let competition =
      competitionId
        ? await Competition.findById(competitionId).lean()
        : await Competition.findOne({ 'comp.slug': competitionSlug }).lean()
    if (!competition) return res.status(404).json({ success:false, error:'Competition not found' })

    if (competition.comp?.status !== 'active') {
      return res.status(400).json({ success:false, error:'Competition is not active' })
    }

    // Optional: stock guard
    const total = Number(competition.totalTickets || 0)
    const sold  = Number(competition.ticketsSold || 0)
    if (total > 0 && sold + Number(quantity) > total) {
      return res.status(400).json({ success:false, error:'Not enough tickets remaining' })
    }

    const entryFee = Number(competition.comp?.entryFee || 0)
    const expectedAmount = Number(quantity) * entryFee

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

    // Per-user cap for recipient (supports Map or object)
    const compCap       = Number(competition.comp?.maxPerUser || 0)
    const userDefault   = Number(recipient.maxTicketsDefault || 0)
    const overrides     = recipient.maxTicketsOverrides || new Map()
    const overrideCap   = typeof overrides.get === 'function'
      ? overrides.get(String(competition._id))
      : overrides[String(competition._id)] || null
    const effectiveCap  = overrideCap || compCap || userDefault || 0

    if (effectiveCap > 0) {
      const currentCount = await Ticket.countDocuments({
        username: recipient.username,
        competitionSlug: competition.comp?.slug || competitionSlug,
      })
      if (currentCount + Number(quantity) > effectiveCap) {
        return res.status(400).json({
          success:false,
          error:`Recipient ticket limit reached. Max ${effectiveCap}. They currently have ${currentCount}.`
        })
      }
    }

    // Generate ticket numbers & create doc
    const ticketNumbers = Array.from({ length: Number(quantity) }, (_, i) =>
      `GIFT-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i + 1}`
    )

    const giftTicket = await Ticket.create({
      username: recipient.username,
      competitionSlug: competition.comp?.slug || competitionSlug,
      competitionId: competition._id,
      competitionTitle: competition.title,
      imageUrl: competition.imageUrl || competition.thumbnail || '/images/default-prize.png',
      quantity: parseInt(quantity, 10),
      ticketNumbers,
      gifted: true,
      giftedBy: sender.username,
      purchasedAt: new Date(),
      payment: {
        paymentId,
        transactionId: transaction.identifier || transaction.txid || null,
        amount: expectedAmount,
        type: 'gift',
      },
    })

    recentGifts.set(ip, now)
    LOG('Gift OK', { from: sender.username, to: recipient.username, comp: competition.title, qty: Number(quantity), ticketId: String(giftTicket._id) })

    return res.status(200).json({
      success: true,
      ticket: {
        id: giftTicket._id,
        competitionTitle: competition.title,
        quantity,
        recipient: recipient.username,
        ticketNumbers,
      },
    })
  } catch (error) {
    ERR('Unhandled', error?.message)
    return res.status(500).json({ success:false, error:'Server error while gifting ticket' })
  }
}
