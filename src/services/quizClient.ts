import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question } from "../types/quiz";

const apiKey = (process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY) as string;
if (!apiKey) {
  throw new Error("Missing Gemini API key in .env.local or .env");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// This function is for CLIENT-SIDE use
export async function fetchQuizQuestions(
  topic: string,
  difficulty: "easy" | "medium" | "hard",
  count: number
): Promise<Question[]> {
  try {
    const prompt = `
      Topic: ${topic}
      Difficulty: ${difficulty}
      Count: ${count}
      
      Generate ${count} unique, diverse, and challenging multiple-choice questions. 
      Avoid common or repeatably generated questions. Focus on a wide variety of sub-topics within ${topic}.
      
      Follow this JSON format strictly: 
      [
        {"question": "Question text", "optionA": "A", "optionB": "B", "optionC": "C", "optionD": "D", "answer": "optionA"}
      ]
      Do not include any markdown code fences or explanatory text.
    `;

    const generateOnce = async (temperature: number): Promise<Question[]> => {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          topP: 0.95,
          topK: 40,
          responseMimeType: "application/json"
        }
      });

      const responseText = result.response.text();
      const parsedResponse = JSON.parse(responseText);

      if (!Array.isArray(parsedResponse)) {
        throw new Error("AI did not return a valid array.");
      }

      return parsedResponse as Question[];
    };

    try {
      return await generateOnce(0.7);
    } catch (firstErr) {
      console.warn("AI JSON parse failed (retrying):", firstErr);
      return await generateOnce(0.9);
    }
  } catch (err) {
    console.error("Error fetching quiz questions:", err);
    throw new Error("Could not retrieve quiz data.");
  }
}
