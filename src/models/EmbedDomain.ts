import mongoose, { Document, Schema } from 'mongoose';

export interface IEmbedDomain extends Document {
  domain: string;
  label: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const embedDomainSchema = new Schema<IEmbedDomain>({
  domain: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

embedDomainSchema.index({ domain: 1 });
embedDomainSchema.index({ isActive: 1 });

export default mongoose.models.EmbedDomain || mongoose.model<IEmbedDomain>('EmbedDomain', embedDomainSchema);
