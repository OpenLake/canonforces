interface CFSubmission {
  id: number;
  contestId: number;
  problem: {
    index: string;
    name: string;
  };
  verdict: string;
}



export const verifyCodeforcesSolve = async (handle: string, problemUrl: string): Promise<boolean> => {
  try {
    // 1. Extract Contest ID and Index from URL
    // Expected format: https://codeforces.com/problemset/problem/1881/B
    const parts = problemUrl.split('/');
    const contestId = parts[parts.length - 2]; // e.g., "1881"
    const index = parts[parts.length - 1];     // e.g., "B"

    if (!contestId || !index) return false;

    // 2. Fetch User Status from Codeforces
    // Fetching last 50 submissions should be enough for a recent solve
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=50`);
    const data = await response.json();

    if (data.status !== "OK") return false;

    // 3. Check for Accepted Verdict
    const solved = data.result.some((sub: CFSubmission) => 
      sub.contestId === parseInt(contestId) &&
      sub.problem.index === index &&
      sub.verdict === "OK"
    );

    return solved;
  } catch (error) {
    console.error("CF Verification Failed:", error);
    return false;
  }
};