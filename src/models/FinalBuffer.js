// file: src/models/FinalBuffer.js
import mongoose from 'mongoose';

const FinalBufferSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'default', index: true },
  userIds: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.models.FinalBuffer
  || mongoose.model('FinalBuffer', FinalBufferSchema);
