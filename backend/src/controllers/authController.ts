import { Request, Response } from 'express';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { env } from '../config/env';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

function issueTokens(userId: string, email: string) {
  return {
    accessToken: signAccessToken({ userId, email }),
    refreshToken: signRefreshToken({ userId, email }),
  };
}

function sanitizeUser(user: any) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.googleId;
  return obj;
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, ...rest } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({ email, password, ...rest });
  const tokens = issueTokens(user._id.toString(), user.email);

  res.status(201).json(new ApiResponse(201, { user: sanitizeUser(user), ...tokens }, 'Account created'));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const tokens = issueTokens(user._id.toString(), user.email);
  res.json(new ApiResponse(200, { user: sanitizeUser(user), ...tokens }, 'Logged in'));
});

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body;
  if (!env.GOOGLE_CLIENT_ID) throw ApiError.internal('Google login is not configured on the server');

  const ticket = await googleClient.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload?.email) throw ApiError.badRequest('Invalid Google token');

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    user = await User.create({
      email: payload.email,
      fullName: payload.name || payload.email.split('@')[0],
      googleId: payload.sub,
      avatarUrl: payload.picture,
      isEmailVerified: true,
      fashionPreferences: [],
    });
  }

  const tokens = issueTokens(user._id.toString(), user.email);
  res.json(new ApiResponse(200, { user: sanitizeUser(user), ...tokens }, 'Logged in with Google'));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond success to avoid leaking whether an email is registered.
  if (!user) {
    res.json(new ApiResponse(200, {}, 'If that email exists, a reset link has been sent'));
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // NOTE: wire up an email provider (e.g. SendGrid/Resend) here to actually
  // deliver `resetToken` to the user. For now it's returned in dev mode only.
  res.json(
    new ApiResponse(
      200,
      env.NODE_ENV === 'development' ? { devResetToken: resetToken } : {},
      'If that email exists, a reset link has been sent'
    )
  );
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) throw ApiError.badRequest('Reset token is invalid or has expired');

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json(new ApiResponse(200, {}, 'Password reset successful. Please log in.'));
});

export const me = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw ApiError.notFound('User not found');
  res.json(new ApiResponse(200, { user: sanitizeUser(user) }));
});
