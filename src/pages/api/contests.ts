import type { NextApiRequest, NextApiResponse } from "next";

export interface Contest {
  platform: string;
  contestName: string;
  contestLink: string;
  startTime: number; // Changed to number (timestamp)
  duration: number;  // Changed to number (ms)
}

export interface ContestsResponse {
  contests: Contest[];
}

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContestsResponse | ErrorResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(
      "https://competeapi.vercel.app/contests/upcoming/",
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error("External API failed");
    }

    const rawData: any[] = await response.json();

    // Send raw data to frontend for better formatting control
    const contests: Contest[] = rawData.map((c) => ({
      platform: c.site,
      contestName: c.title,
      contestLink: c.url,
      startTime: c.startTime, 
      duration: c.duration,     
    }));

    // Sort by start time (soonest first)
    contests.sort((a, b) => a.startTime - b.startTime);

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return res.status(200).json({ contests });
  } catch (err: any) {
    console.error("Contest API error:", err.name || err);
    return res.status(200).json({ contests: [] });
  }
}