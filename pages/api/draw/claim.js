// pages/api/draw/claim.js

import { getDb } from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { userId, inputCode, drawWeek } = req.body;

  if (!userId || !inputCode || !drawWeek) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const db = await getDb();
    const draws = db.collection("draws");
    const ghosts = db.collection("ghostWinners");

    const currentDraw = await draws.findOne({ week: drawWeek });

    if (!currentDraw) {
      return res.status(404).json({ error: "Draw not found" });
    }

    if (currentDraw.status !== "pending") {
      return res.status(400).json({ error: "Draw already completed" });
    }

    if (currentDraw.winnerId !== userId) {
      return res.status(403).json({ error: "You are not the selected winner" });
    }

    const now = new Date();
    const expired = new Date(currentDraw.expiresAt) < now;
    const correctCode = currentDraw.piCode === inputCode.trim();

    if (expired || !correctCode) {
      // 1. Mark draw as missed
      await draws.updateOne(
        { week: drawWeek },
        { $set: { status: "missed", claimedAt: null } }
      );

      // 2. Log ghost
      await ghosts.insertOne({
        week: drawWeek,
        userId,
        prizeAmount: currentDraw.prizeAmountPi,
        missedAt: now,
      });

      // 3. Add to next week's draw prize
      const [prefix, num] = drawWeek.split("-W");
      const nextWeek = `${prefix}-W${parseInt(num) + 1}`;

      await draws.updateOne(
        { week: nextWeek },
        { $inc: { prizeAmountPi: currentDraw.prizeAmountPi } },
        { upsert: true }
      );

      return res.status(400).json({ error: "❌ Missed. Prize rolled over." });
    }

    // ✅ Claim successful
    await draws.updateOne(
      { week: drawWeek },
      {
        $set: {
          status: "won",
          claimedAt: now,
        },
      }
    );

    return res.status(200).json({ message: "✅ Prize claimed successfully!" });
  } catch (err) {
    console.error("❌ Error in claim:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
