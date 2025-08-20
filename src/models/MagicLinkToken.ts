import mongoose from 'mongoose';

const magicLinkTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true }, // 6-digit code
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.MagicLinkToken || mongoose.model('MagicLinkToken', magicLinkTokenSchema);
