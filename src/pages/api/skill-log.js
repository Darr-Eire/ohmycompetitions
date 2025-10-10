import { dbConnect } from 'lib/dbConnect';
import SkillAttempt from 'models/SkillAttempt';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await dbConnect();

  const { competitionSlug, questionId, answerGiven, correct } = req.body;

  if (!competitionSlug || !questionId || !answerGiven) {
    return res.status(400).json({ error: 'Missing data' });
  }

  try {
    const log = new SkillAttempt({
      competitionSlug,
      questionId,
      answerGiven,
      correct,
      attemptedAt: new Date(),
    });

    await log.save();

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Skill log error:', err);
    res.status(500).json({ error: 'Failed to log attempt' });
  }
}
