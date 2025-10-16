// src/pages/api/game/details/[slug].js  (adjust path to match yours)
export const runtime = 'nodejs';

import { getDb } from 'lib/db.js';              // ✅ unified connector
import initCORS from '../../../../lib/cors';      // keep your existing CORS helper

export default async function handler(req, res) {
  // CORS first
  const shouldEndRequest = await initCORS(req, res);
  if (shouldEndRequest) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' });
  }

  // Read slug early so it's available in both try/catch
  const slug = String(req.query?.slug || '');

  if (!slug) {
    return res.status(400).json({
      success: false,
      error: 'Missing slug parameter',
      code: 'MISSING_SLUG',
    });
  }

  try {
    const db = await getDb(); // ✅ use unified connector

    // Find by nested field comp.slug with a projection
    const competition = await db.collection('competitions').findOne(
      { 'comp.slug': slug },
      {
        projection: {
          _id: 1,
          'comp.status': 1,
          'comp.ticketsSold': 1,
          'comp.totalTickets': 1,
          'comp.entryFee': 1,
          'comp.startsAt': 1,
          'comp.endsAt': 1,
          'comp.slug': 1,
          'comp.paymentType': 1,
          'comp.piAmount': 1,
          title: 1,
          prize: 1,
          imageUrl: 1,
          location: 1,
          theme: 1,
        },
      }
    );

    if (!competition) {
      console.log('❌ Game not found:', { slug });
      return res.status(404).json({
        success: false,
        error: 'Game not found',
        code: 'GAME_NOT_FOUND',
      });
    }

    // Shape response safely (handle nested comp)
    const data = {
      id: competition._id,
      status: competition.comp?.status ?? 'active',
      ticketsSold: competition.comp?.ticketsSold ?? 0,
      totalTickets: competition.comp?.totalTickets ?? 100,
      entryFee: competition.comp?.entryFee ?? 0,
      startsAt: competition.comp?.startsAt ?? null,
      endsAt: competition.comp?.endsAt ?? null,
      slug: competition.comp?.slug ?? slug,
      paymentType: competition.comp?.paymentType ?? 'pi',
      piAmount: competition.comp?.piAmount ?? null,
      title: competition.title ?? null,
      prize: competition.prize ?? null,
      imageUrl: competition.imageUrl ?? null,
      location: competition.location ?? 'Online',
      theme: competition.theme ?? null,
    };

    console.log('✅ Game details found:', {
      slug,
      title: data.title,
      entryFee: data.entryFee,
      ticketsSold: data.ticketsSold,
      totalTickets: data.totalTickets,
      paymentType: data.paymentType,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('❌ Error fetching game details:', {
      error: error?.message || String(error),
      stack: error?.stack,
      slug,
    });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
