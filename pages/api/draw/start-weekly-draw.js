// pages/api/draw/start-weekly-draw.js

import { getDb } from "@/lib/mongodb";
import { nanoid } from "nanoid";

const LAST_WEEK = "2025-W19";
const THIS_WEEK = "2025-W20";

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const tickets = db.collection("tickets");
    const draws = db.collection("draws");

    // 1. Mark last week’s tickets as used
    await tickets.updateMany(
      { drawWeek: LAST_WEEK, status: "active" },
      { $set: { status: "used" } }
    );

    // 2. Carry forward 20% of tickets
    const lastWeekTickets = await tickets.find({ drawWeek: LAST_WEEK }).toArray();

    const carryOver = [];
    const byUser = groupByUser(lastWeekTickets);

    for (const userId in byUser) {
      const userTickets = byUser[userId];
      const carryCount = Math.floor(userTickets.length * 0.2);

      const selected = userTickets.slice(0, carryCount);
      selected.forEach((t) => {
        carryOver.push({
          userId,
          ticketId: nanoid(10),
          drawWeek: THIS_WEEK,
          status: "active",
          createdAt: new Date(),
        });
      });
    }

    if (carryOver.length > 0) await tickets.insertMany(carryOver);

    // 3. Get active tickets for THIS_WEEK
    const eligible = await tickets.find({ drawWeek: THIS_WEEK, status: "active" }).toArray();
    if (eligible.length === 0) {
      return res.status(200).json({ message: "No eligible tickets to draw." });
    }

    // 4. Randomly select a winner
    const winnerTicket = eligible[Math.floor(Math.random() * eligible.length)];
    const winnerId = winnerTicket.userId;

    // 5. Generate draw
    const piCode = "PI-" + nanoid(4).toUpperCase();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 31 * 60 * 1000 + 4 * 1000); // 31min 4s

    const newDraw = {
      week: THIS_WEEK,
      piCode,
      winnerId,
      status: "pending",
      prizeAmountPi: 1000,
      claimedAt: null,
      expiresAt,
    };

    await draws.insertOne(newDraw);

    res.status(200).json({
      message: `🎯 Weekly draw created`,
      draw: newDraw,
      totalTickets: eligible.length,
      carryOverTickets: carryOver.length,
    });
  } catch (err) {
    console.error("❌ Weekly draw error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Helper: Group tickets by user
function groupByUser(tickets) {
  return tickets.reduce((acc, t) => {
    acc[t.userId] = acc[t.userId] || [];
    acc[t.userId].push(t);
    return acc;
  }, {});
}
