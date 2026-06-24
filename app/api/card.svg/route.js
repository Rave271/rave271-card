import https from "https";

export const dynamic = "force-dynamic";

/* ---------------- FETCH JSON ---------------- */
function fetchJSON(url, token) {
  return new Promise((resolve, reject) => {
    const headers = { "User-Agent": "rave271-card", Accept: "application/json" };
    if (token && url.includes("api.github.com")) {
      headers.Authorization = `token ${token}`;
    }
    https.get(url, { headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (err) { reject(err); }
      });
    }).on("error", reject);
  });
}

/* ---------------- TEXT HELPERS ---------------- */
function escapeXML(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncateText(str = "", maxLength = 30) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3).trim() + "...";
}

/* ---------------- GITHUB STATS ---------------- */
async function getGitHubStats(username, token) {
  try {
    const [user, repos] = await Promise.all([
      fetchJSON(`https://api.github.com/users/${username}`, token),
      fetchJSON(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, token),
    ]);
    const stars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
    const langs = {};
    repos.forEach((repo) => {
      if (repo.language) langs[repo.language] = (langs[repo.language] || 0) + 1;
    });
    const topLangs = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([lang]) => lang);
    return { name: user.name || username, followers: user.followers || 0, public_repos: user.public_repos || 0, stars, topLangs };
  } catch (error) {
    console.error("GitHub fetch error:", error);
    return { name: "Raghav Verma", followers: 0, public_repos: 0, stars: 0, topLangs: ["Python", "Java", "JavaScript"] };
  }
}

/* ---------------- LAST.FM ---------------- */
async function getNowPlaying() {
  const apiKey = process.env.LASTFM_API_KEY;
  const username = "Rave271";
  try {
    const data = await fetchJSON(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`
    );
    const track = data?.recenttracks?.track?.[0];
    if (!track) return { song: "NO SIGNAL", artist: "OFFLINE", playing: false };
    return {
      song: track.name || "UNKNOWN TRACK",
      artist: track.artist["#text"] || "UNKNOWN ARTIST",
      playing: track["@attr"]?.nowplaying === "true",
    };
  } catch (error) {
    console.error("Last.fm error:", error);
    return { song: "SIGNAL LOST", artist: "RETRYING...", playing: false };
  }
}

/* ---------------- SKILL BADGES ---------------- */
function buildBadges(startY) {
  const items = [
    { label: "PYTHON", active: false },
    { label: "JAVA", active: false },
    { label: "MERN", active: false },
    { label: "KERAS", active: true },
    { label: "SCIKIT-LEARN", active: false },
    { label: "PANDAS", active: false },
    { label: "NUMPY", active: false },
    { label: "LINUX", active: false },
  ];

  const output = [];
  let x = 50;
  let y = startY;
  const CHAR_W = 7.5;
  const PAD = 22;
  const H = 26;
  const GAP = 8;

  items.forEach(({ label, active }) => {
    const width = label.length * CHAR_W + PAD;
    if (x + width > 750) { x = 50; y += H + GAP; }

    const fill   = active ? "#e34a1e" : "#f5f0e8";
    const stroke = active ? "#e34a1e" : "#1a1a1a";
    const tFill  = active ? "#f5f0e8" : "#1a1a1a";

    output.push(
      `<rect x="${x}" y="${y}" width="${width}" height="${H}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>` +
      `<text x="${x + width / 2}" y="${y + 17}" font-size="10" font-weight="700" fill="${tFill}" text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.08em">${label}</text>`
    );
    x += width + GAP;
  });

  return output.join("");
}

/* ---------------- SVG ---------------- */
function buildSVG(stats, music) {
  const { public_repos, stars, followers } = stats;
  const { song, artist, playing } = music;

  const safeSong   = escapeXML(truncateText(song.toUpperCase(), 26));
  const safeArtist = escapeXML(truncateText(artist.toUpperCase(), 34));

  const CREAM  = "#f5f0e8";
  const WHITE  = "#ffffff";
  const BLACK  = "#1a1a1a";
  const RED    = "#e34a1e";
  const GRAY   = "#888888";
  const BW     = 3; // border width throughout

  // Layout Y positions
  const CARD_X = 40, CARD_W = 720;
  const HERO_Y = 30,  HERO_H = 220;
  const FOCUS_Y = 250, FOCUS_H = 175;
  const TAGS_Y = 425,  TAGS_H = 60;
  const STATS_Y = 485, STATS_H = 100;
  const MUSIC_Y = 585, MUSIC_H = 140;
  const FOOT_Y  = 725, FOOT_H = 50;
  const TOTAL_H = FOOT_Y + FOOT_H + 10;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${TOTAL_H}" viewBox="0 0 800 ${TOTAL_H}">

  <!-- page background: same cream so card bleeds into page -->
  <rect width="800" height="${TOTAL_H}" fill="${CREAM}"/>

  <!-- ── OUTER CARD BORDER ── -->
  <rect x="${CARD_X}" y="${HERO_Y}" width="${CARD_W}" height="${FOOT_Y + FOOT_H - HERO_Y}"
    fill="none" stroke="${BLACK}" stroke-width="${BW}"/>

  <!-- ══════════════════════════
       HERO — white fill inside cream card
  ══════════════════════════ -->
  <rect x="${CARD_X}" y="${HERO_Y}" width="${CARD_W}" height="${HERO_H}"
    fill="${WHITE}" stroke="${BLACK}" stroke-width="${BW}"/>
  <!-- inner inset line -->
  <rect x="${CARD_X + 7}" y="${HERO_Y + 7}" width="${CARD_W - 14}" height="${HERO_H - 14}"
    fill="none" stroke="${BLACK}" stroke-width="1"/>

  <text x="400" y="${HERO_Y + 120}"
    font-size="108" font-weight="900" fill="${BLACK}"
    text-anchor="middle" font-family="Impact, Arial Black, Arial">RAVE 271</text>

  <text x="400" y="${HERO_Y + 162}"
    font-size="12" fill="#777" text-anchor="middle"
    font-family="Arial, sans-serif" letter-spacing="0.18em">RAGHAV VERMA • ML • SYSTEMS • FULL STACK</text>

  <rect x="322" y="${HERO_Y + 178}" width="156" height="24"
    fill="none" stroke="${RED}" stroke-width="2"/>
  <text x="400" y="${HERO_Y + 195}"
    font-size="10" font-weight="700" fill="${RED}"
    text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.12em">OPEN SOURCE</text>

  <!-- ══════════════════════════
       CORE FOCUS — cream bg
  ══════════════════════════ -->
  <rect x="${CARD_X}" y="${FOCUS_Y}" width="${CARD_W}" height="${FOCUS_H}"
    fill="${CREAM}" stroke="${BLACK}" stroke-width="${BW}"/>

  <text x="400" y="${FOCUS_Y + 32}"
    font-size="11" fill="${GRAY}" text-anchor="middle"
    font-family="Arial, sans-serif" letter-spacing="0.18em">CORE FOCUS</text>

  <text x="400" y="${FOCUS_Y + 88}"
    font-size="52" font-weight="900" fill="${BLACK}"
    text-anchor="middle" font-family="Impact, Arial Black, Arial">MACHINE LEARNING</text>

  <text x="400" y="${FOCUS_Y + 150}"
    font-size="52" font-weight="900" fill="${BLACK}"
    text-anchor="middle" font-family="Impact, Arial Black, Arial">SYSTEMS &amp; FULL STACK</text>

  <!-- ══════════════════════════
       TAGS — white bg
  ══════════════════════════ -->
  <rect x="${CARD_X}" y="${TAGS_Y}" width="${CARD_W}" height="${TAGS_H}"
    fill="${WHITE}" stroke="${BLACK}" stroke-width="${BW}"/>

  ${buildBadges(TAGS_Y + 17)}

  <!-- ══════════════════════════
       STATS — cream bg, 3 columns
  ══════════════════════════ -->
  <rect x="${CARD_X}" y="${STATS_Y}" width="${CARD_W}" height="${STATS_H}"
    fill="${CREAM}" stroke="${BLACK}" stroke-width="${BW}"/>

  <!-- column dividers -->
  <line x1="${CARD_X + CARD_W / 3}" y1="${STATS_Y}" x2="${CARD_X + CARD_W / 3}" y2="${STATS_Y + STATS_H}" stroke="${BLACK}" stroke-width="${BW}"/>
  <line x1="${CARD_X + (CARD_W / 3) * 2}" y1="${STATS_Y}" x2="${CARD_X + (CARD_W / 3) * 2}" y2="${STATS_Y + STATS_H}" stroke="${BLACK}" stroke-width="${BW}"/>

  <text x="${CARD_X + CARD_W / 6}" y="${STATS_Y + 58}" font-size="44" font-weight="900" fill="${BLACK}" text-anchor="middle" font-family="Impact, Arial">${public_repos}</text>
  <text x="${CARD_X + CARD_W / 6}" y="${STATS_Y + 80}" font-size="10" fill="${GRAY}" text-anchor="middle" font-family="Arial" letter-spacing="0.14em">REPOS</text>

  <text x="400" y="${STATS_Y + 58}" font-size="44" font-weight="900" fill="${BLACK}" text-anchor="middle" font-family="Impact, Arial">${stars}</text>
  <text x="400" y="${STATS_Y + 80}" font-size="10" fill="${GRAY}" text-anchor="middle" font-family="Arial" letter-spacing="0.14em">STARS</text>

  <text x="${CARD_X + CARD_W - CARD_W / 6}" y="${STATS_Y + 58}" font-size="44" font-weight="900" fill="${BLACK}" text-anchor="middle" font-family="Impact, Arial">${followers}</text>
  <text x="${CARD_X + CARD_W - CARD_W / 6}" y="${STATS_Y + 80}" font-size="10" fill="${GRAY}" text-anchor="middle" font-family="Arial" letter-spacing="0.14em">FOLLOWERS</text>

  <!-- ══════════════════════════
       MUSIC — black bg
  ══════════════════════════ -->
  <rect x="${CARD_X}" y="${MUSIC_Y}" width="${CARD_W}" height="${MUSIC_H}"
    fill="${BLACK}" stroke="${BLACK}" stroke-width="${BW}"/>
  <!-- red left bar -->
  <rect x="${CARD_X}" y="${MUSIC_Y}" width="6" height="${MUSIC_H}" fill="${RED}"/>

  <text x="400" y="${MUSIC_Y + 30}"
    font-size="10" font-weight="700" fill="${RED}"
    text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.16em">SOUNDTRACK TO SHIPPING</text>

  <text x="400" y="${MUSIC_Y + 78}"
    font-size="34" font-weight="900" fill="${CREAM}"
    text-anchor="middle" font-family="Impact, Arial Black">${safeSong}</text>

  <text x="400" y="${MUSIC_Y + 105}"
    font-size="13" fill="#999"
    text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.1em">${safeArtist}</text>

  <text x="400" y="${MUSIC_Y + 127}"
    font-size="10" fill="${playing ? "#44cc44" : "#555"}"
    text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.12em">${playing ? "▶  PLAYING NOW" : "LAST PLAYED"}</text>

  <!-- ══════════════════════════
       FOOTER — cream bg
  ══════════════════════════ -->
  <rect x="${CARD_X}" y="${FOOT_Y}" width="${CARD_W}" height="${FOOT_H}"
    fill="${CREAM}" stroke="${BLACK}" stroke-width="${BW}"/>

  <text x="${CARD_X + 18}" y="${FOOT_Y + 22}"
    font-size="15" font-weight="700" fill="${BLACK}"
    font-family="Arial, sans-serif" letter-spacing="0.04em">GITHUB.COM/RAVE271</text>

  <text x="${CARD_X + 18}" y="${FOOT_Y + 40}"
    font-size="10" fill="${GRAY}"
    font-family="Arial, sans-serif" letter-spacing="0.1em">BUILD. BREAK. REPEAT.</text>

  <text x="${CARD_X + CARD_W - 18}" y="${FOOT_Y + 18}"
    font-size="9" fill="${GRAY}" text-anchor="end"
    font-family="Arial, sans-serif" letter-spacing="0.12em">STATUS</text>

  <text x="${CARD_X + CARD_W - 18}" y="${FOOT_Y + 38}"
    font-size="15" font-weight="900" fill="#22aa22" text-anchor="end"
    font-family="Arial, sans-serif" letter-spacing="0.08em">ONLINE</text>

</svg>`;
}

/* ---------------- API ROUTE ---------------- */
export async function GET() {
  const username = "Rave271";
  const token    = process.env.GITHUB_TOKEN;

  const [stats, music] = await Promise.all([
    getGitHubStats(username, token),
    getNowPlaying(),
  ]);

  const svg = buildSVG(stats, music);

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
}