// pages/api/dev/seed-ghost.js

import { getDb } from "@/lib/mongodb";

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const ghosts = db.collection("ghostWinners");

    const missed = {
      week: "2025-W20",
      userId: "user_123",
      prizeAmount: 1000,
      missedAt: new Date(),
    };

    await ghosts.insertOne(missed);

    res.status(200).json({
      message: "👻 Ghost winner logged",
      data: missed,
    });
  } catch (error) {
    console.error("❌ Error in seed-ghost:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
