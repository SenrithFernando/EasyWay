import { createRequire } from 'module';
import { FEEDBACK_SENTIMENT } from '../models/feedback.constants.js';

const require = createRequire(import.meta.url);

const POSITIVE_KEYWORDS = [
  'delicious',
  'good',
  'nice',
  'fresh',
  'great',
  'excellent',
  'tasty',
  'amazing',
];

const NEGATIVE_KEYWORDS = [
  'late',
  'bad',
  'cold',
  'terrible',
  'awful',
  'poor',
  'stale',
  'slow',
];

let cachedGeminiClient = null;

const countKeywordMatches = (text, keywords) =>
  keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);

const analyzeSentimentByKeyword = (comment = '') => {
  const normalizedComment = String(comment).toLowerCase();

  const positiveMatches = countKeywordMatches(normalizedComment, POSITIVE_KEYWORDS);
  const negativeMatches = countKeywordMatches(normalizedComment, NEGATIVE_KEYWORDS);

  if (positiveMatches > negativeMatches) {
    return FEEDBACK_SENTIMENT.POSITIVE;
  }

  if (negativeMatches > positiveMatches) {
    return FEEDBACK_SENTIMENT.NEGATIVE;
  }

  return FEEDBACK_SENTIMENT.NEUTRAL;
};

const analyzeSentimentByRating = (rating) => {
  const numericRating = Number(rating);

  if (!Number.isFinite(numericRating)) {
    return null;
  }

  if (numericRating >= 4) {
    return FEEDBACK_SENTIMENT.POSITIVE;
  }

  if (numericRating <= 2) {
    return FEEDBACK_SENTIMENT.NEGATIVE;
  }

  return FEEDBACK_SENTIMENT.NEUTRAL;
};

const normalizeModelLabel = (value = '') => {
  const normalized = String(value).trim().toLowerCase();

  if (normalized.includes('positive')) {
    return FEEDBACK_SENTIMENT.POSITIVE;
  }

  if (normalized.includes('negative')) {
    return FEEDBACK_SENTIMENT.NEGATIVE;
  }

  if (normalized.includes('neutral')) {
    return FEEDBACK_SENTIMENT.NEUTRAL;
  }

  return null;
};

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  if (cachedGeminiClient) {
    return cachedGeminiClient;
  }

  try {
    const { GoogleGenAI } = require('@google/genai');
    cachedGeminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return cachedGeminiClient;
  } catch (_error) {
    return null;
  }
};

const analyzeSentimentByGemini = async (comment = '') => {
  const client = getGeminiClient();

  if (!client) {
    return null;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const prompt = [
    'Classify the following student food-order feedback into exactly one label.',
    'Allowed labels: Positive, Neutral, Negative.',
    'Return only the label, with no explanation.',
    `Feedback: "${String(comment).trim()}"`,
  ].join('\n');

  try {
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0,
        maxOutputTokens: 5,
      },
    });

    return normalizeModelLabel(response.text);
  } catch (_error) {
    return null;
  }
};

const analyzeSentiment = async ({ comment = '', rating } = {}) => {
  const geminiSentiment = await analyzeSentimentByGemini(comment);

  if (geminiSentiment) {
    return geminiSentiment;
  }

  const keywordSentiment = analyzeSentimentByKeyword(comment);

  if (keywordSentiment !== FEEDBACK_SENTIMENT.NEUTRAL) {
    return keywordSentiment;
  }

  return analyzeSentimentByRating(rating) || FEEDBACK_SENTIMENT.NEUTRAL;
};

export {
  analyzeSentiment,
  analyzeSentimentByGemini,
  analyzeSentimentByKeyword,
  analyzeSentimentByRating,
};
