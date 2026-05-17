import { useState, useEffect, useRef } from "react";

// ── サンプルデータ（実装時は外部API: BookLive / Amazon PA-API に差し替え）──
const SAMPLE_MANGA = [
  { id: 1, title: "進撃の巨人", author: "諫山創", genre: ["アクション","ダーク"], rating: 4.8, reviews: 3241, cover: "https://picsum.photos/seed/shingeki/200/280", description: "壁の中に生きる人類と巨人の壮絶な戦い。", price: "748円/巻", publisher: "講談社", year: 2009, rank: 1 },
  { id: 2, title: "ONE PIECE", author: "尾田栄一郎", genre: ["冒険","少年"], rating: 4.9, reviews: 5812, cover: "https://picsum.photos/seed/onepiece/200/280", description: "海賊王を目指す少年ルフィの冒険譚。", price: "528円/巻", publisher: "集英社", year: 1997, rank: 2 },
  { id: 3, title: "鬼滅の刃", author: "吾峠呼世晴", genre: ["アクション","歴史"], rating: 4.7, reviews: 4109, cover: "https://picsum.photos/seed/kimetsu/200/280", description: "鬼と化した妹を救うため剣士となる炭治郎の物語。", price: "528円/巻", publisher: "集英社", year: 2016, rank: 3 },
  { id: 4, title: "呪術廻戦", author: "芥見下々", genre: ["ダーク","アクション"], rating: 4.6, reviews: 2934, cover: "https://picsum.photos/seed/jujutsu/200/280", description: "呪いと術師が交差する現代バトルファンタジー。", price: "528円/巻", publisher: "集英社", year: 2018, rank: 4 },
  { id: 5, title: "チェンソーマン", author: "藤本タツキ", genre: ["ダーク","アクション"], rating: 4.7, reviews: 2187, cover: "https://picsum.photos/seed/chainsaw/200/280", description: "悪魔と融合した青年デンジの激烈な生存記。", price: 528, publisher: "集英社", year: 2018, rank: 5 },
  { id: 6, title: "葬送のフリーレン", author: "山田鐘人", genre: ["ファンタジー","ヒューマンドラマ"], rating: 4.8, reviews: 1893, cover: "https://picsum.photos/seed/frieren/200/280", description: "勇者一行の旅から数百年後、エルフの魔法使いが紡ぐ旅路。", price: "528円/巻", publisher: "小学館", year: 2020, rank: 6 },
  { id: 7, title: "スパイファミリー", author: "遠藤達哉", genre: ["コメディ","アクション"], rating: 4.6, reviews: 2201, cover: "https://picsum.photos/seed/spyfamily/200/280", description: "スパイ・暗殺者・超能力者が織りなす偽装家族コメディ。", price: "528円/巻", publisher: "集英社", year: 2019, rank: 7 },
  { id: 8, title: "BLUE LOCK", author: "金城宗幸", genre: ["スポーツ","少年"], rating: 4.5, reviews: 1654, cover: "https://picsum.photos/seed/bluelock/200/280", description: "最強のエゴイストFWを育成するサッカー育成プロジェクト。", price: "528円/巻", publisher: "講談社", year: 2018, rank: 8 },
];

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
const GENRES = ["すべて", ...GENRE_GROUPS.slice(1).flatMap(g => g.options)];

// ── Stars Component ──
function Stars({ rating }) {
  return (
    <span style={{ color: "#f5c842", letterSpacing: "1px", fontSize: "0.85rem" }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
      <span style={{ color: "#aaa", fontSize: "0.78rem", marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </span>
  );
}

// ── MangaCard ──
function MangaCard({ manga, onClick, rank }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onClick(manga)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#1a1a2e" : "#13131f",
        border: `1px solid ${hovered ? "#e63946" : "#2a2a3e"}`,
        borderRadius: 10,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.22s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 12px 32px rgba(230,57,70,0.2)" : "0 2px 8px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {rank && (
        <div style={{
          position: "absolute", top: 8, left: 8, zIndex: 2,
          background: rank <= 3 ? "#e63946" : "#2a2a3e",
          color: "#fff", fontWeight: 900, fontSize: "0.75rem",
          padding: "2px 8px", borderRadius: 20,
          fontFamily: "'Zen Maru Gothic', serif",
        }}>#{rank}</div>
      )}
      <img src={manga.cover} alt={manga.title}
        style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#f0f0f0", lineHeight: 1.3,
          fontFamily: "'Zen Maru Gothic', serif" }}>{manga.title}</div>
        <div style={{ fontSize: "0.78rem", color: "#999" }}>{manga.author}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
          {manga.genre.map(g => (
            <span key={g} style={{ background: "#1e1e35", color: "#a0a0c0",
              fontSize: "0.68rem", padding: "2px 7px", borderRadius: 10 }}>{g}</span>
          ))}
        </div>
        <div style={{ marginTop: "auto", paddingTop: 8 }}>
          <Stars rating={manga.rating} />
          <div style={{ fontSize: "0.72rem", color: "#666", marginTop: 2 }}>{manga.reviews.toLocaleString()}件のレビュー</div>
        </div>
      </div>
    </div>
  );
}

// ── Modal ──
function MangaModal({ manga, onClose }) {
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (!manga) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)",
      zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 16,
        maxWidth: 600, width: "100%", maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
      }}>
        <div style={{ display: "flex", gap: 20, padding: "24px 24px 0" }}>
          <img src={manga.cover} alt={manga.title}
            style={{ width: 130, height: 185, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Zen Maru Gothic', serif", fontSize: "1.35rem",
              fontWeight: 900, color: "#f0f0f0", lineHeight: 1.3, marginBottom: 6 }}>{manga.title}</div>
            <div style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: 10 }}>{manga.author} ／ {manga.publisher} ／ {manga.year}年〜</div>
            <Stars rating={manga.rating} />
            <div style={{ color: "#666", fontSize: "0.78rem", marginTop: 2 }}>{manga.reviews.toLocaleString()}件のレビュー</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
              {manga.genre.map(g => (
                <span key={g} style={{ background: "#1e1e35", color: "#a0a0c0", fontSize: "0.75rem", padding: "3px 10px", borderRadius: 12 }}>{g}</span>
              ))}
            </div>
            <div style={{ marginTop: 14, color: "#c0c0d0", fontSize: "0.88rem", lineHeight: 1.7 }}>{manga.description}</div>
            <div style={{ marginTop: 14 }}>
              <span style={{ background: "#e63946", color: "#fff", padding: "6px 18px",
                borderRadius: 8, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                📖 Amazon で購入
              </span>
            </div>
          </div>
        </div>

        {/* レビュー投稿 */}
        <div style={{ padding: "20px 24px 24px" }}>
          <div style={{ borderTop: "1px solid #2a2a3e", paddingTop: 18 }}>
            <div style={{ color: "#e0e0f0", fontWeight: 700, marginBottom: 10, fontSize: "0.9rem" }}>レビューを投稿</div>
            {submitted ? (
              <div style={{ color: "#4caf50", fontSize: "0.9rem" }}>✅ レビューありがとうございました！</div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} onClick={() => setUserRating(s)}
                      style={{ fontSize: "1.4rem", cursor: "pointer", color: s <= userRating ? "#f5c842" : "#333", transition: "color 0.15s" }}>★</span>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="感想を書いてください..."
                  style={{
                    width: "100%", background: "#1a1a2e", border: "1px solid #2a2a3e",
                    borderRadius: 8, color: "#ddd", padding: 10, fontSize: "0.85rem",
                    resize: "vertical", minHeight: 80, boxSizing: "border-box",
                  }} />
                <button onClick={() => setSubmitted(true)}
                  style={{
                    marginTop: 10, background: "#e63946", color: "#fff", border: "none",
                    borderRadius: 8, padding: "8px 22px", fontWeight: 700, cursor: "pointer",
                    fontSize: "0.85rem"
                  }}>送信</button>
              </>
            )}
          </div>
        </div>

        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 18, background: "none",
          border: "none", color: "#666", fontSize: "1.4rem", cursor: "pointer"
        }}>✕</button>
      </div>
    </div>
  );
}

// ── Main App ──
export default function MangaSite() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("すべて");
  const [sortBy, setSortBy] = useState("rank");
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("ranking"); // ranking | search | recommend
  const [aiRec, setAiRec] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const inputRef = useRef(null);

  // フィルタ・ソート
  const filtered = SAMPLE_MANGA
    .filter(m => {
      const q = query.trim().toLowerCase();
      if (q && !m.title.toLowerCase().includes(q) && !m.author.toLowerCase().includes(q)) return false;
      if (genre !== "すべて" && !m.genre.includes(genre)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rank") return a.rank - b.rank;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviews") return b.reviews - a.reviews;
      if (sortBy === "new") return b.year - a.year;
      return 0;
    });

  // AIレコメンド
  const fetchRecommend = async () => {
    if (!aiRec.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "あなたは漫画の専門家です。ユーザーの好みや要望に合わせて、具体的な漫画を3〜5作品おすすめしてください。各作品について：タイトル・作者・ひとこと理由を簡潔に書いてください。返答は日本語で。",
          messages: [{ role: "user", content: aiRec }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "結果を取得できませんでした。";
      setAiResult(text);
    } catch {
      setAiResult("エラーが発生しました。しばらくしてから再度お試しください。");
    }
    setAiLoading(false);
  };

  const tabStyle = (t) => ({
    padding: "10px 24px",
    fontWeight: tab === t ? 800 : 500,
    color: tab === t ? "#e63946" : "#888",
    borderBottom: tab === t ? "2px solid #e63946" : "2px solid transparent",
    cursor: "pointer",
    background: "none",
    border: "none",
    borderBottom: tab === t ? "2px solid #e63946" : "2px solid transparent",
    fontSize: "0.9rem",
    fontFamily: "'Zen Maru Gothic', serif",
    transition: "all 0.2s",
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d18",
      color: "#e0e0f0",
      fontFamily: "'Noto Sans JP', sans-serif",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;700;900&family=Noto+Sans+JP:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d0d18; }
        ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 3px; }
        textarea:focus, input:focus { outline: none; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        .card-grid { animation: fadeIn 0.4s ease; }
      `}</style>

      {/* Header */}
      <header style={{
        background: "rgba(13,13,24,0.95)",
        borderBottom: "1px solid #1e1e35",
        position: "sticky", top: 0, zIndex: 50,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ fontFamily: "'Zen Maru Gothic', serif", fontWeight: 900,
            fontSize: "1.4rem", color: "#e63946", letterSpacing: "-0.5px" }}>
            📚 マンガベース
          </div>
          <div style={{ fontSize: "0.78rem", color: "#555" }}>
            漫画検索・ランキング・レビューサイト
          </div>
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px",
          display: "flex", gap: 0, borderTop: "1px solid #1e1e35" }}>
          <button style={tabStyle("ranking")} onClick={() => setTab("ranking")}>🏆 ランキング</button>
          <button style={tabStyle("search")} onClick={() => setTab("search")}>🔍 検索</button>
          <button style={tabStyle("recommend")} onClick={() => setTab("recommend")}>🤖 AIおすすめ</button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 20px" }}>

        {/* ── RANKING & SEARCH ── */}
        {(tab === "ranking" || tab === "search") && (
          <>
            {/* Controls */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
              {tab === "search" && (
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="タイトル・作者名で検索..."
                  style={{
                    flex: "1 1 240px",
                    background: "#13131f", border: "1px solid #2a2a3e",
                    borderRadius: 8, color: "#e0e0f0", padding: "10px 16px",
                    fontSize: "0.9rem",
                  }}
                />
              )}
              <select value={genre} onChange={e => setGenre(e.target.value)}
                style={{ background: "#13131f", border: "1px solid #2a2a3e",
                  borderRadius: 8, color: "#e0e0f0", padding: "10px 14px", fontSize: "0.85rem",
                  cursor: "pointer", minWidth: 190 }}>
                {GENRE_GROUPS.map(group =>
                  group.options[0] === "すべて"
                    ? <option key="すべて" value="すべて">すべてのジャンル</option>
                    : <optgroup key={group.label} label={group.label}>
                        {group.options.map(g => <option key={g} value={g}>{g}</option>)}
                      </optgroup>
                )}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ background: "#13131f", border: "1px solid #2a2a3e",
                  borderRadius: 8, color: "#e0e0f0", padding: "10px 14px", fontSize: "0.85rem",
                  cursor: "pointer" }}>
                <option value="rank">ランキング順</option>
                <option value="rating">評価順</option>
                <option value="reviews">レビュー数順</option>
                <option value="new">新しい順</option>
              </select>
            </div>

            {/* Top 3 Banner (ranking tab only) */}
            {tab === "ranking" && !genre.match(/^(?!すべて)/) && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: "'Zen Maru Gothic', serif", fontWeight: 900,
                  fontSize: "1.1rem", color: "#e63946", marginBottom: 16 }}>🔥 TOP 3</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                  {filtered.slice(0, 3).map(m => (
                    <div key={m.id} onClick={() => setSelected(m)}
                      style={{
                        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                        border: "1px solid #e63946",
                        borderRadius: 12, padding: "16px 18px",
                        cursor: "pointer", display: "flex", gap: 14, alignItems: "center",
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <div style={{ fontSize: "2rem", fontWeight: 900, color: "#e63946",
                        fontFamily: "'Zen Maru Gothic', serif", minWidth: 40 }}>#{m.rank}</div>
                      <img src={m.cover} alt={m.title}
                        style={{ width: 56, height: 78, objectFit: "cover", borderRadius: 6 }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "1rem", color: "#f0f0f0",
                          fontFamily: "'Zen Maru Gothic', serif" }}>{m.title}</div>
                        <div style={{ color: "#aaa", fontSize: "0.8rem" }}>{m.author}</div>
                        <Stars rating={m.rating} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grid */}
            <div style={{ fontFamily: "'Zen Maru Gothic', serif", fontWeight: 700,
              color: "#888", fontSize: "0.85rem", marginBottom: 14 }}>
              {filtered.length}件表示
            </div>
            <div className="card-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
              gap: 18,
            }}>
              {filtered.map(m => (
                <MangaCard key={m.id} manga={m} onClick={setSelected} rank={sortBy === "rank" ? m.rank : null} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", color: "#555", padding: "60px 0", fontSize: "0.95rem" }}>
                該当する漫画が見つかりませんでした。
              </div>
            )}
          </>
        )}

        {/* ── AI RECOMMEND ── */}
        {tab === "recommend" && (
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontFamily: "'Zen Maru Gothic', serif", fontWeight: 900,
                fontSize: "1.6rem", color: "#f0f0f0", marginBottom: 8 }}>🤖 AI漫画おすすめ</div>
              <div style={{ color: "#888", fontSize: "0.9rem" }}>
                好みや気分を入力すると、AIが漫画をおすすめします
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={aiRec}
                onChange={e => setAiRec(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchRecommend()}
                placeholder="例: 泣ける漫画が読みたい / バトル系でアニメ化済み..."
                style={{
                  flex: 1, background: "#13131f", border: "1px solid #2a2a3e",
                  borderRadius: 10, color: "#e0e0f0", padding: "12px 16px", fontSize: "0.9rem",
                }}
              />
              <button onClick={fetchRecommend}
                style={{
                  background: "#e63946", color: "#fff", border: "none",
                  borderRadius: 10, padding: "12px 22px", fontWeight: 700,
                  cursor: "pointer", fontSize: "0.9rem", whiteSpace: "nowrap",
                }}>検索</button>
            </div>

            {/* Examples */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
              {["泣ける名作","異世界転生系","スポーツ漫画","ミステリー・サスペンス","子供と一緒に読める"].map(ex => (
                <span key={ex} onClick={() => { setAiRec(ex); }}
                  style={{ background: "#1a1a2e", border: "1px solid #2a2a3e",
                    color: "#a0a0c0", padding: "5px 12px", borderRadius: 20,
                    fontSize: "0.78rem", cursor: "pointer" }}>{ex}</span>
              ))}
            </div>

            {aiLoading && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>⏳</div>
                AIが考え中...
              </div>
            )}
            {aiResult && !aiLoading && (
              <div style={{
                marginTop: 28, background: "#13131f", border: "1px solid #2a2a3e",
                borderRadius: 14, padding: "22px 24px",
                animation: "fadeIn 0.4s ease",
              }}>
                <div style={{ fontWeight: 700, color: "#e63946", marginBottom: 12, fontSize: "0.85rem" }}>
                  🤖 AIのおすすめ
                </div>
                <div style={{ color: "#d0d0e0", lineHeight: 1.9, fontSize: "0.9rem",
                  whiteSpace: "pre-wrap" }}>{aiResult}</div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1e1e35", padding: "24px 20px",
        textAlign: "center", color: "#444", fontSize: "0.78rem", marginTop: 60 }}>
        © 2026 マンガベース ／ データ提供: Amazon PA-API / BookLive API（実装時に接続）
      </footer>

      {/* Modal */}
      <MangaModal manga={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
