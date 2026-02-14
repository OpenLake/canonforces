// Utility to generate contest problems from contest data
import { ContestProblem, PastContest } from "../types/contest-submission";

// Common problem title suggestions by difficulty level
const PROBLEM_TITLES: Record<string, string[]> = {
    easy: [
        "Simple Task", "Easy Sum", "Basic Calculation", "Count Elements",
        "Find Maximum", "Check Condition", "Array Manipulation", "String Match"
    ],
    medium: [
        "Optimal Strategy", "Graph Problem", "Dynamic Programming", "Sorting Challenge",
        "Tree Traversal", "Pattern Matching", "Two Pointers", "Data Structure"
    ],
    hard: [
        "Advanced Algorithm", "Complex Optimization", "Multi-step Solution", "Edge Cases",
        "Mathematical Formula", "Segment Tree", "Game Theory", "Advanced DP"
    ]
};

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Get a pseudo-random but deterministic problem title
 */
function getProblemTitle(contestId: string, problemIndex: string): string {
    const seed = parseInt(contestId) + LETTERS.indexOf(problemIndex);
    const difficulty = (seed % 3 === 0) ? 'easy' : (seed % 3 === 1) ? 'medium' : 'hard';
    const titles = PROBLEM_TITLES[difficulty];
    const selectedTitle = titles[Math.floor(seed / 3) % titles.length];
    return selectedTitle;
}

/**
 * Fetch real problem names from Codeforces API
 */
async function fetchCodeforcesProblems(contestId: string): Promise<Map<string, string>> {
    try {
        // Try contest.standings first
        const response = await fetch(`https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`);
        if (!response.ok) {
            return new Map();
        }

        const data = await response.json();

        if (data.status !== "OK" || !data.result || !data.result.problems) {
            return new Map();
        }

        const problemMap = new Map<string, string>();
        const problems = data.result.problems;

        problems.forEach((problem: any) => {
            // problem.index might be "A", "B", etc. or problem.name might contain the title
            const index = problem.index || problem.contestId;
            const name = problem.name || `Problem ${index}`;

            if (index) {
                problemMap.set(index, name);
            }
        });

        return problemMap;
    } catch (error) {
        console.error(`Failed to fetch Codeforces problems for contest ${contestId}:`, error);
        return new Map();
    }
}

/**
 * Generate problem list for a contest based on platform conventions
 * Since most APIs don't provide problem-level data, we generate them
 */
export async function generateProblemsForContest(contest: PastContest): Promise<ContestProblem[]> {
    // Determine number of problems based on platform
    let defaultProblemCount = getProblemCountForPlatform(contest.platform);

    // Fetch real problem names if available (currently only Codeforces)
    let problemNames: Map<string, string> = new Map();
    if (contest.platform.toLowerCase() === 'codeforces') {
        problemNames = await fetchCodeforcesProblems(contest.contestId);
    }

    // Determine the indices to iterate over
    let problemIndices: string[];

    if (problemNames.size > 0) {
        // Use actual indices from the API (could be A, B, C, D, E, F1, F2...)
        problemIndices = Array.from(problemNames.keys());
    } else {
        // Fallback to A, B, C... based on default count
        problemIndices = Array.from({ length: defaultProblemCount }, (_, i) => String.fromCharCode(65 + i));
    }

    return problemIndices.map((problemIndex) => {
        // Use fetched name if available, otherwise use generated fallback
        const fetchedName = problemNames.get(problemIndex);
        const realProblemName = fetchedName || getProblemTitle(contest.contestId, problemIndex);


        return {
            problemId: `${contest.contestId}_${problemIndex}`,
            problemName: realProblemName,
            problemIndex: problemIndex,
            contestId: contest.contestId,
            contestName: contest.contestName,
            platform: contest.platform,
            problemLink: buildProblemLink(contest, problemIndex),
        };
    });
}

/**
 * Get typical problem count for each platform
 */
function getProblemCountForPlatform(platform: string): number {
    switch (platform.toLowerCase()) {
        case 'codeforces':
            return 7; 
        case 'leetcode':
            return 4; 
        case 'codechef':
            return 8; 
        case 'atcoder':
            return 6; 
        default:
            return 4;
    }
}

/**
 * Build a direct link to the problem on the platform
 */
function buildProblemLink(contest: PastContest, problemIndex: string): string {
    const baseUrl = contest.contestLink;

    switch (contest.platform.toLowerCase()) {
        case 'codeforces':
            // e.g., https://codeforces.com/contest/1234/problem/A
            const fixedBaseUrl = baseUrl.replace('/contests/', '/contest/');
            return `${fixedBaseUrl}/problem/${problemIndex}`;

        case 'leetcode':
            // LeetCode uses slug-based URLs, harder to construct
            return baseUrl;

        case 'codechef':
            // e.g., https://www.codechef.com/problems/PROBLEMCODE
            return baseUrl;

        case 'atcoder':
            // e.g., https://atcoder.jp/contests/abc123/tasks/abc123_a
            const contestId = contest.contestId;
            return `https://atcoder.jp/contests/${contestId}/tasks/${contestId}_${problemIndex.toLowerCase()}`;

        default:
            return baseUrl;
    }
}
