import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question } from "../types/quiz";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
if (!apiKey) {
  throw new Error("Missing Gemini API key in .env.local");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// This function is for CLIENT-SIDE use
export async function fetchQuizQuestions(
  topic: string,
  difficulty: "easy" | "medium" | "hard",
  count: number
): Promise<Question[]> {
  try {
    const prompt = `
      Generate ${count} questions about ${topic} with ${difficulty} difficulty.
      Follow this JSON format strictly: 
      [
        {"question": "Question text", "optionA": "A", "optionB": "B", "optionC": "C", "optionD": "D", "answer": "optionA"}
      ]
      Do not include any markdown code fences or explanatory text.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    let parsedResponse: Question[] = JSON.parse(responseText);

    if (!Array.isArray(parsedResponse)) {
      throw new Error("AI did not return a valid array.");
    }
    
    return parsedResponse;
  } catch (err) {
    console.error("Error fetching quiz questions:", err);
    throw new Error("Could not retrieve quiz data.");
  }
}