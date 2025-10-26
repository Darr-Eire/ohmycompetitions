// src/lib/skillQuestion.js
// Adjust this import if your bank lives somewhere else
import { skillQuestions } from '@/data/skillQuestions'; 
// Expect an array of { id, question, answers, correctAnswer, difficulty?, tags? }

export function getQuestionById(id) {
  if (!id) return null;
  return skillQuestions.find(q => String(q.id) === String(id)) || null;
}

export function buildValidatedSkillQuestion({ questionId, userAnswer }) {
  const q = getQuestionById(questionId);
  if (!q) throw new Error('invalid-skill-question');

  const isCorrect =
    String(userAnswer).trim() === String(q.correctAnswer).trim();

  return {
    questionId: String(q.id),
    question: q.question,
    answers: q.answers,
    correctAnswer: q.correctAnswer,
    userAnswer: String(userAnswer),
    isCorrect,
    difficulty: q.difficulty || 'easy',
    tags: q.tags || [],
    attemptedAt: new Date(),
  };
}
