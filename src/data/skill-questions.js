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

  // Pi Network
  { id: 'pi-coin-name', question: 'What is Pi Network’s native coin called?', answers: ['pi', 'π'], tags: ['pi'], difficulty: 'easy' },
  { id: 'pi-symbol', question: 'What symbol represents Pi Network’s coin?', answers: ['π', 'pi'], tags: ['pi'], difficulty: 'easy' },
  { id: 'pi-users-name', question: 'What is the community nickname for Pi Network users?', answers: ['pioneer', 'pioneers'], tags: ['pi'], difficulty: 'easy' },
  { id: 'pi-kyc', question: 'In Pi Network, what does KYC stand for?', answers: ['know your customer'], tags: ['pi'], difficulty: 'easy' },
  { id: 'pi-mining-button', question: 'Which button do you press to start a new Pi mining session?', answers: ['lightning', '⚡', 'bolt', 'thunder', 'flash', 'lightning button'], tags: ['pi'], difficulty: 'easy' },

  /* Global general knowledge */
  { id: 'capital-france', question: 'What is the capital of France?', answers: ['paris'], tags: ['general', 'geography'], difficulty: 'easy' },
  { id: 'largest-ocean', question: 'What is the largest ocean on Earth?', answers: ['pacific', 'pacific ocean'], tags: ['general', 'geography'], difficulty: 'easy' },
  { id: 'continents-count', question: 'How many continents are there on Earth?', answers: ans(7), tags: ['general', 'geography'], difficulty: 'easy' },
  { id: 'leap-year-days', question: 'How many days are in a leap year?', answers: ans(366), tags: ['general'], difficulty: 'easy' },
  { id: 'alphabet-letters', question: 'How many letters are in the English alphabet?', answers: ans(26), tags: ['general'], difficulty: 'easy' },
  { id: 'planet-earth', question: 'What planet do humans live on?', answers: ['earth'], tags: ['general', 'space'], difficulty: 'easy' },
  { id: 'human-breathe', question: 'Which gas do humans primarily breathe in?', answers: ['oxygen', 'o2'], tags: ['general', 'science'], difficulty: 'easy' },
  { id: 'brazil-language', question: 'What is the official language of Brazil?', answers: ['portuguese'], tags: ['general', 'language', 'geography'], difficulty: 'easy' },
  { id: 'mix-red-blue', question: 'What color do you get when you mix red and blue?', answers: ['purple', 'violet'], tags: ['general', 'colors'], difficulty: 'easy' },
  { id: 'opposite-hot', question: 'What is the opposite of hot?', answers: ['cold'], tags: ['general'], difficulty: 'easy' },

  // Universal facts with numeric answers
  { id: 'week-days',  question: 'How many days are in a week?',          answers: ans(7),  tags: ['general'], difficulty: 'easy' },
  { id: 'months',     question: 'How many months are in a year?',        answers: ans(12), tags: ['general'], difficulty: 'easy' },
  { id: 'hour-mins',  question: 'How many minutes are in an hour?',      answers: ans(60), tags: ['general'], difficulty: 'easy' },
  { id: 'square-sides', question: 'How many sides does a square have?',  answers: ans(4),  tags: ['general'], difficulty: 'easy' },
  { id: 'bicycle-wheels', question: 'How many wheels does a bicycle have?', answers: ans(2), tags: ['general'], difficulty: 'easy' },
  { id: 'cat-legs',   question: 'How many legs does a cat usually have?', answers: ans(4), tags: ['general'], difficulty: 'easy' },
  { id: 'after-9',    question: 'What number comes after 9?',            answers: ans(10), tags: ['general'], difficulty: 'easy' },
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

// Find a question by id
export function getQuestionById(id) {
  return SKILL_QUESTIONS.find(q => String(q.id) === String(id)) || null;
}

// Check correctness (accepts digits or word forms)
export function isCorrectAnswer(questionObj, userAnswer) {
  if (!questionObj) return false;
  const ua = normalize(userAnswer);
  return (questionObj.answers || []).some((a) => normalize(a) === ua);
}

// Convenience: id-based correctness (optional, handy in tests)
export function isCorrectAnswerById(id, userAnswer) {
  return isCorrectAnswer(getQuestionById(id), userAnswer);
}
