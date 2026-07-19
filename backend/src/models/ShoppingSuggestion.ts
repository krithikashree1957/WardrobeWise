import { Schema, model, Document, Types } from 'mongoose';

export interface IShoppingSuggestion extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  imageUrl: string;
  imagePublicId?: string;

  detectedCategory?: string;
  detectedColor?: string;

  matchesWardrobe: Types.ObjectId[]; // ClothingItem ids it pairs well with
  completesOutfits: number; // count of potential complete outfits it would unlock
  worthBuyingScore: number; // 0-100
  verdict: 'worth-it' | 'redundant' | 'situational';
  reasoning?: string;

  createdAt: Date;
}

const shoppingSuggestionSchema = new Schema<IShoppingSuggestion>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String },

    detectedCategory: String,
    detectedColor: String,

    matchesWardrobe: [{ type: Schema.Types.ObjectId, ref: 'ClothingItem' }],
    completesOutfits: { type: Number, default: 0 },
    worthBuyingScore: { type: Number, min: 0, max: 100, default: 0 },
    verdict: { type: String, enum: ['worth-it', 'redundant', 'situational'], default: 'situational' },
    reasoning: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ShoppingSuggestion = model<IShoppingSuggestion>('ShoppingSuggestion', shoppingSuggestionSchema);
