import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  username: { type: String, index: true },
  type: { type: String, enum: ['win', 'voucher', 'gift'], required: true },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  href: { type: String, default: '' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);


