export function getWeekString(offset = 0) {
  const now = new Date();
  now.setDate(now.getDate() + offset * 7);
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

export function generatePiCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return `PI-${Array(4).fill(0).map(() => letters[Math.floor(Math.random() * letters.length)]).join("")}`;
}
