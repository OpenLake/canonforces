import type { NextApiRequest, NextApiResponse } from "next";

export interface Contest {
  platform: string;
  contestName: string;
  contestLink: string;
  startTime: number;
  duration: number;
}

export interface ContestsResponse {
  contests: Contest[];
  source: "clist" | "fallback";
}

type ErrorResponse = {
  error: string;
};

// Clist gives resource like "codeforces.com"
const CLIST_PLATFORM_MAP: Record<string, string> = {
  "codeforces.com": "codeforces",
  "leetcode.com": "leetcode",
  "codechef.com": "codechef",
  "atcoder.jp": "atcoder",
  "hackerearth.com": "hackerearth",
};

const FALLBACK_PLATFORMS = ["codeforces", "leetcode", "codechef"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContestsResponse | ErrorResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  /* =======================
     1️⃣ PRIMARY — CLIST
     ======================= */
  try {
    const params = new URLSearchParams({
      upcoming: "true",
      order_by: "start",
      limit: "50",
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

    const contests: Contest[] = data.objects
      .filter((c: any) => CLIST_PLATFORM_MAP[c.resource])
      .map((c: any) => ({
        platform: CLIST_PLATFORM_MAP[c.resource],
        contestName: c.event,
        contestLink: c.href,
        startTime: new Date(c.start).getTime(),
        duration: c.duration * 1000, // sec → ms
      }))
      .sort((a: Contest, b: Contest) => a.startTime - b.startTime);

    return res.status(200).json({ contests, source: "clist" });

  } catch (err) {
    console.warn("⚠️ Clist failed, switching to fallback");
  }

  /* =======================
     2️⃣ FALLBACK — COMPETEAPI
     ======================= */
  try {
    const response = await fetch("https://competeapi.vercel.app/contests/upcoming/");
    if (!response.ok) throw new Error("Fallback API failed");

    const rawData: any[] = await response.json();

    const contests: Contest[] = rawData
      .filter((c) => FALLBACK_PLATFORMS.includes(c.site))
      .map((c) => ({
        platform: c.site,
        contestName: c.title,
        contestLink: c.url,
        startTime: Number(c.startTime),
        duration: Number(c.duration),
      }))
      .sort((a, b) => a.startTime - b.startTime);

    return res.status(200).json({ contests, source: "fallback" });

  } catch (err) {
    return res.status(200).json({ contests: [], source: "fallback" });
  }
}
