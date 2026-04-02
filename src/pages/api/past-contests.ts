import type { NextApiRequest, NextApiResponse } from "next";
import { PastContest } from "../../types/contest-submission";

interface PastContestsResponse {
    contests: PastContest[];
    source: "clist" | "fallback";
}

type ErrorResponse = {
    error: string;
};

// Mapping Clist resource names to our platform names
const CLIST_PLATFORM_MAP: Record<string, string> = {
    "codeforces.com": "codeforces",
    "leetcode.com": "leetcode",
    "codechef.com": "codechef",
    "atcoder.jp": "atcoder",
    "hackerearth.com": "hackerearth",
};

// How many days back to fetch past contests
const DAYS_BACK = 30;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PastContestsResponse | ErrorResponse>
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const now = new Date();
        const pastDate = new Date(now.getTime() - DAYS_BACK * 24 * 60 * 60 * 1000);

        const params = new URLSearchParams({
            end__gte: pastDate.toISOString(),//contests ending after pastDate
            end__lte: now.toISOString(),//contests ending before now
            order_by: "-end",//latest contests first
            limit: "100",//max 100 contests
            format: "json",
        });

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(
            `https://clist.by/api/v4/contest/?${params}`,
            {
                signal: controller.signal,
                headers: {
                    Authorization: `ApiKey ${process.env.CLIST_USERNAME}:${process.env.CLIST_API_KEY}`,
                    "User-Agent": "CanonForces/1.0",
                },
            }
        );

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`Clist failed: ${response.status}`);
        }

        const data = await response.json();

        const contests: PastContest[] = data.objects
            .filter((c: any) => CLIST_PLATFORM_MAP[c.resource])
            // Filter out contests that are very likely non-English (CJK scripts)
            .filter((c: any) => {
                const name = (c.event || '').toString();
                // Must contain at least one ASCII letter (simple proxy for English)
                const hasEnglishLetter = /[A-Za-z]/.test(name);
                // Exclude common non-Latin scripts: Han (Chinese), Hiragana/Katakana (Japanese), Hangul (Korean)
                const hasCJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(name);
                return hasEnglishLetter && !hasCJK;
            })
            .map((c: any) => {
                const endTime = new Date(c.end).getTime();
                // Extract contest ID from the URL if possible
                const contestId = extractContestId(c.href, CLIST_PLATFORM_MAP[c.resource]);

                return {
                    platform: CLIST_PLATFORM_MAP[c.resource],
                    contestName: c.event,
                    contestLink: c.href,
                    contestId: contestId || c.id.toString(),
                    endTime: endTime,
                };
            })
            .sort((a: PastContest, b: PastContest) => b.endTime - a.endTime);

        return res.status(200).json({ contests, source: "clist" });

    } catch (err) {
        console.warn("⚠️ Clist failed for past contests, returning fallback");
    }

    return res.status(200).json({ contests: [], source: "fallback" });
}

/**
 * Extract contest ID from contest URL
 * This is platform-specific
 */
function extractContestId(url: string, platform: string): string | null {
    try {
        if (platform === "codeforces") {
            // Example: https://codeforces.com/contest/1234 or https://codeforces.com/contests/1234
            const match = url.match(/\/contests?\/(\d+)/);
            return match ? match[1] : null;
        }
        if (platform === "leetcode") {
            // Example: https://leetcode.com/contest/weekly-contest-123
            const match = url.match(/\/contest\/([^\/]+)/);
            return match ? match[1] : null;
        }
        if (platform === "codechef") {
            // Example: https://www.codechef.com/START123
            const match = url.match(/codechef\.com\/([A-Z0-9]+)/);
            return match ? match[1] : null;
        }
        if (platform === "atcoder") {
            // Example: https://atcoder.jp/contests/abc123
            const match = url.match(/\/contests\/([^\/]+)/);
            return match ? match[1] : null;
        }
        return null;
    } catch {
        return null;
    }
}
