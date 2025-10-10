import mongoose from 'mongoose'

const GameResultSchema = new mongoose.Schema({
  userUid: { type: String, required: true },
  game: { type: String, enum: ['spin', 'reflex', 'slot', 'vault', 'mystery_box', 'hack_vault', 'match_pi'], required: true },
  result: String, // e.g. 'Win 5 Pi', 'No win', '1 extra ticket'
  prizeAmount: Number, // if Pi, tickets, etc.
  metadata: mongoose.Schema.Types.Mixed, // Additional data for complex games
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.GameResult || mongoose.model('GameResult', GameResultSchema)
