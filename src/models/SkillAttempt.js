import mongoose from 'mongoose';

const SkillAttemptSchema = new mongoose.Schema({
  competitionSlug: String,
  questionId: Number,
  answerGiven: String,
  correct: Boolean,
  attemptedAt: Date,
});

export default mongoose.models.SkillAttempt || mongoose.model('SkillAttempt', SkillAttemptSchema);
