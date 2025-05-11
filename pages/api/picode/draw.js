export default async function handler(req, res) {
  const dbClient = await db();
  const tickets = dbClient.collection("tickets");
  const draws = dbClient.collection("draws");

  const week = getWeekString();
  const activeTickets = await tickets.find({ drawWeek: week, status: "active" }).toArray();
  if (!activeTickets.length) return res.status(404).send("No tickets");

  const winnerTicket = activeTickets[Math.floor(Math.random() * activeTickets.length)];
  const expiresAt = new Date(Date.now() + 31 * 60 * 1000 + 4000);

  await draws.updateOne(
    { week },
    {
      $set: {
        winnerId: winnerTicket.userId,
        expiresAt
      }
    }
  );

  res.status(200).json({ winner: winnerTicket.userId });
}
