import fetch from 'node-fetch';
import { env } from '../config/env';

/**
 * Thin wrapper around the Gemini generative language API.
 * Centralising this makes it trivial to swap models or add retries/caching.
 */
const GEMINI_ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

interface GeminiTextPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

async function callGemini(parts: GeminiTextPart[], jsonMode = false): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: jsonMode ? { responseMimeType: 'application/json' } : undefined,
  };

  const res = await fetch(`${GEMINI_ENDPOINT(env.GEMINI_MODEL)}?key=${env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data: any = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini API returned an empty response');
  return text;
}

/**
 * Analyses a clothing image (base64) and extracts structured attributes.
 * Falls back to a heuristic stub if no API key is configured, so the
 * rest of the app remains usable in local/dev without a Gemini key.
 */
export async function detectClothingAttributes(imageBase64: string, mimeType: string) {
  const prompt = `You are a fashion AI. Analyze the clothing item in this image and
respond with ONLY a JSON object (no markdown) with these exact keys:
{
  "clothingType": string,
  "fabric": string,
  "color": string,
  "pattern": string,
  "sleeveLength": string,
  "formality": string,
  "confidenceScore": number (0-100)
}`;

  if (!env.GEMINI_API_KEY) {
    return {
      clothingType: 'unknown',
      fabric: 'unknown',
      color: 'unknown',
      pattern: 'solid',
      sleeveLength: 'n/a',
      formality: 'casual',
      confidenceScore: 0,
      note: 'GEMINI_API_KEY not configured - returning stub detection. Configure the key to enable real AI detection.',
    };
  }

  const raw = await callGemini(
    [{ text: prompt }, { inlineData: { mimeType, data: imageBase64 } }],
    true
  );
  return JSON.parse(raw);
}

/**
 * Conversational fashion assistant. Accepts the running chat history plus
 * optional wardrobe/weather context so responses stay grounded in the
 * user's real closet and current conditions.
 */
export async function chatWithAssistant(
  history: { role: 'user' | 'assistant'; content: string }[],
  context: { wardrobeSummary?: string; weather?: string } = {}
): Promise<string> {
  const systemContext = `You are the WardrobeWise AI Fashion Assistant - a warm, expert
personal stylist. Use the user's wardrobe and current weather context when relevant.
Wardrobe summary: ${context.wardrobeSummary || 'unknown'}.
Current weather: ${context.weather || 'unknown'}.
Keep responses concise, specific, and actionable.`;

  if (!env.GEMINI_API_KEY) {
    return "I'd love to help with that! (AI assistant is running in stub mode - add a GEMINI_API_KEY to enable real responses.)";
  }

  const conversation = history.map((h) => `${h.role.toUpperCase()}: ${h.content}`).join('\n');
  const text = await callGemini([{ text: `${systemContext}\n\n${conversation}\nASSISTANT:` }]);
  return text.trim();
}

/**
 * Generates an outfit recommendation reasoning block via Gemini, given
 * a shortlist of candidate items + context. The actual item selection is
 * done by outfitService (rule-based); Gemini is used to produce the
 * natural-language reasoning and refine the confidence score.
 */
export async function explainOutfitChoice(context: {
  items: string[];
  mood?: string;
  occasion?: string;
  weather?: string;
}): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    return 'This combination balances color harmony and comfort for the occasion. (Stub reasoning - add GEMINI_API_KEY for AI-generated explanations.)';
  }
  const prompt = `As a fashion stylist, explain in 2-3 sentences why this outfit works:
Items: ${context.items.join(', ')}
Mood: ${context.mood || 'n/a'}
Occasion: ${context.occasion || 'n/a'}
Weather: ${context.weather || 'n/a'}`;
  const text = await callGemini([{ text: prompt }]);
  return text.trim();
}
