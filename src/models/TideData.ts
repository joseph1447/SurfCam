import mongoose from 'mongoose';

// Schema for individual tide entry
const tideEntrySchema = new mongoose.Schema({
  time: { type: Date, required: true },
  height: { type: Number, required: true },
  type: { type: String, enum: ['high', 'low'], required: true } // high = pleamar, low = bajamar
});

// Schema for daily tide data
const dailyTideDataSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  dayOfWeek: { type: String, required: true },
  lunarPhase: { type: String },
  sunrise: { type: String },
  sunset: { type: String },
  tides: [tideEntrySchema],
  coefficient: {
    value: { type: Number },
    level: { type: String, enum: ['bajo', 'medio', 'alto'] }
  },
  fishingActivity: { type: String },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
});

// Main tide data schema for multiple days
const tideDataSchema = new mongoose.Schema({
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  dailyData: [dailyTideDataSchema],
  currentHeight: {
    type: Number,
    required: true
  },
  nextHighTide: {
    time: { type: Date, required: true },
    height: { type: Number, required: true }
  },
  nextLowTide: {
    time: { type: Date, required: true },
    height: { type: Number, required: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

tideDataSchema.index({ 'dailyData.date': 1 });
tideDataSchema.index({ createdAt: 1 });

export default mongoose.models.TideData || mongoose.model('TideData', tideDataSchema);
