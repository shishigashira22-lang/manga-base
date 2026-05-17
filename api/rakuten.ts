import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  const appId = process.env.RAKUTEN_APP_ID || "";
  const accessKey = process.env.RAKUTEN_ACCESS_KEY || "";
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID || "";
  const keyword = (req.query.keyword as string) || "漫画";
  const sort = (req.query.sort as string) || "sales";

  const isGenreId = /^\d{9}$/.test(keyword);

  let url = "";
  if (isGenreId) {
    url = `https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&applicationId=${appId}&accessKey=${accessKey}&affiliateId=${affiliateId}&booksGenreId=${keyword}&hits=10&sort=${encodeURIComponent(sort)}`;
  } else {
    url = `https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&applicationId=${appId}&accessKey=${accessKey}&affiliateId=${affiliateId}&booksGenreId=001001&keyword=${encodeURIComponent(keyword)}&hits=10&sort=${encodeURIComponent(sort)}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        "Referer": "https://manga-base-xi.vercel.app/",
        "Origin": "https://manga-base-xi.vercel.app"
      }
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch from Rakuten API" });
  }
}
