import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface ITrustedDevice {
  deviceId: string;
  browser: string;
  os: string;
  addedAt: Date;
  trustedUntil: Date;
}

interface IPendingDevice {
  deviceId: string;
  token: string;
  browser: string;
  os: string;
  expiresAt: Date;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  phoneNumber?: string;
  totpSecret?: string;
  totpEnabled: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  trustedDevices: ITrustedDevice[];
  pendingDevice?: IPendingDevice;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phoneNumber: {
    type: String,
    sparse: true
  },
  totpSecret: {
    type: String,
    select: false // Don't return this by default for security
  },
  totpEnabled: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  trustedDevices: [{
    deviceId: {
      type: String,
      required: true
    },
    browser: String,
    os: String,
    addedAt: {
      type: Date,
      default: Date.now
    },
    trustedUntil: {
      type: Date,
      required: true
    }
  }],
  pendingDevice: {
    deviceId: String,
    token: String,
    browser: String,
    os: String,
    expiresAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);