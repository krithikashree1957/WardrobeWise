import { Schema, model, Document, Types } from 'mongoose';

export interface IChatMessage extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, unknown>; // e.g. { intent: 'outfit_request', occasion: 'interview' }
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ChatMessage = model<IChatMessage>('ChatMessage', chatMessageSchema);
