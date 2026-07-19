import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export type Gender = 'men' | 'women' | 'non-binary' | 'prefer-not-to-say';
export type BodyShape = 'athletic' | 'rectangular' | 'inverted-triangle' | 'oval' | 'pear' | 'hourglass';

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password?: string; // absent for Google-only accounts
  googleId?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;

  // Profile
  age?: number;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  skinTone?: string; // hex value e.g. #D2A578
  bodyShape?: BodyShape;
  fashionPreferences: string[]; // e.g. ['Minimal', 'Streetwear']
  country?: string;
  city?: string;

  // Password reset
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    googleId: { type: String, select: false },
    avatarUrl: { type: String },
    isEmailVerified: { type: Boolean, default: false },

    age: { type: Number, min: 13, max: 120 },
    gender: { type: String, enum: ['men', 'women', 'non-binary', 'prefer-not-to-say'] },
    heightCm: { type: Number, min: 50, max: 260 },
    weightKg: { type: Number, min: 20, max: 400 },
    skinTone: { type: String },
    bodyShape: {
      type: String,
      enum: ['athletic', 'rectangular', 'inverted-triangle', 'oval', 'pear', 'hourglass'],
    },
    fashionPreferences: { type: [String], default: [] },
    country: { type: String },
    city: { type: String },

    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>('User', userSchema);
