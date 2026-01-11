// services/codeforces_api.ts

interface CFSubmission {
  id: number;
  contestId: number;
  problem: {
    contestId: number;
    index: string;
    name: string;
  };
  verdict: string;
  creationTimeSeconds: number;
}

interface CFUserStatus {
  status: string;
  result: CFSubmission[];
}

/**
 * Check if a user has an accepted submission for a specific problem
 * @param username Codeforces username
 * @param contestId Contest ID (e.g., "1881")
 * @param problemIndex Problem index (e.g., "B")
 * @returns Promise<boolean> - true if user has solved the problem
 */
export async function checkCodeforcesSubmission(
  username: string,
  contestId: string,
  problemIndex: string
): Promise<boolean> {
  if (!username || !contestId || !problemIndex) {
    throw new Error("Missing required parameters");
  }

  try {
    const response = await fetch(
      `https://codeforces.com/api/user.status?handle=${username}&from=1&count=1000`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Codeforces data");
    }

    const data: CFUserStatus = await response.json();

    if (data.status !== "OK") {
      throw new Error("Codeforces API error");
    }

    // Check if user has any accepted submission for this problem
    const hasSolved = data.result.some(
      (submission) =>
        submission.problem.contestId === parseInt(contestId) &&
        submission.problem.index === problemIndex &&
        submission.verdict === "OK"
    );

    return hasSolved;
  } catch (error: any) {
    console.error("Error checking Codeforces submission:", error);
    
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Unable to connect to Codeforces. Please try again.");
    }
    
    throw new Error(error.message || "Error verifying submission");
  }
}

/**
 * Get user's Codeforces statistics
 * @param username Codeforces username
 * @returns Promise with user stats
 */
export async function getCodeforcesUserInfo(username: string) {
  if (!username) {
    throw new Error("Username is required");
  }

  try {
    const response = await fetch(
      `https://codeforces.com/api/user.info?handles=${username}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error("User not found on Codeforces");
    }

    return data.result[0];
  } catch (error: any) {
    console.error("Error fetching Codeforces user info:", error);
    throw new Error(error.message || "Error fetching user info");
  }
}