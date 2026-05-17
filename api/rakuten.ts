import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  const appId = process.env.RAKUTEN_APP_ID || "NOT_SET";
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID || "NOT_SET";

  // デバッグ用：環境変数の確認
  res.status(200).json({ 
    appId: appId,
    affiliateId: affiliateId,
    message: "debug"
  });
}
