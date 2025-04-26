// pages/api/competitions.js

export default function handler(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  
    // TODO: replace with real DB call
    const competitions = [
      { title: 'Photo Contest', slug: 'photo-contest', entryFee: 1, currency: 'PI' },
      { title: 'Art Giveaway', slug: 'art-giveaway', entryFee: 2, currency: 'PI' },
      { title: 'Trivia Challenge', slug: 'trivia-challenge', entryFee: 0.5, currency: 'PI' },
    ];
  
    res.status(200).json({ competitions });
  }
  