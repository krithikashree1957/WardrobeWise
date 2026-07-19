import { Response } from 'express';
import { ChatMessage } from '../models/ChatMessage';
import { ClothingItem } from '../models/ClothingItem';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth';
import { chatWithAssistant } from '../services/geminiService';
import { getCurrentWeather } from '../services/weatherService';
import { User } from '../models/User';

export const sendMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { message } = req.body;
  const ownerId = req.user!.userId;

  await ChatMessage.create({ owner: ownerId, role: 'user', content: message });

  const [history, itemCount, user] = await Promise.all([
    ChatMessage.find({ owner: ownerId }).sort({ createdAt: -1 }).limit(10),
    ClothingItem.countDocuments({ owner: ownerId }),
    User.findById(ownerId),
  ]);

  let weatherStr: string | undefined;
  if (user?.city) {
    const weather = await getCurrentWeather(user.city).catch(() => undefined);
    if (weather) weatherStr = `${weather.tempC}°C, ${weather.condition} in ${weather.city}`;
  }

  const reply = await chatWithAssistant(
    history.reverse().map((h) => ({ role: h.role, content: h.content })),
    { wardrobeSummary: `${itemCount} items in wardrobe`, weather: weatherStr }
  );

  const assistantMessage = await ChatMessage.create({ owner: ownerId, role: 'assistant', content: reply });

  res.json(new ApiResponse(200, { reply: assistantMessage }));
});

export const getChatHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const history = await ChatMessage.find({ owner: req.user!.userId }).sort({ createdAt: 1 }).limit(100);
  res.json(new ApiResponse(200, { history }));
});
