import { Schema, model, Document, Types } from 'mongoose';

export type ClothingCategory =
  | 'top' | 'shirt' | 'pants' | 'jeans' | 'dress' | 'saree'
  | 'shoes' | 'bag' | 'watch' | 'jewellery' | 'jacket' | 'accessory';

export type LaundryStatus = 'clean' | 'worn-once' | 'needs-washing' | 'ironed';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all-season';
export type Occasion = 'college' | 'office' | 'interview' | 'party' | 'wedding' | 'festival' | 'vacation' | 'gym' | 'casual';

export interface IAIDetection {
  clothingType?: string;
  fabric?: string;
  color?: string;
  pattern?: string;
  sleeveLength?: string;
  formality?: string;
  confidenceScore?: number; // 0-100
  detectedAt?: Date;
}

export interface IClothingItem extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  imageUrl: string;
  imagePublicId?: string;

  category: ClothingCategory;
  material?: string;
  brand?: string;
  color: string;
  pattern?: string;
  sleeveLength?: string;
  season: Season[];
  occasion: Occasion[];
  purchaseDate?: Date;
  price?: number;
  notes?: string;

  aiDetection?: IAIDetection;

  laundryStatus: LaundryStatus;
  isFavorite: boolean;
  timesWorn: number;
  lastWornAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const clothingItemSchema = new Schema<IClothingItem>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String },

    category: {
      type: String,
      required: true,
      enum: ['top', 'shirt', 'pants', 'jeans', 'dress', 'saree', 'shoes', 'bag', 'watch', 'jewellery', 'jacket', 'accessory'],
      index: true,
    },
    material: { type: String },
    brand: { type: String },
    color: { type: String, required: true },
    pattern: { type: String },
    sleeveLength: { type: String },
    season: {
      type: [String],
      enum: ['spring', 'summer', 'autumn', 'winter', 'all-season'],
      default: ['all-season'],
    },
    occasion: {
      type: [String],
      enum: ['college', 'office', 'interview', 'party', 'wedding', 'festival', 'vacation', 'gym', 'casual'],
      default: ['casual'],
    },
    purchaseDate: { type: Date },
    price: { type: Number, min: 0 },
    notes: { type: String },

    aiDetection: {
      clothingType: String,
      fabric: String,
      color: String,
      pattern: String,
      sleeveLength: String,
      formality: String,
      confidenceScore: Number,
      detectedAt: Date,
    },

    laundryStatus: {
      type: String,
      enum: ['clean', 'worn-once', 'needs-washing', 'ironed'],
      default: 'clean',
    },
    isFavorite: { type: Boolean, default: false },
    timesWorn: { type: Number, default: 0 },
    lastWornAt: { type: Date },
  },
  { timestamps: true }
);

clothingItemSchema.index({ owner: 1, category: 1 });
clothingItemSchema.index({ owner: 1, color: 1 });
clothingItemSchema.index({ owner: 1, brand: 1 });

export const ClothingItem = model<IClothingItem>('ClothingItem', clothingItemSchema);
