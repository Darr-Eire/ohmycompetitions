// src/lib/utils.js

function generateRandomCode() {
  return (
    Math.random().toString(36).substring(2, 6).toUpperCase() +
    '-' +
    Math.random().toString(36).substring(2, 6).toUpperCase()
  )
}

function getPiCashTimes() {
  const monday = new Date()
  monday.setUTCDate(monday.getUTCDate() + ((1 + 7 - monday.getUTCDay()) % 7))
  monday.setUTCHours(15, 14, 0, 0)

  const codeExpiresAt = new Date(monday.getTime() + (31 * 60 + 4) * 60 * 1000) // 31h 4m later
  const drawAt = new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000) // Friday
  drawAt.setUTCHours(15, 14, 0, 0)

  const claimExpiresAt = new Date(drawAt.getTime() + (31 * 60 + 4) * 1000) // 31m 4s later

  return {
    code: generateRandomCode(),
    weekStart: monday,
    expiresAt: codeExpiresAt,
    drawAt,
    claimExpiresAt,
    prizePool: 10000,
    claimed: false,
    winner: null,
    rolloverFrom: null
  }
}

module.exports = {
  getPiCashTimes
}
