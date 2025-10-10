import mongoose from 'mongoose';

const PrizeSchema = new mongoose.Schema({
  name: String,
  image: String,
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
  },
});

export default mongoose.models.Prize || mongoose.model('Prize', PrizeSchema);
