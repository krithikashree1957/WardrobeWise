import mongoose from 'mongoose';
import { env } from './env';

/**
 * Connects to MongoDB using Mongoose.
 * Retries are handled by mongoose's built-in reconnection logic.
 */
export async function connectDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log(`[db] MongoDB connected -> ${mongoose.connection.name}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[db] MongoDB connection error:', err);
    process.exit(1);
  }
}
