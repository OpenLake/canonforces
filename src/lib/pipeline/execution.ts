export type ExecutionResult = {
  output: string;
  stderr: string;
  compile_output: string;
  status: string;
};

export const executeInSandbox = async ({
  language,
  code,
  input,
}: {
  language: string;
  code: string;
  input: string;
}): Promise<ExecutionResult | null> => {

  try {
    const res = await fetch("/api/hello", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        codeValue: code,
        input,
      }),
    });

    const data = await res.json();

    if (data.run) {
      return data.run;
    }

    return null;
  } catch (err) {
    console.error("Execution failed:", err);
    return null;
  }
};