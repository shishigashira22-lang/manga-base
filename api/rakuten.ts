import type { VercelRequest, VercelResponse } from "@vercel/node";

const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID || "";
const RAKUTEN_AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID || "";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  const keyword = (req.query.keyword as string) || "漫画";
  const url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&applicationId=${RAKUTEN_APP_ID}&affiliateId=${RAKUTEN_AFFILIATE_ID}&booksGenreId=001001&keyword=${encodeURIComponent(keyword)}&hits=10&sort=sales`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch from Rakuten API" });
  }
}
