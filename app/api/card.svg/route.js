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
      .get(
        url,
        {
          headers,
        },
        (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch (err) {
              reject(err);
            }
          });
        }
      )
      .on("error", reject);
  });
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

    const stars = repos.reduce(
      (acc, repo) => acc + repo.stargazers_count,
      0
    );

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
  const apiKey = "18ee6ffe16e046b94dccef21b8cd7896"; // replace this
  const username = "Rave271"; // replace this

  try {
    const data = await fetchJSON(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`
    );

    const track = data?.recenttracks?.track?.[0];

    if (!track) {
      return {
        song: "NO SIGNAL",
        artist: "OFFLINE",
        playing: false,
      };
    }

    const isNowPlaying =
      track["@attr"]?.nowplaying === "true";

    return {
      song: track.name || "UNKNOWN TRACK",
      artist:
        track.artist["#text"] || "UNKNOWN ARTIST",
      playing: isNowPlaying,
    };
  } catch (error) {
    console.error("Last.fm error:", error);

    return {
      song: "SIGNAL LOST",
      artist: "RETRYING...",
      playing: false,
    };
  }
}

/* ---------------- SKILL BADGES ---------------- */
function buildBadges() {
  const items = [
    "PYTHON",
    "JAVA",
    "MERN",
    "KERAS",
    "SCIKIT-LEARN",
    "PANDAS",
    "NUMPY",
    "LINUX",
  ];

  const output = [];
  let x = 48;
  let y = 530;

  items.forEach((label) => {
    const width = label.length * 8 + 20;
    const isKeras = label === "KERAS";

    output.push(`
      <rect 
        x="${x}" 
        y="${y}" 
        width="${width}" 
        height="24"
        fill="none"
        stroke="${isKeras ? "#cc2200" : "#2a2a2a"}"
        stroke-width="1"
      />
    `);

    output.push(`
      <text
        x="${x + width / 2}"
        y="${y + 15}"
        font-size="10"
        fill="${isKeras ? "#cc2200" : "#aaa"}"
        text-anchor="middle"
        font-family="Arial"
      >
        ${label}
      </text>
    `);

    x += width + 8;

    if (x > 700) {
      x = 48;
      y += 32;
    }
  });

  return output.join("");
}

/* ---------------- SVG ---------------- */
function buildSVG(stats, music) {
  const { public_repos, stars, followers } = stats;
  const { song, artist, playing } = music;

  return `
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="800" 
  height="980" 
  viewBox="0 0 800 980"
>
  <defs>
    <pattern id="dotGrid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="#2a2a2a"/>
    </pattern>
  </defs>

  <rect width="100%" height="100%" fill="#0f0f0f"/>

  <!-- HEADER -->
  <rect 
    x="40" 
    y="30" 
    width="720" 
    height="260" 
    fill="#f5f0e8"
    stroke="#1a1a1a"
    stroke-width="5"
  />

  <rect
    x="46"
    y="36"
    width="708"
    height="248"
    fill="none"
    stroke="#1a1a1a"
    stroke-width="2"
  />

  <text
    x="400"
    y="155"
    font-size="110"
    font-weight="900"
    fill="#1a1a1a"
    text-anchor="middle"
    font-family="Impact, Arial"
  >
    RAVE 271
  </text>

  <text
    x="400"
    y="200"
    font-size="14"
    fill="#555"
    text-anchor="middle"
    font-family="Arial"
  >
    RAGHAV VERMA • ML • SYSTEMS • FULL STACK
  </text>

  <rect
    x="316"
    y="218"
    width="168"
    height="26"
    fill="none"
    stroke="#cc2200"
    stroke-width="2"
  />

  <text
    x="400"
    y="236"
    font-size="11"
    fill="#cc2200"
    text-anchor="middle"
    font-family="Arial"
  >
    OPEN SOURCE
  </text>

  <line x1="40" y1="315" x2="760" y2="315" stroke="#2a2a2a"/>

  <text
    x="400"
    y="350"
    font-size="12"
    fill="#555"
    text-anchor="middle"
  >
    CORE FOCUS
  </text>

  <text
    x="400"
    y="400"
    font-size="42"
    fill="#f5f0e8"
    text-anchor="middle"
    font-family="Impact"
  >
    MACHINE LEARNING
  </text>

  <text
    x="400"
    y="475"
    font-size="42"
    fill="#f5f0e8"
    text-anchor="middle"
    font-family="Impact"
  >
    SYSTEMS &amp; FULL STACK
  </text>

  <line x1="40" y1="505" x2="760" y2="505" stroke="#2a2a2a"/>

  ${buildBadges()}

  <line x1="40" y1="585" x2="760" y2="585" stroke="#2a2a2a"/>

  <!-- REPOS -->
  <rect x="40" y="600" width="220" height="100" fill="#161616" stroke="#2a2a2a"/>
  <text x="150" y="658" font-size="44" fill="#f5f0e8" text-anchor="middle">
    ${public_repos}
  </text>
  <text x="150" y="682" font-size="11" fill="#555" text-anchor="middle">
    REPOS
  </text>

  <!-- STARS -->
  <rect x="290" y="600" width="220" height="100" fill="#161616" stroke="#2a2a2a"/>
  <text x="400" y="658" font-size="44" fill="#f5f0e8" text-anchor="middle">
    ${stars}
  </text>
  <text x="400" y="682" font-size="11" fill="#555" text-anchor="middle">
    STARS
  </text>

  <!-- FOLLOWERS -->
  <rect x="540" y="600" width="220" height="100" fill="#161616" stroke="#2a2a2a"/>
  <text x="650" y="658" font-size="44" fill="#f5f0e8" text-anchor="middle">
    ${followers}
  </text>
  <text x="650" y="682" font-size="11" fill="#555" text-anchor="middle">
    FOLLOWERS
  </text>

  <line x1="40" y1="725" x2="760" y2="725" stroke="#cc2200"/>

  <!-- MUSIC PANEL -->
  <rect x="40" y="735" width="720" height="165" fill="url(#dotGrid)" opacity="0.5"/>

  <text
    x="400"
    y="780"
    font-size="12"
    fill="#cc2200"
    text-anchor="middle"
    font-family="Arial"
  >
    LIVE TRANSMISSION
  </text>

  <text
    x="400"
    y="825"
    font-size="28"
    fill="#f5f0e8"
    text-anchor="middle"
    font-family="Impact"
  >
    ${song.toUpperCase().slice(0, 30)}
  </text>

  <text
    x="400"
    y="855"
    font-size="14"
    fill="#888"
    text-anchor="middle"
    font-family="Arial"
  >
    ${artist.toUpperCase().slice(0, 35)}
  </text>

  <text
    x="400"
    y="885"
    font-size="10"
    fill="${playing ? "#00ff88" : "#555"}"
    text-anchor="middle"
    font-family="Arial"
  >
    ${playing ? "SIGNAL ACTIVE" : "LAST TRANSMISSION"}
  </text>

  <line x1="40" y1="910" x2="760" y2="910" stroke="#2a2a2a"/>

  <text x="40" y="938" font-size="16" fill="#f5f0e8">
    GITHUB.COM/RAVE271
  </text>

  <text x="40" y="956" font-size="11" fill="#555">
    ALL REPOS. ALL NIGHTS.
  </text>

  <text x="760" y="938" font-size="10" fill="#555" text-anchor="end">
    COLLABORATE
  </text>

  <text x="760" y="956" font-size="15" fill="#f5f0e8" text-anchor="end">
    OPEN
  </text>
</svg>
`;
}

/* ---------------- API ROUTE ---------------- */
export async function GET() {
  const username = "Rave271";
  const token = process.env.GITHUB_TOKEN;

  const [stats, music] = await Promise.all([
    getGitHubStats(username, token),
    getNowPlaying(),
  ]);

  const svg = buildSVG(stats, music);

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control":
        "s-maxage=3600, stale-while-revalidate",
    },
  });
}