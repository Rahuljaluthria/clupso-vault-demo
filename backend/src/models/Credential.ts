import mongoose, { Document, Schema } from 'mongoose';

export interface ICredential extends Document {
  _id: mongoose.Types.ObjectId;
  directoryId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  username: string;
  encryptedPassword: string;
  url?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const credentialSchema = new Schema<ICredential>({
  directoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Directory',
    required: true
  },
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
  username: {
    type: String,
    required: true,
    trim: true
  },
  encryptedPassword: {
    type: String,
    required: true
  },
  url: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
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

// Update the updatedAt field before saving
credentialSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Compound indexes
credentialSchema.index({ userId: 1, directoryId: 1 });
credentialSchema.index({ userId: 1, name: 1 });

export const Credential = mongoose.model<ICredential>('Credential', credentialSchema);