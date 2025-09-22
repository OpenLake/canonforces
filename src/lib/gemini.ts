import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

if (!apiKey) {
  throw new Error("Missing Gemini API key. Set NEXT_PUBLIC_GEMINI_API_KEY in .env.local");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = (model: string = "gemini-1.5-flash") => {
  return genAI.getGenerativeModel({ model });
};
