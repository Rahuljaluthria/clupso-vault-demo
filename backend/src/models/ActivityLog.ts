import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  details: string;
  ipAddress?: string;
  browser?: string;
  os?: string;
  deviceId?: string;
  success: boolean;
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  browser: {
    type: String,
    trim: true
  },
  os: {
    type: String,
    trim: true
  },
  deviceId: {
    type: String,
    trim: true
  },
  success: {
    type: Boolean,
    default: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for querying user activities
activityLogSchema.index({ userId: 1, timestamp: -1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);