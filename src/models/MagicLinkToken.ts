import mongoose from 'mongoose';

const magicLinkTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.MagicLinkToken || mongoose.model('MagicLinkToken', magicLinkTokenSchema);
