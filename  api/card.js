export default function handler(req, res) {
  res.setHeader("Content-Type", "image/svg+xml");

  res.status(200).send(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
      <rect width="100%" height="100%" fill="#0f0f0f"/>
      <text x="50%" y="50%" 
            text-anchor="middle" 
            fill="#f5f0e8" 
            font-size="40">
        RAVE271 WORKS
      </text>
    </svg>
  `);
}