export async function GET() {
  return new Response("API WORKS", {
    status: 200,
    headers: {
      "Content-Type": "text/plain"
    }
  });
}