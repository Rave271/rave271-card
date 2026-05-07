const https = require("https");

function fetchJSON(url, token) {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        "User-Agent": "rave271-card",
        Accept: "application/vnd.github.v3+json",
        ...(token ? { Authorization: `token ${token}` } : {}),
      },
    };
    https.get(url, opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

async function getGitHubStats(username, token) {
  try {
    const [user, repos] = await Promise.all([
      fetchJSON(`https://api.github.com/users/${username}`, token),
      fetchJSON(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, token),
    ]);

    const stars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
    const langs = {};
    repos.forEach((r) => { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
    const topLangs = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([l]) => l);

    return {
      name: user.name || username,
      followers: user.followers || 0,
      public_repos: user.public_repos || 0,
      stars,
      topLangs,
    };
  } catch {
    return { name: "Raghav Verma", followers: 0, public_repos: 0, stars: 0, topLangs: ["Python", "Java", "JavaScript"] };
  }
}

function buildSVG(stats) {
  const { public_repos, stars, followers, topLangs } = stats;
  const langStr = topLangs.join("  ·  ");
  const W = 800, H = 980;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&amp;family=Special+Elite&amp;family=Oswald:wght@400;700&amp;display=swap');
    </style>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="#0f0f0f"/>

  <!-- Banner: cream box -->
  <rect x="40" y="30" width="720" height="260" fill="#f5f0e8" stroke="#1a1a1a" stroke-width="5"/>
  <rect x="46" y="36" width="708" height="248" fill="none" stroke="#1a1a1a" stroke-width="2"/>

  <!-- RAVE 271 -->
  <text x="400" y="155" font-family="'Archivo Black', Impact, sans-serif" font-size="110" font-weight="900" fill="#1a1a1a" text-anchor="middle" letter-spacing="-3">RAVE 271</text>

  <!-- Subtitle -->
  <text x="400" y="200" font-family="'Oswald', Arial, sans-serif" font-size="14" fill="#555555" text-anchor="middle" letter-spacing="6">RAGHAV VERMA  ·  ML  ·  SYSTEMS  ·  FULL STACK</text>

  <!-- LIVE &amp; UNCUT stamp -->
  <rect x="316" y="218" width="168" height="26" fill="none" stroke="#cc2200" stroke-width="2"/>
  <text x="400" y="236" font-family="'Archivo Black', Impact, sans-serif" font-size="11" fill="#cc2200" text-anchor="middle" letter-spacing="3">LIVE &amp; UNCUT</text>

  <!-- Divider -->
  <line x1="40" y1="315" x2="760" y2="315" stroke="#2a2a2a" stroke-width="1"/>

  <!-- — ALSO FEATURING — -->
  <text x="400" y="350" font-family="'Special Elite', monospace" font-size="12" fill="#555" text-anchor="middle" letter-spacing="4">—  ALSO FEATURING  —</text>

  <!-- MACHINE LEARNING -->
  <text x="400" y="400" font-family="'Archivo Black', Impact, sans-serif" font-size="42" fill="#f5f0e8" text-anchor="middle" letter-spacing="1">MACHINE LEARNING</text>

  <!-- dots -->
  <text x="400" y="425" font-family="monospace" font-size="11" fill="#333" text-anchor="middle" letter-spacing="5">·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·</text>

  <!-- SYSTEMS &amp; FULL STACK -->
  <text x="400" y="475" font-family="'Archivo Black', Impact, sans-serif" font-size="42" fill="#f5f0e8" text-anchor="middle" letter-spacing="1">SYSTEMS &amp; FULL STACK</text>

  <!-- Divider -->
  <line x1="40" y1="505" x2="760" y2="505" stroke="#2a2a2a" stroke-width="1"/>

  <!-- Stack badges row -->
  ${buildBadges()}

  <!-- Divider -->
  <line x1="40" y1="585" x2="760" y2="585" stroke="#2a2a2a" stroke-width="1"/>

  <!-- Stat boxes -->
  <rect x="40" y="600" width="220" height="100" fill="#161616" stroke="#2a2a2a" stroke-width="1"/>
  <text x="150" y="658" font-family="'Archivo Black', Impact, sans-serif" font-size="44" fill="#f5f0e8" text-anchor="middle">${public_repos}</text>
  <text x="150" y="682" font-family="'Oswald', Arial, sans-serif" font-size="11" fill="#555" text-anchor="middle" letter-spacing="3">REPOS</text>

  <rect x="290" y="600" width="220" height="100" fill="#161616" stroke="#2a2a2a" stroke-width="1"/>
  <text x="400" y="658" font-family="'Archivo Black', Impact, sans-serif" font-size="44" fill="#f5f0e8" text-anchor="middle">${stars}</text>
  <text x="400" y="682" font-family="'Oswald', Arial, sans-serif" font-size="11" fill="#555" text-anchor="middle" letter-spacing="3">STARS</text>

  <rect x="540" y="600" width="220" height="100" fill="#161616" stroke="#2a2a2a" stroke-width="1"/>
  <text x="650" y="655" font-family="'Archivo Black', Impact, sans-serif" font-size="38" fill="#cc2200" text-anchor="middle">↑</text>
  <text x="650" y="682" font-family="'Oswald', Arial, sans-serif" font-size="11" fill="#555" text-anchor="middle" letter-spacing="3">ACTIVE</text>

  <!-- Red divider -->
  <line x1="40" y1="725" x2="760" y2="725" stroke="#cc2200" stroke-width="1"/>

  <!-- Directive -->
  <rect x="40" y="740" width="4" height="90" fill="#cc2200"/>
  <text x="60" y="768" font-family="'Special Elite', monospace" font-size="15" fill="#888" letter-spacing="1"><tspan fill="#cc2200">// </tspan>quiet systems</text>
  <text x="60" y="798" font-family="'Special Elite', monospace" font-size="15" fill="#888" letter-spacing="1"><tspan fill="#cc2200">// </tspan>sharp logic</text>
  <text x="60" y="828" font-family="'Special Elite', monospace" font-size="15" fill="#888" letter-spacing="1"><tspan fill="#cc2200">// </tspan>beautiful code</text>

  <!-- Top langs pill -->
  <text x="760" y="798" font-family="'Oswald', Arial, sans-serif" font-size="12" fill="#444" text-anchor="end" letter-spacing="2">${langStr.toUpperCase()}</text>

  <!-- Red divider -->
  <line x1="40" y1="855" x2="760" y2="855" stroke="#cc2200" stroke-width="1"/>

  <!-- Stars line -->
  <text x="400" y="885" font-family="'Oswald', Arial, sans-serif" font-size="11" fill="#444" text-anchor="middle" letter-spacing="4">★   NO HYPE   ·   JUST SHIPS   ·   ALL SHOWS   ★</text>

  <!-- Footer -->
  <line x1="40" y1="910" x2="760" y2="910" stroke="#2a2a2a" stroke-width="1"/>
  <text x="40" y="938" font-family="'Archivo Black', Impact, sans-serif" font-size="16" fill="#f5f0e8" letter-spacing="1">GITHUB.COM/RAVE271</text>
  <text x="40" y="956" font-family="'Oswald', Arial, sans-serif" font-size="11" fill="#555" letter-spacing="2">ALL REPOS.  ALL NIGHTS.</text>
  <text x="760" y="938" font-family="'Oswald', Arial, sans-serif" font-size="10" fill="#555" text-anchor="end" letter-spacing="3">DOORS OPEN</text>
  <text x="760" y="956" font-family="'Archivo Black', Impact, sans-serif" font-size="15" fill="#f5f0e8" text-anchor="end" letter-spacing="2">ALWAYS</text>
</svg>`;
}

function buildBadges() {
  const items = ["PYTHON", "JAVA", "MERN", "KERAS", "SCIKIT-LEARN", "PANDAS", "NUMPY", "LINUX"];
  const out = [];
  let x = 48, y = 530;
  items.forEach((label, i) => {
    const w = label.length * 8 + 20;
    const isKeras = label === "KERAS";
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="24" fill="none" stroke="${isKeras ? '#cc2200' : '#2a2a2a'}" stroke-width="1"/>`);
    out.push(`<text x="${x + w / 2}" y="${y + 15}" font-family="'Oswald', Arial, sans-serif" font-size="10" fill="${isKeras ? '#cc2200' : '#aaa'}" text-anchor="middle" letter-spacing="2">${label}</text>`);
    x += w + 8;
    if (x > 700) { x = 48; y += 32; }
  });
  return out.join("\n  ");
}

module.exports = async (req, res) => {
  const username = "Rave271";
  const token = process.env.GITHUB_TOKEN;
  const stats = await getGitHubStats(username, token);
  const svg = buildSVG(stats);

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.send(svg);
};
