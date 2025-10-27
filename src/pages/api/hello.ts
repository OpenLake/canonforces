// pages/api/hello.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { LANGUAGE_IDS } from '../../constants/boilerplate';

const API = axios.create({
  baseURL: 'https://judge0-ce.p.rapidapi.com',
  headers: {
    'content-type': 'application/json',
    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_JUDGE0_API_KEY as string,
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
  },
});

export const executeCode = async (
  language = 'javascript',
  value = '',
  input = ''
) => {
  try {
    const response = await API.post(
      '/submissions?base64_encoded=false&wait=true',
      {
        language_id: LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS],
        source_code: value,
        stdin: input,
      }
    );

    return {
      run: {
        output: response.data.stdout || '',
        stderr: response.data.stderr || '',
        compile_output: response.data.compile_output || '',
        status: response.data.status.description || '',
      },
    };
  } catch (error: any) {
    console.error('Execution error:', error);
    return {
      run: {
        output: '',
        stderr: 'Execution failed.',
        compile_output: '',
        status: 'Error',
      },
    };
  }
};

// ✅ FIXED HANDLER
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { language, codeValue, input } = req.body;

    if (!language || !codeValue) {
      return res.status(400).json({
        error: 'Missing language or code input',
      });
    }

    const result = await executeCode(language, codeValue, input);
    return res.status(200).json(result);
  }

  // Default GET route (optional)
  return res.status(200).json({ name: 'Judge0 API Running' });
}
