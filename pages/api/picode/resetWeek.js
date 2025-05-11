import db from "@/lib/mongo";
import { generatePiCode, getWeekString } from "@/lib/utils";

export default async function handler(req, res) {
  const dbClient = await db();
  const tickets = dbClient.collection("tickets");
  const draws = dbClient.collection("draws");

  const thisWeek = getWeekString(); // "2025-W21"
  const lastWeek = getWeekString(-1);
  const piCode = generatePiCode();

  const lastTickets = await tickets.find({ drawWeek: lastWeek, status: "active" }).toArray();

  for (const ticket of lastTickets) {
    if (Math.random() <= 0.2) {
      await tickets.insertOne({
        userId: ticket.userId,
        ticketId: `${ticket.ticketId}-r`,
        drawWeek: thisWeek,
        status: "active",
        createdAt: new Date()
      });
    }
  }

  await draws.insertOne({
    week: thisWeek,
    piCode,
    winnerId: null,
    status: "pending",
    prizeAmountPi: 1000, // or pull from previous rollover logic
    claimedAt: null,
    expiresAt: null
  });

  await tickets.updateMany({ drawWeek: lastWeek }, { $set: { status: "used" } });

  res.status(200).json({ success: true, week: thisWeek });
}
