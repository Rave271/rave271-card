import https from "https";

export const dynamic = "force-dynamic";

/* ---------------- FETCH JSON ---------------- */
function fetchJSON(url, token) {
  return new Promise((resolve, reject) => {
    const headers = {
      "User-Agent": "rave271-card",
      Accept: "application/json",
    };

    if (token && url.includes("api.github.com")) {
      headers.Authorization = `token ${token}`;
    }

    https
      .get(url, { headers }, (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          try { resolve(JSON.parse(data)); }
          catch (err) { reject(err); }
        });
      })
      .on("error", reject);
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
      fetchJSON(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
        token
      ),
    ]);

    const stars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);

    const langs = {};
    repos.forEach((repo) => {
      if (repo.language) {
        langs[repo.language] = (langs[repo.language] || 0) + 1;
      }
    });

    const topLangs = Object.entries(langs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang);

    return {
      name: user.name || username,
      followers: user.followers || 0,
      public_repos: user.public_repos || 0,
      stars,
      topLangs,
    };
  } catch (error) {
    console.error("GitHub fetch error:", error);
    return {
      name: "Raghav Verma",
      followers: 0,
      public_repos: 0,
      stars: 0,
      topLangs: ["Python", "Java", "JavaScript"],
    };
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

    if (!track) {
      return { song: "NO SIGNAL", artist: "OFFLINE", playing: false };
    }

    const isNowPlaying = track["@attr"]?.nowplaying === "true";

    return {
      song: track.name || "UNKNOWN TRACK",
      artist: track.artist["#text"] || "UNKNOWN ARTIST",
      playing: isNowPlaying,
    };
  } catch (error) {
    console.error("Last.fm error:", error);
    return { song: "SIGNAL LOST", artist: "RETRYING...", playing: false };
  }
}

/* ---------------- SKILL BADGES ---------------- */
function buildBadges() {
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
  let y = 548;
  const CHAR_W = 7.5;
  const PAD = 22;
  const H = 26;
  const GAP = 8;

  items.forEach(({ label, active }) => {
    const width = label.length * CHAR_W + PAD;

    if (x + width > 750) {
      x = 50;
      y += H + GAP;
    }

    const fill   = active ? "#e34a1e" : "none";
    const stroke = active ? "#e34a1e" : "#2a2a2a";
    const tFill  = active ? "#f5f0e8" : "#666";

    output.push(`
      <rect x="${x}" y="${y}" width="${width}" height="${H}"
        fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <text x="${x + width / 2}" y="${y + 17}"
        font-size="10" font-weight="700" fill="${tFill}"
        text-anchor="middle" font-family="Arial, sans-serif"
        letter-spacing="0.08em">${label}</text>
    `);

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

  /* colours */
  const CREAM  = "#f5f0e8";
  const BLACK  = "#1a1a1a";
  const RED    = "#e34a1e";
  const MID    = "#888";
  const DARK   = "#111111";
  const BORDER = "#2a2a2a";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="960" viewBox="0 0 800 960">

  <!-- page bg -->
  <rect width="800" height="960" fill="${BLACK}"/>

  <!-- ═══════════════════════════════════
       HERO — cream block, double border
  ═══════════════════════════════════ -->
  <rect x="40" y="30" width="720" height="240" fill="${CREAM}" stroke="${BLACK}" stroke-width="5"/>
  <!-- inner inset border -->
  <rect x="47" y="37" width="706" height="226" fill="none" stroke="${BLACK}" stroke-width="1.5"/>

  <!-- name -->
  <text x="400" y="145"
    font-size="108" font-weight="900" fill="${BLACK}"
    text-anchor="middle" font-family="Impact, Arial Black, Arial">RAVE 271</text>

  <!-- subtitle -->
  <text x="400" y="190"
    font-size="12" fill="#777" text-anchor="middle"
    font-family="Arial, sans-serif" letter-spacing="0.18em">RAGHAV VERMA • ML • SYSTEMS • FULL STACK</text>

  <!-- open source badge -->
  <rect x="322" y="207" width="156" height="24" fill="none" stroke="${RED}" stroke-width="2"/>
  <text x="400" y="224"
    font-size="10" font-weight="700" fill="${RED}"
    text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.12em">OPEN SOURCE</text>

  <!-- ═══════════════════════════════════
       DIVIDER
  ═══════════════════════════════════ -->
  <line x1="40" y1="295" x2="760" y2="295" stroke="${BORDER}" stroke-width="1"/>

  <!-- ═══════════════════════════════════
       CORE FOCUS
  ═══════════════════════════════════ -->
  <text x="400" y="330"
    font-size="11" fill="${MID}" text-anchor="middle"
    font-family="Arial, sans-serif" letter-spacing="0.16em">CORE FOCUS</text>

  <text x="400" y="385"
    font-size="48" font-weight="900" fill="${CREAM}"
    text-anchor="middle" font-family="Impact, Arial Black, Arial">MACHINE LEARNING</text>

  <text x="400" y="445"
    font-size="48" font-weight="900" fill="${CREAM}"
    text-anchor="middle" font-family="Impact, Arial Black, Arial">SYSTEMS &amp; FULL STACK</text>

  <!-- ═══════════════════════════════════
       DIVIDER
  ═══════════════════════════════════ -->
  <line x1="40" y1="478" x2="760" y2="478" stroke="${BORDER}" stroke-width="1"/>

  <!-- ═══════════════════════════════════
       SKILL BADGES
  ═══════════════════════════════════ -->
  ${buildBadges()}

  <!-- ═══════════════════════════════════
       DIVIDER
  ═══════════════════════════════════ -->
  <line x1="40" y1="592" x2="760" y2="592" stroke="${BORDER}" stroke-width="1"/>

  <!-- ═══════════════════════════════════
       STATS — three dark boxes
  ═══════════════════════════════════ -->
  <!-- repos -->
  <rect x="40" y="607" width="222" height="100" fill="#161616" stroke="${BORDER}" stroke-width="2"/>
  <text x="151" y="665" font-size="46" font-weight="900" fill="${CREAM}"
    text-anchor="middle" font-family="Impact, Arial">${public_repos}</text>
  <text x="151" y="687" font-size="10" fill="${MID}"
    text-anchor="middle" font-family="Arial" letter-spacing="0.14em">REPOS</text>

  <!-- stars -->
  <rect x="289" y="607" width="222" height="100" fill="#161616" stroke="${BORDER}" stroke-width="2"/>
  <text x="400" y="665" font-size="46" font-weight="900" fill="${CREAM}"
    text-anchor="middle" font-family="Impact, Arial">${stars}</text>
  <text x="400" y="687" font-size="10" fill="${MID}"
    text-anchor="middle" font-family="Arial" letter-spacing="0.14em">STARS</text>

  <!-- followers -->
  <rect x="538" y="607" width="222" height="100" fill="#161616" stroke="${BORDER}" stroke-width="2"/>
  <text x="649" y="665" font-size="46" font-weight="900" fill="${CREAM}"
    text-anchor="middle" font-family="Impact, Arial">${followers}</text>
  <text x="649" y="687" font-size="10" fill="${MID}"
    text-anchor="middle" font-family="Arial" letter-spacing="0.14em">FOLLOWERS</text>

  <!-- ═══════════════════════════════════
       RED DIVIDER LINE
  ═══════════════════════════════════ -->
  <line x1="40" y1="730" x2="760" y2="730" stroke="${RED}" stroke-width="2"/>

  <!-- ═══════════════════════════════════
       MUSIC — dark block with cream paper texture (dots)
  ═══════════════════════════════════ -->
  <rect x="40" y="740" width="720" height="160" fill="${DARK}" stroke="${BORDER}" stroke-width="2"/>

  <!-- subtle dot texture -->
  <rect x="40" y="740" width="720" height="160" fill="url(#dots)" opacity="0.4"/>

  <!-- red left accent bar -->
  <rect x="40" y="740" width="6" height="160" fill="${RED}"/>

  <text x="400" y="782"
    font-size="10" font-weight="700" fill="${RED}"
    text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.16em">SOUNDTRACK TO SHIPPING</text>

  <text x="400" y="832"
    font-size="32" font-weight="900" fill="${CREAM}"
    text-anchor="middle" font-family="Impact, Arial Black">${safeSong}</text>

  <text x="400" y="862"
    font-size="13" fill="#999"
    text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.1em">${safeArtist}</text>

  <text x="400" y="886"
    font-size="10" fill="${playing ? "#44cc44" : "#555"}"
    text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="0.12em">${playing ? "▶  PLAYING NOW" : "LAST PLAYED"}</text>

  <!-- ═══════════════════════════════════
       FOOTER DIVIDER
  ═══════════════════════════════════ -->
  <line x1="40" y1="920" x2="760" y2="920" stroke="${BORDER}" stroke-width="1"/>

  <!-- ═══════════════════════════════════
       FOOTER
  ═══════════════════════════════════ -->
  <text x="40" y="944"
    font-size="15" font-weight="700" fill="${CREAM}"
    font-family="Arial, sans-serif" letter-spacing="0.04em">GITHUB.COM/RAVE271</text>

  <text x="40" y="958"
    font-size="10" fill="#555"
    font-family="Arial, sans-serif" letter-spacing="0.1em">BUILD. BREAK. REPEAT.</text>

  <text x="760" y="940"
    font-size="9" fill="#555"
    text-anchor="end" font-family="Arial, sans-serif" letter-spacing="0.12em">STATUS</text>

  <text x="760" y="957"
    font-size="14" font-weight="900" fill="#44cc44"
    text-anchor="end" font-family="Arial, sans-serif" letter-spacing="0.08em">ONLINE</text>

  <!-- dot pattern def -->
  <defs>
    <pattern id="dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#333"/>
    </pattern>
  </defs>

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