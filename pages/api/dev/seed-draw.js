// pages/api/dev/seed-draw.js

import { getDb } from "@/lib/mongodb";

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const draws = db.collection("draws");

    const drawWeek = "2025-W20"; // Change per test
    const piCode = "PI-" + Math.random().toString(36).substring(2, 6).toUpperCase();

    const newDraw = {
      week: drawWeek,
      piCode,
      winnerId: null,
      status: "pending", // "won" | "missed"
      prizeAmountPi: 1000,
      claimedAt: null,
      expiresAt: null,
    };

    await draws.insertOne(newDraw);

    res.status(200).json({
      message: "✅ New draw seeded",
      data: newDraw,
    });
  } catch (error) {
    console.error("❌ Error in seed-draw:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
