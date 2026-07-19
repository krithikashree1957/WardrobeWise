import { Schema, model, Document, Types } from 'mongoose';

/**
 * Virtual avatar customization profile.
 *
 * Designed so a future Ready Player Me (or similar) integration can be
 * dropped in later: `provider` + `externalAvatarUrl`/`externalAvatarId`
 * are reserved for that purpose, while the base fields below drive the
 * current in-house 2D/SVG avatar renderer.
 */
export interface IAvatar extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;

  hairStyle: string;
  hairColor: string;
  faceShape: string;
  skinTone: string;
  heightCm: number;
  bodyShape: string;

  // Reserved for future 3rd-party avatar providers (e.g. Ready Player Me)
  provider: 'internal' | 'ready-player-me';
  externalAvatarId?: string;
  externalAvatarUrl?: string;

  currentOutfitPreview?: Types.ObjectId; // ref Outfit

  createdAt: Date;
  updatedAt: Date;
}

const avatarSchema = new Schema<IAvatar>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    hairStyle: { type: String, default: 'short-wavy' },
    hairColor: { type: String, default: '#2D1F1A' },
    faceShape: { type: String, default: 'oval' },
    skinTone: { type: String, default: '#D2A578' },
    heightCm: { type: Number, default: 170 },
    bodyShape: { type: String, default: 'rectangular' },

    provider: { type: String, enum: ['internal', 'ready-player-me'], default: 'internal' },
    externalAvatarId: { type: String },
    externalAvatarUrl: { type: String },

    currentOutfitPreview: { type: Schema.Types.ObjectId, ref: 'Outfit' },
  },
  { timestamps: true }
);

export const Avatar = model<IAvatar>('Avatar', avatarSchema);
