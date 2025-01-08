import { run } from "~/jobs/dailyCron";

export async function POST(req: Request) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  await run();

  return new Response("OK", { status: 200 });
}
