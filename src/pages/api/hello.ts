import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { LANGUAGE_IDS } from '../../constants/boilerplate';

const API = axios.create({
  baseURL: 'https://judge0-ce.p.rapidapi.com',
  headers: {
    'content-type': 'application/json',
    'X-RapidAPI-Key': '6252361aafmshfcdb9a2f67451b5p142b34jsn6b33251230e1',
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










// Sample output
// {
//     "stdout": "1\nhello\n",
//     "time": "0.009",
//     "memory": 3156,
//     "stderr": null,
//     "token": "a2ff4f6a-de2a-4c9a-a491-2dcf94b55606",
//     "compile_output": null,
//     "message": null,
//     "status": {
//         "id": 3,
//         "description": "Accepted"
//     }
// }



type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ name: 'John Doe' })
}