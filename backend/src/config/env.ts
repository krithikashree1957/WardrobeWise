/**
 * Centralised environment variable loader & validator.
 * Never hardcode secrets - everything flows through here.
 */
import dotenv from 'dotenv';

//dotenv.config();
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});
console.log("Loaded Mongo URI:", process.env.MONGODB_URI);

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // We warn instead of throwing so the server can still boot in dev
    // before all third-party keys are configured.
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing environment variable: ${name}`);
    return '';
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  MONGODB_URI: required('MONGODB_URI', 'mongodb://localhost:27017/wardrobewise'),

  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',

  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',

  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 200,
};
