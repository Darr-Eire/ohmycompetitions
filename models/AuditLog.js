import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  competitionId: String,
  randomnessSeed: String,
  winnerEntryId: String,
  payoutTx: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
