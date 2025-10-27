import mongoose, { Document, Schema } from 'mongoose';

export interface ICalculatorConfig extends Document {
  isEnabled: boolean;
  buttonText: string;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  updatedAt: Date;
  createdAt: Date;
}

const CalculatorConfigSchema = new Schema<ICalculatorConfig>({
  isEnabled: {
    type: Boolean,
    default: true,
    required: true
  },
  buttonText: {
    type: String,
    default: '¿Cuál es mi modelo de tabla?',
    required: true,
    maxlength: 100
  },
  position: {
    type: String,
    enum: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
    default: 'top-right',
    required: true
  }
}, {
  timestamps: true
});

// Ensure only one config document exists by using a singleton pattern
CalculatorConfigSchema.statics.getSingleton = async function() {
  let config = await this.findOne();
  if (!config) {
    config = new this({
      isEnabled: true,
      buttonText: '¿Cuál es mi modelo de tabla?',
      position: 'top-right'
    });
    await config.save();
  }
  return config;
};

export default mongoose.models.CalculatorConfig || mongoose.model<ICalculatorConfig>('CalculatorConfig', CalculatorConfigSchema);
