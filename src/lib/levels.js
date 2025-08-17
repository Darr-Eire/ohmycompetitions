// lib/levels.js

// Define XP thresholds for each level
const levels = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 100 },
  { level: 3, xpRequired: 300 },
  { level: 4, xpRequired: 600 },
  { level: 5, xpRequired: 1000 },
  // add more levels as needed
]

// Utility: find level from XP
export function getLevelFromXP(xp) {
  let current = levels[0]
  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].xpRequired) {
      current = levels[i]
    } else {
      break
    }
  }
  return current
}

// Utility: XP needed for next level
export function getNextLevelXP(xp) {
  const current = getLevelFromXP(xp)
  const next = levels.find(l => l.level === current.level + 1)
  return next ? next.xpRequired : null // null if max level
}

export default levels
