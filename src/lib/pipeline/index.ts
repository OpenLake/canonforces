import { validateSubmission } from "./validation";
import { executeInSandbox } from "./execution";
import { scoreSubmission, TestCase } from "./scoring";

export const runPipeline = async ({
  code,
  language,
  testCases,
}: {
  code: string;
  language: string;
  testCases: TestCase[];
}) => {

  // 1️⃣ VALIDATION
  const validation = validateSubmission({ code, language });

  if (!validation.valid) {
    return {
      stage: "validation",
      error: validation.error,
    };
  }

  // 2️⃣ EXECUTION (sandbox)
  const executionOutputs: string[] = [];

  for (let tc of testCases) {
    const result = await executeInSandbox({
      language,
      code,
      input: tc.input,
    });

    if (!result) {
      return {
        stage: "execution",
        error: "Execution failed",
      };
    }

    executionOutputs.push(result.output || "");
  }

  // 3️⃣ SCORING
  const score = await scoreSubmission(executionOutputs, testCases);

  return {
    stage: "completed",
    data: score,
  };
};