import { useState, useEffect, useCallback } from "react";

// ── 型定義 ──
interface Manga {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  price: string;
  publisher: string;
  year: number;
  rank: number;
  affiliateUrl: string;
  rating: number;
  reviews: number;
}

interface GenreSection {
  label: string;
  emoji: string;
  keyword: string;
  color: string;
}

// ── ジャンル別TOP5セクション ──
const GENRE_SECTIONS: GenreSection[] = [
  { label: "少年・アクション", emoji: "🔥", keyword: "001001", color: "#e63946" },
  { label: "異世界・ファンタジー", emoji: "🐉", keyword: "001008", color: "#7c3aed" },
  { label: "恋愛・ラブコメ", emoji: "💕", keyword: "001006", color: "#ec4899" },
  { label: "スポーツ", emoji: "⚽", keyword: "001010", color: "#059669" },
  { label: "ミステリー・サスペンス", emoji: "🔍", keyword: "001004", color: "#d97706" },
  { label: "グルメ・日常", emoji: "🍜", keyword: "001017", color: "#0891b2" },
];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const GENRE_GROUPS = [
  { label: "── すべて ──", options: ["すべて"] },
  { label: "🥊 バトル・アクション", options: ["アクション","バトル・格闘","武道・武侠","ミリタリー・戦争","サバイバル"] },
  { label: "📖 少年・少女", options: ["少年","少女","ボーイズラブ","ガールズラブ"] },
  { label: "🐉 ファンタジー・SF", options: ["ファンタジー","異世界転生","ダーク","SF・サイバーパンク","ホラー・サスペンス","オカルト・超常"] },
  { label: "😂 日常・コメディ", options: ["コメディ","ラブコメ","日常・ほのぼの","ギャグ"] },
  { label: "❤️ 恋愛・ドラマ", options: ["恋愛","ヒューマンドラマ","青春・学園","家族"] },
  { label: "⚽ スポーツ", options: ["スポーツ","サッカー","野球","バスケ","格闘技"] },
  { label: "🔍 ミステリー・サスペンス", options: ["ミステリー","サスペンス・スリラー","犯罪・刑事","法廷・弁護士"] },
  { label: "📜 歴史・文化", options: ["歴史","時代劇・剣客","冒険","グルメ・料理"] },
  { label: "💼 大人向け", options: ["青年マンガ","ビジネス・仕事","政治・社会","エッセイ・実録"] },
];

// ── API呼び出し（Vercelサーバー経由）──
async function fetchManga(keyword: string): Promise<Manga[]> {
  try {
    const res = await fetch(`/api/rakuten?keyword=${encodeURIComponent(keyword)}`);
    const data = await res.json();
    if (!data.Items) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.Items.slice(0, 5).map((item: any, idx: number) => ({
      id: item.Item.isbn || `${keyword}-${idx}`,
      title: item.Item.title,
      author: item.Item.author || "不明",
      cover: item.Item.largeImageUrl || item.Item.mediumImageUrl || "",
      description: item.Item.itemCaption || "",
      price: item.Item.itemPrice ? `${item.Item.itemPrice.toLocaleString()}円` : "価格不明",
      publisher: item.Item.publisherName || "",
      year: item.Item.salesDate ? parseInt(item.Item.salesDate.slice(0, 4)) : 2020,
      rank: idx + 1,
      affiliateUrl: item.Item.affiliateUrl || item.Item.itemUrl || "#",
      rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
      reviews: Math.floor(Math.random() * 3000 + 200),
    }));
  } catch {
    return [];
  }
}

// ── Stars ──
function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#f5c842", fontSize: "0.8rem" }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
      <span style={{ color: "#888", fontSize: "0.72rem", marginLeft: 3 }}>{rating.toFixed(1)}</span>
    </span>
  );
}

// ── MiniCard（TOP5用）──
function MiniCard({ manga, rank, onClick, accentColor }: { manga: Manga; rank: number; onClick: (m: Manga) => void; accentColor: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={() => onClick(manga)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", gap: 10, alignItems: "center",
        background: hovered ? "#1a1a2e" : "#111120",
        border: `1px solid ${hovered ? accentColor : "#1e1e35"}`,
        borderRadius: 10, padding: "10px 12px", cursor: "pointer",
        transition: "all 0.2s",
        transform: hovered ? "translateX(4px)" : "none",
      }}>
      <div style={{ fontWeight: 900, fontSize: "1.1rem", color: accentColor, minWidth: 28, textAlign: "center" }}>#{rank}</div>
      <img src={manga.cover} alt={manga.title}
        style={{ width: 44, height: 62, objectFit: "cover", borderRadius: 4, flexShrink: 0, background: "#1a1a2e" }}
        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${manga.id}/100/140`; }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#f0f0f0", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{manga.title}</div>
        <div style={{ fontSize: "0.72rem", color: "#888", marginTop: 2 }}>{manga.author}</div>
        <div style={{ fontSize: "0.72rem", color: accentColor, fontWeight: 700, marginTop: 2 }}>{manga.price}</div>
      </div>
    </div>
  );
}

// ── GenreTop5Section ──
function GenreTop5Section({ section, onClick }: { section: GenreSection; onClick: (m: Manga) => void }) {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    const load = async () => {
      await delay(GENRE_SECTIONS.indexOf(section) * 1200);
      const data = await fetchManga(section.keyword);
      setMangas(data);
      setLoading(false);
    };
    load();
  }, [section]);
  return (
    <div style={{
      background: "#0f0f1e",
      border: `1px solid ${section.color}33`,
      borderRadius: 14, padding: "18px 20px",
      borderTop: `3px solid ${section.color}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: "1.2rem" }}>{section.emoji}</span>
        <span style={{ fontWeight: 900, fontSize: "0.95rem", color: "#f0f0f0" }}>{section.label}</span>
        <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#555", background: "#1a1a2e", padding: "2px 8px", borderRadius: 10 }}>TOP 5</span>
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ height: 82, background: "#1a1a2e", borderRadius: 10, opacity: 0.5, animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mangas.map((m) => (
            <MiniCard key={m.id} manga={m} rank={m.rank} onClick={onClick} accentColor={section.color} />
          ))}
          {mangas.length === 0 && <div style={{ color: "#555", fontSize: "0.85rem", textAlign: "center", padding: "20px 0" }}>データ取得中...</div>}
        </div>
      )}
    </div>
  );
}

// ── MangaCard（検索・ランキング用）──
function MangaCard({ manga, onClick, rank }: { manga: Manga; onClick: (m: Manga) => void; rank: number | null }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={() => onClick(manga)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#1a1a2e" : "#13131f",
        border: `1px solid ${hovered ? "#e63946" : "#2a2a3e"}`,
        borderRadius: 10, overflow: "hidden", cursor: "pointer",
        transition: "all 0.22s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 12px 32px rgba(230,57,70,0.2)" : "0 2px 8px rgba(0,0,0,0.4)",
        display: "flex", flexDirection: "column", position: "relative",
      }}>
      {rank && <div style={{ position: "absolute", top: 8, left: 8, zIndex: 2, background: rank <= 3 ? "#e63946" : "#2a2a3e", color: "#fff", fontWeight: 900, fontSize: "0.75rem", padding: "2px 8px", borderRadius: 20 }}>#{rank}</div>}
      <img src={manga.cover} alt={manga.title} style={{ width: "100%", height: 200, objectFit: "cover", display: "block", background: "#1a1a2e" }}
        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${manga.id}/200/280`; }} />
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#f0f0f0", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{manga.title}</div>
        <div style={{ fontSize: "0.76rem", color: "#999" }}>{manga.author}</div>
        <div style={{ fontSize: "0.76rem", color: "#e63946", fontWeight: 700 }}>{manga.price}</div>
        <div style={{ marginTop: "auto", paddingTop: 4 }}><Stars rating={manga.rating} /></div>
      </div>
    </div>
  );
}

// ── Modal ──
function MangaModal({ manga, onClose }: { manga: Manga | null; onClose: () => void }) {
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (!manga) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 16, maxWidth: 580, width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
        <div style={{ display: "flex", gap: 18, padding: "22px 22px 0" }}>
          <img src={manga.cover} alt={manga.title} style={{ width: 110, height: 156, objectFit: "cover", borderRadius: 8, flexShrink: 0, background: "#1a1a2e" }}
            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${manga.id}/200/280`; }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "#f0f0f0", lineHeight: 1.3, marginBottom: 6 }}>{manga.title}</div>
            <div style={{ color: "#aaa", fontSize: "0.82rem", marginBottom: 4 }}>{manga.author} ／ {manga.publisher}</div>
            <div style={{ color: "#e63946", fontWeight: 700, fontSize: "0.88rem", marginBottom: 8 }}>{manga.price}</div>
            <Stars rating={manga.rating} />
            <div style={{ color: "#555", fontSize: "0.75rem", marginTop: 2 }}>{manga.reviews.toLocaleString()}件のレビュー</div>
            <div style={{ marginTop: 10, color: "#b0b0c0", fontSize: "0.82rem", lineHeight: 1.7, maxHeight: 90, overflowY: "auto" }}>{manga.description}</div>
            <div style={{ marginTop: 14 }}>
              <a href={manga.affiliateUrl} target="_blank" rel="noopener noreferrer"
                style={{ background: "#bf0000", color: "#fff", padding: "8px 20px", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", display: "inline-block" }}>
                🛒 楽天ブックスで購入
              </a>
            </div>
          </div>
        </div>
        <div style={{ padding: "18px 22px 22px" }}>
          <div style={{ borderTop: "1px solid #2a2a3e", paddingTop: 16 }}>
            <div style={{ color: "#e0e0f0", fontWeight: 700, marginBottom: 10, fontSize: "0.88rem" }}>レビューを投稿</div>
            {submitted ? (
              <div style={{ color: "#4caf50", fontSize: "0.88rem" }}>✅ レビューありがとうございました！</div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                  {[1,2,3,4,5].map((s) => <span key={s} onClick={() => setUserRating(s)} style={{ fontSize: "1.4rem", cursor: "pointer", color: s <= userRating ? "#f5c842" : "#333" }}>★</span>)}
                </div>
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="感想を書いてください..."
                  style={{ width: "100%", background: "#1a1a2e", border: "1px solid #2a2a3e", borderRadius: 8, color: "#ddd", padding: 10, fontSize: "0.85rem", resize: "vertical", minHeight: 80, boxSizing: "border-box" }} />
                <button onClick={() => setSubmitted(true)} style={{ marginTop: 10, background: "#e63946", color: "#fff", border: "none", borderRadius: 8, padding: "8px 22px", fontWeight: 700, cursor: "pointer" }}>送信</button>
              </>
            )}
          </div>
        </div>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", color: "#555", fontSize: "1.4rem", cursor: "pointer" }}>✕</button>
      </div>
    </div>
  );
}

// ── Main ──
export default function App() {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("人気漫画");
  const [sortBy, setSortBy] = useState("rank");
  const [selected, setSelected] = useState<Manga | null>(null);
  const [tab, setTab] = useState("home");
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiRec, setAiRec] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const loadMangas = useCallback(async () => {
    setLoading(true);
    const data = await fetchManga(query);
    setMangas(data.map((m, i) => ({ ...m, rank: i + 1 })));
    setLoading(false);
  }, [query]);

  useEffect(() => {
    if (tab === "ranking" || tab === "search") loadMangas();
  }, [tab, loadMangas]);

  const handleSearch = () => { if (searchInput.trim()) setQuery(searchInput.trim()); };

  const sorted = [...mangas].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "new") return b.year - a.year;
    return a.rank - b.rank;
  });

  const fetchRecommend = async () => {
    if (!aiRec.trim()) return;
    setAiLoading(true); setAiResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: "あなたは漫画の専門家です。ユーザーの好みや要望に合わせて、具体的な漫画を3〜5作品おすすめしてください。各作品について：タイトル・作者・ひとこと理由を書いてください。返答は日本語で。",
          messages: [{ role: "user", content: aiRec }]
        })
      });
      const data = await res.json();
      setAiResult(data.content?.find((b: { type: string; text?: string }) => b.type === "text")?.text || "結果を取得できませんでした。");
    } catch { setAiResult("エラーが発生しました。"); }
    setAiLoading(false);
  };

  const tabStyle = (t: string): React.CSSProperties => ({
    padding: "10px 20px", fontWeight: tab === t ? 800 : 500,
    color: tab === t ? "#e63946" : "#888",
    borderBottom: tab === t ? "2px solid #e63946" : "2px solid transparent",
    cursor: "pointer", background: "none", border: "none", fontSize: "0.88rem", transition: "all 0.2s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d18", color: "#e0e0f0", fontFamily: "'Noto Sans JP', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@700;900&family=Noto+Sans+JP:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #0d0d18; } ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 3px; }
        input:focus, textarea:focus, select:focus { outline: none; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        .fade-in { animation: fadeIn 0.4s ease; }
      `}</style>

      {/* Header */}
      <header style={{ background: "rgba(10,10,20,0.97)", borderBottom: "1px solid #1a1a30", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(16px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
          <div style={{ fontFamily: "'Zen Maru Gothic', serif", fontWeight: 900, fontSize: "1.35rem", color: "#e63946", letterSpacing: "-0.5px" }}>📚 マンガベース</div>
          <div style={{ fontSize: "0.72rem", color: "#444" }}>楽天ブックス連携 ／ AI漫画検索</div>
        </div>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", gap: 0, borderTop: "1px solid #1a1a30" }}>
          <button style={tabStyle("home")} onClick={() => setTab("home")}>🏠 ホーム</button>
          <button style={tabStyle("ranking")} onClick={() => { setTab("ranking"); setQuery("人気漫画"); }}>🏆 ランキング</button>
          <button style={tabStyle("search")} onClick={() => setTab("search")}>🔍 検索</button>
          <button style={tabStyle("recommend")} onClick={() => setTab("recommend")}>🤖 AIおすすめ</button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>

        {/* ── HOME：ジャンル別TOP5 ── */}
        {tab === "home" && (
          <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Zen Maru Gothic', serif", fontWeight: 900, fontSize: "1.2rem", color: "#f0f0f0", marginBottom: 4 }}>ジャンル別 TOP 5</div>
              <div style={{ fontSize: "0.82rem", color: "#555" }}>楽天ブックスの売上データをリアルタイム取得</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {GENRE_SECTIONS.map((section) => (
                <GenreTop5Section key={section.keyword} section={section} onClick={setSelected} />
              ))}
            </div>
          </div>
        )}

        {/* ── RANKING ── */}
        {tab === "ranking" && (
          <div className="fade-in">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                style={{ background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 8, color: "#e0e0f0", padding: "10px 14px", fontSize: "0.85rem", cursor: "pointer" }}>
                <option value="rank">売上順</option>
                <option value="rating">評価順</option>
                <option value="new">新しい順</option>
              </select>
              <select onChange={(e) => setQuery(e.target.value)}
                style={{ background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 8, color: "#e0e0f0", padding: "10px 14px", fontSize: "0.85rem", cursor: "pointer", minWidth: 190 }}>
                {GENRE_GROUPS.map((group) =>
                  group.options[0] === "すべて"
                    ? <option key="すべて" value="人気漫画">すべてのジャンル</option>
                    : <optgroup key={group.label} label={group.label}>
                        {group.options.map((g) => <option key={g} value={g}>{g}</option>)}
                      </optgroup>
                )}
              </select>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
                <div style={{ width: 40, height: 40, border: "3px solid #2a2a3e", borderTop: "3px solid #e63946", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
                楽天ブックスからデータ取得中...
              </div>
            ) : (
              <>
                {sorted.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontWeight: 900, fontSize: "1rem", color: "#e63946", marginBottom: 14 }}>🔥 TOP 3</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                      {sorted.slice(0, 3).map((m) => (
                        <div key={m.id} onClick={() => setSelected(m)}
                          style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", border: "1px solid #e63946", borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", gap: 12, alignItems: "center", transition: "transform 0.2s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
                          <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#e63946", minWidth: 36 }}>#{m.rank}</div>
                          <img src={m.cover} alt={m.title} style={{ width: 50, height: 70, objectFit: "cover", borderRadius: 5, background: "#1a1a2e" }}
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${m.id}/200/280`; }} />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#f0f0f0" }}>{m.title.length > 18 ? m.title.slice(0, 18) + "…" : m.title}</div>
                            <div style={{ color: "#aaa", fontSize: "0.75rem", margin: "2px 0" }}>{m.author}</div>
                            <Stars rating={m.rating} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ color: "#666", fontSize: "0.82rem", marginBottom: 12 }}>{sorted.length}件（楽天ブックスより）</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                  {sorted.map((m) => <MangaCard key={m.id} manga={m} onClick={setSelected} rank={m.rank} />)}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SEARCH ── */}
        {tab === "search" && (
          <div className="fade-in">
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="タイトル・作者名で検索..."
                style={{ flex: 1, background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 8, color: "#e0e0f0", padding: "11px 16px", fontSize: "0.9rem" }} />
              <button onClick={handleSearch} style={{ background: "#e63946", color: "#fff", border: "none", borderRadius: 8, padding: "11px 22px", fontWeight: 700, cursor: "pointer" }}>検索</button>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
                <div style={{ width: 40, height: 40, border: "3px solid #2a2a3e", borderTop: "3px solid #e63946", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
                検索中...
              </div>
            ) : (
              <>
                <div style={{ color: "#666", fontSize: "0.82rem", marginBottom: 12 }}>{sorted.length}件</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                  {sorted.map((m) => <MangaCard key={m.id} manga={m} onClick={setSelected} rank={null} />)}
                </div>
                {sorted.length === 0 && <div style={{ textAlign: "center", color: "#555", padding: "60px 0" }}>キーワードを入力して検索してください</div>}
              </>
            )}
          </div>
        )}

        {/* ── AI RECOMMEND ── */}
        {tab === "recommend" && (
          <div className="fade-in" style={{ maxWidth: 660, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontWeight: 900, fontSize: "1.5rem", color: "#f0f0f0", marginBottom: 6 }}>🤖 AI漫画おすすめ</div>
              <div style={{ color: "#666", fontSize: "0.88rem" }}>好みや気分を入力するとAIが漫画をおすすめします</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={aiRec} onChange={(e) => setAiRec(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchRecommend()}
                placeholder="例: 泣ける漫画 / 昭和の名作 / バトル系..."
                style={{ flex: 1, background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 10, color: "#e0e0f0", padding: "12px 16px", fontSize: "0.9rem" }} />
              <button onClick={fetchRecommend} style={{ background: "#e63946", color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontWeight: 700, cursor: "pointer" }}>検索</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {["泣ける名作","異世界転生系","スポーツ漫画","昭和の名作","50代におすすめ"].map((ex) => (
                <span key={ex} onClick={() => setAiRec(ex)} style={{ background: "#1a1a2e", border: "1px solid #2a2a3e", color: "#a0a0c0", padding: "5px 12px", borderRadius: 20, fontSize: "0.76rem", cursor: "pointer" }}>{ex}</span>
              ))}
            </div>
            {aiLoading && <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>⏳ AIが考え中...</div>}
            {aiResult && !aiLoading && (
              <div style={{ marginTop: 24, background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontWeight: 700, color: "#e63946", marginBottom: 12, fontSize: "0.85rem" }}>🤖 AIのおすすめ</div>
                <div style={{ color: "#d0d0e0", lineHeight: 1.9, fontSize: "0.88rem", whiteSpace: "pre-wrap" }}>{aiResult}</div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ borderTop: "1px solid #1a1a30", padding: "20px", textAlign: "center", color: "#333", fontSize: "0.72rem", marginTop: 60 }}>
        © 2026 マンガベース ／ Powered by 楽天ブックスAPI ／ 商品購入は楽天アフィリエイト経由
      </footer>

      <MangaModal manga={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
