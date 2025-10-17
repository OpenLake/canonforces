import { getGeminiModel } from "../lib/gemini";
import { Question } from "../types/quiz";

export async function fetchQuizQuestions(
  topic: string = "Data Structures and Algorithms",
  difficulty: "easy" | "medium" | "hard",
  count: number
): Promise<Question[]> {
  try {
    const model = getGeminiModel("gemini-2.5-flash");

    const prompt = `
      Generate ${count} quiz questions about the topic "${topic}" with ${difficulty} difficulty.
      Respond ONLY with a valid JSON array. Do not include the word "json", markdown fences, or any other text outside of the JSON array itself.
      The JSON array should follow this structure:
      [
        {"question": "Question text", "optionA": "A", "optionB": "B", "optionC": "C", "optionD": "D", "answer": "optionA"}
      ]
    `;

    const result: any = await model.generateContent(prompt);

    // Get text safely whether `result` is a string or a Response-like object
    let responseText: string;
    if (typeof result === "string") {
      responseText = result;
    } else if (result?.response?.text && typeof result.response.text === "function") {
      responseText = await result.response.text();
    } else if (typeof result?.outputText === "string") {
      responseText = result.outputText;
    } else {
      responseText = String(result);
    }

    // Strip possible Markdown code fences (``` or ```json) and trim
    responseText = responseText.trim();
    responseText = responseText.replace(/^```(?:[\w-]+)?\n?/, "").replace(/\n```$/, "").trim();

    try {
      const parsedResponse = JSON.parse(responseText) as Question[];
      if (!Array.isArray(parsedResponse) || parsedResponse.length === 0) {
        throw new Error("The AI model returned empty or invalid data.");
      }
      return parsedResponse;
    } catch (e) {
      console.error("Failed to parse JSON response:", responseText, e);
      throw new Error("The AI model's response was not valid JSON.");
    }
  } catch (err) {
    console.error("Error fetching quiz questions:", err);
    throw new Error("Could not retrieve quiz data from the AI model.");
  }
}