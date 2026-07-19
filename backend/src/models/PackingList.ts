import { Schema, model, Document, Types } from 'mongoose';

export interface IPackingItem {
  label: string;
  category: string;
  packed: boolean;
  clothingItem?: Types.ObjectId;
}

export interface IPackingList extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  destination: string;
  startDate?: Date;
  days: number;
  expectedWeather?: { tempMinC?: number; tempMaxC?: number; condition?: string };
  items: IPackingItem[];
  createdAt: Date;
  updatedAt: Date;
}

const packingListSchema = new Schema<IPackingList>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    destination: { type: String, required: true },
    startDate: { type: Date },
    days: { type: Number, required: true, min: 1 },
    expectedWeather: {
      tempMinC: Number,
      tempMaxC: Number,
      condition: String,
    },
    items: [
      {
        label: { type: String, required: true },
        category: { type: String, required: true },
        packed: { type: Boolean, default: false },
        clothingItem: { type: Schema.Types.ObjectId, ref: 'ClothingItem' },
      },
    ],
  },
  { timestamps: true }
);

export const PackingList = model<IPackingList>('PackingList', packingListSchema);
