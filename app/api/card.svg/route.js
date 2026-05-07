// ... (fetchJSON, getGitHubStats, buildBadges unchanged)

function buildSVG(stats) {
  const { public_repos, stars, topLangs, followers } = stats;
  const langString = topLangs.join(" | ").toUpperCase();

  return `
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="800" 
  height="980" 
  viewBox="0 0 800 980"
>
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

  <!-- PROFESSIONAL STAMP -->
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

  <!-- FOLLOWERS (replaces ACTIVE) -->
  <rect x="540" y="600" width="220" height="100" fill="#161616" stroke="#2a2a2a"/>
  <text x="650" y="658" font-size="44" fill="#f5f0e8" text-anchor="middle">
    ${followers}
  </text>
  <text x="650" y="682" font-size="11" fill="#555" text-anchor="middle">
    FOLLOWERS
  </text>

  <line x1="40" y1="725" x2="760" y2="725" stroke="#cc2200"/>

  <!-- PHILOSOPHY (updated) -->
  <text x="60" y="768" font-size="15" fill="#888">
    // minimalism
  </text>

  <text x="60" y="798" font-size="15" fill="#888">
    // performance
  </text>

  <text x="60" y="828" font-size="15" fill="#888">
    // scalability
  </text>

  <text
    x="760"
    y="798"
    font-size="12"
    fill="#444"
    text-anchor="end"
  >
    ${langString}
  </text>

  <line x1="40" y1="855" x2="760" y2="855" stroke="#cc2200"/>

  <text
    x="400"
    y="885"
    font-size="11"
    fill="#444"
    text-anchor="middle"
  >
    CLEAN CODE | SHIP EARLY | SOLUTIONS NOT EXCUSES
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

export async function GET() {
  const username = "Rave271";
  const token = process.env.GITHUB_TOKEN;

  const stats = await getGitHubStats(username, token);
  const svg = buildSVG(stats);

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}