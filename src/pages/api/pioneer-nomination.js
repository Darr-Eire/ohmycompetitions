// src/pages/api/pioneer-nomination.js

import { dbConnect } from 'lib/dbConnect';
import PioneerNomination from 'models/PioneerNomination';
import Vote from 'models/Vote';
import User from 'models/User';

// Helper function to get user from request
async function getUserFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  try {
    // Check if user exists in database
    const accessToken = authHeader.replace('Bearer ', '');
    const user = await User.findOne({ accessToken });
    return user;
  } catch (err) {
    console.error('Auth error:', err);
    return null;
  }
}

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case 'POST': {
      const { name, reason, action, userUid } = req.body;

      if (!name || (action !== 'vote' && !reason)) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      try {
        if (action === 'vote') {
          // Check if user is authenticated
          if (!userUid) {
            console.log('❌ Vote attempt without userUid');
            return res.status(401).json({ error: 'You must be logged in to vote' });
          }

          console.log('🔍 Vote attempt:', { name, userUid });

          // Check if user has already voted for ANYONE (one vote per user total)
          const existingVote = await Vote.findOne({ userUid: userUid });

          if (existingVote) {
            console.log('❌ User has already voted:', { 
              userUid, 
              previousVote: existingVote.nomineeName,
              attemptedVote: name 
            });
            return res.status(409).json({ 
              error: `You have already voted for ${existingVote.nomineeName}. You can only vote once per voting period.`,
              previousVote: existingVote.nomineeName
            });
          }

          // Find the nominee
          const nominee = await PioneerNomination.findOne({ name });
          if (!nominee) {
            console.log('❌ Nominee not found:', name);
            return res.status(404).json({ error: 'Nominee not found' });
          }

          console.log('📊 Current nominee data:', {
            name: nominee.name,
            votes: nominee.votes,
          });

          // Create vote record (this will fail if duplicate due to unique constraint)
          try {
            await Vote.create({
              userUid: userUid,
              nomineeName: name,
              createdAt: new Date()
            });
            console.log('✅ Vote record created for:', name);
          } catch (voteError) {
            if (voteError.code === 11000) {
              console.log('❌ Duplicate vote detected by database constraint');
              return res.status(409).json({ error: 'You have already voted. You can only vote once per voting period.' });
            }
            throw voteError;
          }

          // Increment vote count
          nominee.votes = (nominee.votes || 0) + 1;
          
          console.log('✅ Adding vote:', {
            nominee: name,
            newVotes: nominee.votes,
          });

          await nominee.save();

          console.log('💾 Vote saved successfully');
          return res.status(200).json({ 
            message: `Vote recorded for ${name}!`, 
            nominee,
            finalVote: true 
          });
        }

        // For nominations, we can allow without authentication for now
        // Prevent duplicate nominations
        const existing = await PioneerNomination.findOne({ name });
        if (existing) {
          return res.status(409).json({ error: 'This Pioneer has already been nominated.' });
        }

        const newNomination = new PioneerNomination({
          name,
          reason,
          votes: 0,
          voters: [],
          createdAt: new Date(),
        });

        await newNomination.save();

        return res.status(201).json({ message: 'Nomination submitted', newNomination });
      } catch (err) {
        console.error('[❌] Nomination API Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    case 'GET': {
      try {
        const nominations = await PioneerNomination.find().sort({ votes: -1 }).lean();
        return res.status(200).json(nominations);
      } catch (err) {
        console.error('[❌] Fetch nominations failed:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
