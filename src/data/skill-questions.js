// src/data/skill-questions.js

// Normalize: lower-case, trim, collapse spaces, strip punctuation (unicode-safe)
const normalize = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '');

// Handy number-word synonyms (English) so "four" equals "4"
const words = {
  '0': ['zero'],
  '1': ['one'],
  '2': ['two'],
  '3': ['three'],
  '4': ['four'],
  '5': ['five'],
  '6': ['six'],
  '7': ['seven'],
  '8': ['eight'],
  '9': ['nine'],
  '10': ['ten'],
  '12': ['twelve'],
  '24': ['twenty four', 'twenty-four'],
  '30': ['thirty'],
  '60': ['sixty'],
};

function ans(numOrText) {
  // Build an answers array with both digit and word forms when numeric
  const n = Number(numOrText);
  if (Number.isFinite(n)) {
    const key = String(n);
    return [key, ...(words[key] ?? [])];
  }
  return [String(numOrText)];
}

export const SKILL_QUESTIONS = [
  // Easy maths
  { id: '2+2',  question: 'What is 2 + 2?',  answers: ans(4),  tags: ['math'], difficulty: 'easy' },
  { id: '5+3',  question: 'What is 5 + 3?',  answers: ans(8),  tags: ['math'], difficulty: 'easy' },
  { id: '10-4', question: 'What is 10 − 4?', answers: ans(6),  tags: ['math'], difficulty: 'easy' },
  { id: '6x2',  question: 'What is 6 × 2?',  answers: ans(12), tags: ['math'], difficulty: 'easy' },
  { id: '12/3', question: 'What is 12 ÷ 3?', answers: ans(4),  tags: ['math'], difficulty: 'easy' },
  { id: '3x3',  question: 'What is 3 × 3?',  answers: ans(9),  tags: ['math'], difficulty: 'easy' },
  { id: '9-3',  question: 'What is 9 − 3?',  answers: ans(6),  tags: ['math'], difficulty: 'easy' },

  // Universal facts with numeric answers
  { id: 'week-days',  question: 'How many days are in a week?',         answers: ans(7),  tags: ['general'], difficulty: 'easy' },
  { id: 'months',     question: 'How many months are in a year?',       answers: ans(12), tags: ['general'], difficulty: 'easy' },
  { id: 'hour-mins',  question: 'How many minutes are in an hour?',     answers: ans(60), tags: ['general'], difficulty: 'easy' },
  { id: 'square-sides', question: 'How many sides does a square have?', answers: ans(4),  tags: ['general'], difficulty: 'easy' },
  { id: 'bicycle-wheels', question: 'How many wheels does a bicycle have?', answers: ans(2), tags: ['general'], difficulty: 'easy' },
  { id: 'cat-legs',   question: 'How many legs does a cat usually have?', answers: ans(4), tags: ['general'], difficulty: 'easy' },
  { id: 'after-9',    question: 'What number comes after 9?',          answers: ans(10), tags: ['general'], difficulty: 'easy' },
];

// Random question (optionally filter by tags/difficulty)
export function getRandomQuestion({ tags = [], difficulty } = {}) {
  let pool = SKILL_QUESTIONS;
  if (tags.length) {
    const set = new Set(tags.map(t => t.toLowerCase()));
    pool = pool.filter(q => (q.tags || []).some(t => set.has(String(t).toLowerCase())));
  }
  if (difficulty) pool = pool.filter(q => q.difficulty === difficulty);
  if (!pool.length) pool = SKILL_QUESTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Check correctness (accepts digits or word forms)
export function isCorrectAnswer(questionObj, userAnswer) {
  if (!questionObj) return false;
  const ua = normalize(userAnswer);
  return (questionObj.answers || []).some((a) => normalize(a) === ua);
}
