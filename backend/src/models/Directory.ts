import mongoose, { Document, Schema } from 'mongoose';

export interface IDirectory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  icon?: string;
  createdAt: Date;
}

const directorySchema = new Schema<IDirectory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    default: 'folder'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for user directories
directorySchema.index({ userId: 1, name: 1 });

export const Directory = mongoose.model<IDirectory>('Directory', directorySchema);