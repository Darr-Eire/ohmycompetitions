// src/models/EverydayEntry.js

import mongoose from 'mongoose';

const EverydayEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  tickets: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.EverydayEntry || mongoose.model('EverydayEntry', EverydayEntrySchema);
