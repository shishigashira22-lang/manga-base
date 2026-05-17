import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  const appId = process.env.RAKUTEN_APP_ID || "";
  const accessKey = process.env.RAKUTEN_ACCESS_KEY || "";
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID || "";
  const keyword = (req.query.keyword as string) || "漫画";

  const url = `https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&applicationId=${appId}&affiliateId=${affiliateId}&booksGenreId=001001&keyword=${encodeURIComponent(keyword)}&hits=10&sort=sales`;

  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${accessKey}`,
        "Referer": "https://manga-base-xi.vercel.app"
      }
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch from Rakuten API" });
  }
}
