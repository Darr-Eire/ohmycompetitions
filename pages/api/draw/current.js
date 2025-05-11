// pages/api/draw/current.js

import { getDb } from "@/lib/mongodb";

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const draws = db.collection("draws");

    const currentDraw = await draws.findOne({ status: "pending" }); // assuming only the current week's draw has "pending" status

    if (!currentDraw) {
      return res.status(404).json({ error: "No active draw found." });
    }

    res.status(200).json(currentDraw);
  } catch (error) {
    console.error("❌ Error fetching current draw:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
