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
  const language_id = LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS];

  try {
    // Primary: RapidAPI
    const response = await API.post(
      '/submissions?base64_encoded=false&wait=true',
      { language_id, source_code: value, stdin: input }
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
    // Fallback: Wandbox API (if RapidAPI gateway is 500, 403, or rate-limited)
    if (error.response?.status === 500 || error.response?.status === 403 || error.code === 'ECONNABORTED' || error.code === 'ERR_BAD_RESPONSE') {
      console.warn('RapidAPI Gateway Error. Falling back to Wandbox API...');
      try {
        const WANDBOX_COMPILERS: Record<string, string> = {
          javascript: 'nodejs-20.17.0',
          typescript: 'typescript-5.6.2',
          python: 'cpython-3.14.0',
          java: 'openjdk-jdk-22+36',
          csharp: 'dotnetcore-8.0.402',
          php: 'php-8.3.12',
          cpp: 'gcc-13.2.0',
        };
        const compiler = WANDBOX_COMPILERS[language] || 'cpython-3.14.0';

        // Use native fetch to bypass Node.js axios IPv6 ECONNRESET issues with wandbox.org
        const fallbackRes = await fetch('https://wandbox.org/api/compile.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            compiler,
            code: value,
            stdin: input
          })
        });

        const fallbackData = await fallbackRes.json();

        return {
          run: {
            output: fallbackData.program_output || '',
            stderr: fallbackData.program_error || '',
            compile_output: fallbackData.compiler_error || fallbackData.compiler_message || '',
            status: fallbackData.status === '0' ? 'Accepted' : 'Error',
          },
        };
      } catch (fallbackError: any) {
        console.error('All fallback endpoints failed:', fallbackError.message);
        return {
          error: 'All code execution services are currently unavailable.',
          status: 503,
        };
      }
    }

    // Original error reporting
    const errorData = error.response?.data;
    const errorMessage = typeof errorData === 'string' ? errorData : (errorData?.message || error.message || 'Execution failed.');
    console.error('Execution error details:', errorData || error.message);
    return {
      error: errorMessage,
      status: error.response?.status || 500,
    };
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { language, codeValue, input } = req.body;
    console.log('API Hello Request:', { language, codeLength: codeValue?.length, hasInput: !!input });

    if (!language || !codeValue) {
      console.warn('API Hello: Missing language or codeValue');
      return res.status(400).json({
        error: 'Missing language or code input',
      });
    }

    try {
      const result = await executeCode(language, codeValue, input);
      console.log('API Hello Result:', result);

      if ('error' in result) {
        return res.status(result.status as number || 500).json(result);
      }

      return res.status(200).json(result);
    } catch (err: any) {
      console.error('API Hello: Uncaught Error:', err);
      return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  // Default GET route (optional)
  return res.status(200).json({ name: 'Judge0 API Running' });
}
