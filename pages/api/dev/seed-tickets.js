// pages/api/dev/seed-tickets.js

import { getDb } from "@/lib/mongodb";
import { nanoid } from "nanoid"; // install with `npm install nanoid` if not already installed

export default async function handler(req, res) {
  try {
    const db = await getDb(); // Connect to default DB
    const ticketsCollection = db.collection("tickets");

    const drawWeek = "2025-W20";
    const userId = "user_123";

    // 1. Insert 5 new fake tickets
    const newTickets = Array.from({ length: 5 }).map(() => ({
      userId,
      ticketId: nanoid(10), // unique short ID
      drawWeek,
      status: "active",
      createdAt: new Date(),
    }));

    await ticketsCollection.insertMany(newTickets);

    // 2. Fetch and return all active tickets for that week
    const activeTickets = await ticketsCollection
      .find({ drawWeek, status: "active" })
      .toArray();

    res.status(200).json({
      message: `✅ Inserted ${newTickets.length} tickets`,
      data: activeTickets,
    });
  } catch (error) {
    console.error("❌ Error in seed-tickets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
