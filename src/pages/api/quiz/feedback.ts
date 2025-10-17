import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Question } from '../../../types/quiz';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
if (!apiKey) {
  throw new Error("Missing Gemini API key.");
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

type RequestData = {
  questions: Question[];
  userAnswers: (string | null)[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { questions, userAnswers }: RequestData = req.body;

  if (!questions || !userAnswers) {
    return res.status(400).json({ message: 'Missing questions or user answers.' });
  }

  // Create a summary of performance for the AI prompt
  const performanceSummary = questions.map((q, index) => {
    const isCorrect = q.answer === userAnswers[index];
    return `Question: "${q.question}" - Correct: ${isCorrect}`;
  }).join('\n');

  const prompt = `
    Analyze the following quiz performance for a user studying computer science topics. 
    Based on the questions they got wrong, provide a single, encouraging, one-sentence feedback highlighting the main topic they should review. 
    Address the user directly as "You". Do not use markdown.

    Performance Data:
    ${performanceSummary}

    Example feedback: "You're doing great! It looks like brushing up on Dynamic Programming concepts would be helpful."
  `;

  try {
    const result = await model.generateContent(prompt);
    const feedback = result.response.text();
    res.status(200).json({ feedback });
  } catch (error) {
    console.error('Error generating AI feedback:', error);
    res.status(500).json({ message: 'Failed to generate feedback.' });
  }
}