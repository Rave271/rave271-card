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
    { label: "PYTHON",      active: false },
    { label: "JAVA",        active: false },
    { label: "MERN",        active: false },
    { label: "KERAS",       active: true  },
    { label: "SCIKIT-LEARN",active: false },
    { label: "PANDAS",      active: false },
    { label: "NUMPY",       active: false },
    { label: "LINUX",       active: false },
  ];

  const CHAR_W = 7.5, PAD = 22, H = 26, GAP = 8;
  let x = 50, y = startY;
  const out = [];

  items.forEach(({ label, active }) => {
    const w = label.length * CHAR_W + PAD;
    if (x + w > 750) { x = 50; y += H + GAP; }

    const fill   = active ? "#e34a1e" : "none";
    const stroke = active ? "#e34a1e" : "#2a2a2a";
    const tFill  = active ? "#e8e2d6" : "#555555";

    out.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${H}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>` +
      `<text x="${x + w / 2}" y="${y + 17}" font-size="10" font-weight="700" fill="${tFill}" text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.08em">${label}</text>`
    );
    x += w + GAP;
  });

  // height = rows used, from startY to bottom of last row + padding
  const lastRowBottom = y + H;
  const totalHeight = lastRowBottom - startY + 17; // 17px bottom padding

  return { svg: out.join(""), height: totalHeight };
}

/* ---------------- SVG ---------------- */
function buildSVG(stats, music) {
  const { public_repos, stars, followers } = stats;
  const { song, artist, playing } = music;

  const safeSong   = escapeXML(truncateText(song.toUpperCase(), 26));
  const safeArtist = escapeXML(truncateText(artist.toUpperCase(), 34));

  /* B — Pitch black ink palette */
  const PAPER  = "#e8e2d6";   // aged paper hero bg
  const BLACK  = "#0d0d0d";   // body bg
  const DARK   = "#080808";   // music panel bg
  const RED    = "#e34a1e";   // accent
  const BORDER = "#333333";   // section borders
  const BDIM   = "#222222";   // stat column dividers
  const GRAY   = "#777777";   // hero subtitle
  const MID    = "#444444";   // stat labels
  const DIM    = "#333333";   // last played
  const BW     = 3;           // border width

  /* Layout */
  const CX = 40, CW = 720;
  const HERO_Y  = 30,  HERO_H  = 230;
  const FOCUS_Y = 260, FOCUS_H = 178;
  const TAGS_Y  = 438;
  const badges  = buildBadges(TAGS_Y + 17);
  const TAGS_H  = badges.height;
  const STATS_Y = TAGS_Y + TAGS_H;
  const STATS_H = 102;
  const MUSIC_Y = STATS_Y + STATS_H;
  const MUSIC_H = 148;
  const FOOT_Y  = MUSIC_Y + MUSIC_H;
  const FOOT_H  = 50;
  const TOTAL   = FOOT_Y + FOOT_H + 10;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${TOTAL}" viewBox="0 0 800 ${TOTAL}">

  <rect width="800" height="${TOTAL}" fill="${BLACK}"/>

  <!-- outer card border -->
  <rect x="${CX}" y="${HERO_Y}" width="${CW}" height="${FOOT_Y + FOOT_H - HERO_Y}" fill="none" stroke="${BORDER}" stroke-width="${BW}"/>

  <!-- ── HERO: aged paper ── -->
  <rect x="${CX}" y="${HERO_Y}" width="${CW}" height="${HERO_H}" fill="${PAPER}" stroke="${BORDER}" stroke-width="${BW}"/>
  <rect x="${CX + 7}" y="${HERO_Y + 7}" width="${CW - 14}" height="${HERO_H - 14}" fill="none" stroke="${BLACK}" stroke-width="1.5"/>

  <text x="400" y="${HERO_Y + 130}" font-size="108" font-weight="900" fill="${BLACK}" text-anchor="middle" font-family="Impact, Arial Black, Arial">RAVE 271</text>

  <text x="400" y="${HERO_Y + 172}" font-size="12" fill="${GRAY}" text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.18em">RAGHAV VERMA • ML • SYSTEMS • FULL STACK</text>

  <rect x="322" y="${HERO_Y + 188}" width="156" height="24" fill="none" stroke="${RED}" stroke-width="2"/>
  <text x="400" y="${HERO_Y + 205}" font-size="10" font-weight="700" fill="${RED}" text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.12em">OPEN SOURCE</text>

  <!-- ── CORE FOCUS: black bg, paper text ── -->
  <rect x="${CX}" y="${FOCUS_Y}" width="${CW}" height="${FOCUS_H}" fill="${BLACK}" stroke="${BORDER}" stroke-width="${BW}"/>

  <text x="400" y="${FOCUS_Y + 34}" font-size="11" fill="${MID}" text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.18em">CORE FOCUS</text>

  <text x="400" y="${FOCUS_Y + 96}" font-size="52" font-weight="900" fill="${PAPER}" text-anchor="middle" font-family="Impact, Arial Black, Arial">MACHINE LEARNING</text>

  <text x="400" y="${FOCUS_Y + 158}" font-size="52" font-weight="900" fill="${PAPER}" text-anchor="middle" font-family="Impact, Arial Black, Arial">SYSTEMS &amp; FULL STACK</text>

  <!-- ── TAGS: black bg ── -->
  <rect x="${CX}" y="${TAGS_Y}" width="${CW}" height="${TAGS_H}" fill="${BLACK}" stroke="${BORDER}" stroke-width="${BW}"/>
  ${badges.svg}

  <!-- ── STATS: black bg, 3 columns ── -->
  <rect x="${CX}" y="${STATS_Y}" width="${CW}" height="${STATS_H}" fill="${BLACK}" stroke="${BORDER}" stroke-width="${BW}"/>
  <line x1="${CX + CW / 3}" y1="${STATS_Y}" x2="${CX + CW / 3}" y2="${STATS_Y + STATS_H}" stroke="${BDIM}" stroke-width="${BW}"/>
  <line x1="${CX + (CW / 3) * 2}" y1="${STATS_Y}" x2="${CX + (CW / 3) * 2}" y2="${STATS_Y + STATS_H}" stroke="${BDIM}" stroke-width="${BW}"/>

  <text x="${CX + CW / 6}" y="${STATS_Y + 58}" font-size="44" font-weight="900" fill="${PAPER}" text-anchor="middle" font-family="Impact, Arial">${public_repos}</text>
  <text x="${CX + CW / 6}" y="${STATS_Y + 80}" font-size="10" fill="${MID}" text-anchor="middle" font-family="Arial" letter-spacing="0.14em">REPOS</text>

  <text x="400" y="${STATS_Y + 58}" font-size="44" font-weight="900" fill="${PAPER}" text-anchor="middle" font-family="Impact, Arial">${stars}</text>
  <text x="400" y="${STATS_Y + 80}" font-size="10" fill="${MID}" text-anchor="middle" font-family="Arial" letter-spacing="0.14em">STARS</text>

  <text x="${CX + CW - CW / 6}" y="${STATS_Y + 58}" font-size="44" font-weight="900" fill="${PAPER}" text-anchor="middle" font-family="Impact, Arial">${followers}</text>
  <text x="${CX + CW - CW / 6}" y="${STATS_Y + 80}" font-size="10" fill="${MID}" text-anchor="middle" font-family="Arial" letter-spacing="0.14em">FOLLOWERS</text>

  <!-- ── MUSIC: near-black bg, red left bar ── -->
  <rect x="${CX}" y="${MUSIC_Y}" width="${CW}" height="${MUSIC_H}" fill="${DARK}" stroke="${BORDER}" stroke-width="${BW}"/>
  <rect x="${CX}" y="${MUSIC_Y}" width="5" height="${MUSIC_H}" fill="${RED}"/>

  <text x="400" y="${MUSIC_Y + 34}" font-size="10" font-weight="700" fill="${RED}" text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.16em">SOUNDTRACK TO SHIPPING</text>

  <text x="400" y="${MUSIC_Y + 86}" font-size="34" font-weight="900" fill="${PAPER}" text-anchor="middle" font-family="Impact, Arial Black">${safeSong}</text>

  <text x="400" y="${MUSIC_Y + 112}" font-size="13" fill="#555555" text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.1em">${safeArtist}</text>

  <text x="400" y="${MUSIC_Y + 134}" font-size="10" fill="${playing ? "#33bb33" : DIM}" text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.12em">${playing ? "PLAYING NOW" : "LAST PLAYED"}</text>

  <!-- ── FOOTER: black bg ── -->
  <rect x="${CX}" y="${FOOT_Y}" width="${CW}" height="${FOOT_H}" fill="${BLACK}" stroke="${BORDER}" stroke-width="${BW}"/>

  <text x="${CX + 18}" y="${FOOT_Y + 22}" font-size="15" font-weight="700" fill="${PAPER}" font-family="Arial, sans-serif" letter-spacing="0.04em">GITHUB.COM/RAVE271</text>
  <text x="${CX + 18}" y="${FOOT_Y + 40}" font-size="10" fill="${MID}" font-family="Arial, sans-serif" letter-spacing="0.1em">BUILD. BREAK. REPEAT.</text>

  <text x="${CX + CW - 18}" y="${FOOT_Y + 33}" font-size="14" font-weight="300" fill="#33bb33" text-anchor="end" font-family="'Helvetica Neue', Helvetica, 'Arial Narrow', Arial, sans-serif" letter-spacing="0.35em">SS03</text>

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