import mongoose from 'mongoose';
const { Schema } = mongoose;

const ReferralEventSchema = new Schema({
  referrerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  refereeId:  { type: Schema.Types.ObjectId, ref: 'User', index: true },
  type: { type: String, enum: ['CLICK','SIGNUP','QUALIFIED'], index: true },
  at: { type: Date, default: Date.now },
  deviceHash: String,
  ip: String,
}, { timestamps: true });

export default mongoose.models.ReferralEvent || mongoose.model('ReferralEvent', ReferralEventSchema);
