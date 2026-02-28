import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { problemTitle, problemDescription, userCode, language, errorOutput } = req.body;

        if (!problemTitle || !problemDescription) {
            return res.status(400).json({ error: 'Missing problem details' });
        }

        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        // We use gemini-2.5-flash for complex coding logic and instruction following
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
      You are an expert competitive programming tutor. Provide exactly three structured hints for a student stuck on a problem.
      
      Problem Title: ${problemTitle}
      Problem Description:
      ${problemDescription}

      Student's Current Language: ${language || 'Not specified'}
      Student's Current Code:
      \`\`\`
      ${userCode || 'No code provided yet.'}
      \`\`\`

      ${errorOutput ? `Student's Recent Error/Failed Output:\n${errorOutput}\n` : ''}

      Please analyze their code and provide exactly 3 hints formatted as a JSON array of strings. 
      Do NOT include markdown formatting outside the JSON array, just return the raw JSON array.
      
      Hint 1 (Topic): Tell them the core algorithm, mathematical concept, or data structure required to solve this problem. Do not give away the solution yet.
      Hint 2 (Approach): Point out specifically what is wrong with their current code or the error they received. Tell them how their logic fails on edge cases, or what the next logical step is.
      Hint 3 (Solution): Give a detailed explanation of the optimal solution and provide the correct logical approach to get an Accepted verdict.

      Output Format exactly like this:
      [
        "Your first hint here...",
        "Your second hint here...",
        "Your final solution hint here..."
      ]
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Clean up potential markdown formatting from Gemini's response to ensure it parses correctly
        let cleanedText = text.trim();
        if (cleanedText.startsWith('\`\`\`json')) {
            cleanedText = cleanedText.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
        } else if (cleanedText.startsWith('\`\`\`')) {
            cleanedText = cleanedText.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
        }

        const hintsArray = JSON.parse(cleanedText);

        if (!Array.isArray(hintsArray) || hintsArray.length !== 3) {
            throw new Error("AI returned malformed hints array.");
        }

        return res.status(200).json({ hints: hintsArray });

    } catch (error: any) {
        console.error('AI Hint Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to generate AI hints' });
    }
}
