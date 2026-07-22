import { Schema, model, Document, Types } from 'mongoose';
import { ClothingCategory } from './ClothingItem';

export type TravelOutfitSlotName = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ITravelChecklistItem {
  label: string;
  category: ClothingCategory;
  available: boolean;
  matchedItem?: Types.ObjectId; // ClothingItem already in the user's wardrobe, if available
}

export interface ITravelOutfitSlot {
  slot: TravelOutfitSlotName;
  top?: Types.ObjectId;
  bottom?: Types.ObjectId;
  shoes?: Types.ObjectId;
  outerwear?: Types.ObjectId;
  accessories: Types.ObjectId[];
  note: string;
}

export interface ITravelDayPlan {
  day: number;
  slots: ITravelOutfitSlot[];
}

export interface ITravelPlan extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;

  destination: string;
  country: string;
  state?: string;
  days: number;
  travelMonth: string;
  purpose: string;

  expectedWeather?: { tempC?: number; condition?: string; description?: string };

  checklist: ITravelChecklistItem[];
  dailyPlans: ITravelDayPlan[];

  createdAt: Date;
  updatedAt: Date;
}

const travelOutfitSlotSchema = new Schema<ITravelOutfitSlot>(
  {
    slot: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'], required: true },
    top: { type: Schema.Types.ObjectId, ref: 'ClothingItem' },
    bottom: { type: Schema.Types.ObjectId, ref: 'ClothingItem' },
    shoes: { type: Schema.Types.ObjectId, ref: 'ClothingItem' },
    outerwear: { type: Schema.Types.ObjectId, ref: 'ClothingItem' },
    accessories: [{ type: Schema.Types.ObjectId, ref: 'ClothingItem' }],
    note: { type: String, default: '' },
  },
  { _id: false }
);

const travelDayPlanSchema = new Schema<ITravelDayPlan>(
  {
    day: { type: Number, required: true },
    slots: [travelOutfitSlotSchema],
  },
  { _id: false }
);

const travelPlanSchema = new Schema<ITravelPlan>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    destination: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String },
    days: { type: Number, required: true, min: 1, max: 60 },
    travelMonth: { type: String, required: true },
    purpose: { type: String, required: true },

    expectedWeather: {
      tempC: Number,
      condition: String,
      description: String,
    },

    checklist: [
      {
        label: { type: String, required: true },
        category: { type: String, required: true },
        available: { type: Boolean, default: false },
        matchedItem: { type: Schema.Types.ObjectId, ref: 'ClothingItem' },
      },
    ],
    dailyPlans: [travelDayPlanSchema],
  },
  { timestamps: true }
);

travelPlanSchema.index({ owner: 1, createdAt: -1 });

export const TravelPlan = model<ITravelPlan>('TravelPlan', travelPlanSchema);
