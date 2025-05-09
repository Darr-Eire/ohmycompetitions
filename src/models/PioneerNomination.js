// src/models/PioneerNomination.js

import mongoose from 'mongoose'

const PioneerNominationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  reason: { type: String, required: true },
  votes: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.models.PioneerNomination || mongoose.model('PioneerNomination', PioneerNominationSchema)
