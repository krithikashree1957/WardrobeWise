import { Schema, model, Document, Types } from 'mongoose';

export interface IOutfitReasoning {
  weatherSuitability?: string;
  occasionSuitability?: string;
  colorHarmony?: string;
  comfortScore?: number; // 0-100
  overallReasoning?: string;
}

export interface IOutfit extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  name: string;

  top?: Types.ObjectId;
  bottom?: Types.ObjectId;
  shoes?: Types.ObjectId;
  accessories: Types.ObjectId[];
  outerwear?: Types.ObjectId;

  mood?: string;
  occasion?: string;
  weatherContext?: { tempC?: number; condition?: string; city?: string };

  confidenceScore: number; // 0-100
  reasoning: IOutfitReasoning;
  colorTheoryScheme?: 'complementary' | 'analogous' | 'triadic' | 'monochromatic' | 'split-complementary';

  isSaved: boolean;
  isWorn: boolean;
  wornAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const outfitSchema = new Schema<IOutfit>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, default: 'AI Generated Outfit' },

    top: { type: Schema.Types.ObjectId, ref: 'ClothingItem' },
    bottom: { type: Schema.Types.ObjectId, ref: 'ClothingItem' },
    shoes: { type: Schema.Types.ObjectId, ref: 'ClothingItem' },
    accessories: [{ type: Schema.Types.ObjectId, ref: 'ClothingItem' }],
    outerwear: { type: Schema.Types.ObjectId, ref: 'ClothingItem' },

    mood: { type: String },
    occasion: { type: String },
    weatherContext: {
      tempC: Number,
      condition: String,
      city: String,
    },

    confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
    reasoning: {
      weatherSuitability: String,
      occasionSuitability: String,
      colorHarmony: String,
      comfortScore: { type: Number, min: 0, max: 100 },
      overallReasoning: String,
    },
    colorTheoryScheme: {
      type: String,
      enum: ['complementary', 'analogous', 'triadic', 'monochromatic', 'split-complementary'],
    },

    isSaved: { type: Boolean, default: false },
    isWorn: { type: Boolean, default: false },
    wornAt: { type: Date },
  },
  { timestamps: true }
);

export const Outfit = model<IOutfit>('Outfit', outfitSchema);
