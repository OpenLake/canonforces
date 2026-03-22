export type TestCase = {
  input: string;
  output: string;
};

export type ScoreResult = {
  total: number;
  passed: number;
  score: number;
  results: { status: string }[];
};

export const scoreSubmission = async (
  executionResults: string[],
  testCases: TestCase[]
): Promise<ScoreResult> => {

  let passed = 0;
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const expected = testCases[i].output.trim();
    const actual = (executionResults[i] || "").trim();

    if (expected === actual) {
      passed++;
      results.push({ status: "Accepted" });
    } else {
      results.push({ status: "Wrong Answer" });
    }
  }

  const total = testCases.length;

  return {
    total,
    passed,
    score: Math.round((passed / total) * 100),
    results,
  };
};