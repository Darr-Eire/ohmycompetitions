export default async function handler(req, res) {
  const { userId, inputCode } = req.body;

  const dbClient = await db();
  const draws = dbClient.collection("draws");
  const ghost = dbClient.collection("ghostWinners");

  const draw = await draws.findOne({ winnerId: userId, status: "pending" });
  if (!draw) return res.status(403).send("Not this week’s winner");
  if (Date.now() > new Date(draw.expiresAt)) {
    // Missed it
    await draws.updateOne({ week: draw.week }, { $set: { status: "missed" } });
    await ghost.insertOne({
      week: draw.week,
      userId,
      prizeAmount: draw.prizeAmountPi,
      missedAt: new Date()
    });
    return res.status(410).send("Too late. You missed it.");
  }

  if (inputCode !== draw.piCode) return res.status(400).send("Incorrect code");

  await draws.updateOne(
    { week: draw.week },
    { $set: { status: "won", claimedAt: new Date() } }
  );

  res.status(200).json({ success: true, prize: draw.prizeAmountPi });
}
