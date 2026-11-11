// Leaderboard for Lane Closed, stored in an Upstash Redis database
// (added through Vercel's Storage tab, which sets these variables).
// If the database isn't connected, the game simply hides the leaderboard.

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const KEY = 'lane-closed:scores';
const TOP = 10;
const MAX_SCORE = 999; // far beyond what a person can ride
const BLOCKED = new Set(['ASS', 'FAG', 'FUK', 'FUC', 'FCK', 'KKK', 'NIG', 'CUM', 'TIT', 'SEX', 'JEW', 'GAY', 'DIK', 'DIC', 'COK', 'CUN', 'KYS', 'WTF']);

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

async function redis(commands: (string | number)[][]) {
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Redis responded ${res.status}`);
  const out = (await res.json()) as { result?: any; error?: string }[];
  const failed = out.find((r) => r.error);
  if (failed) throw new Error(failed.error);
  return out.map((r) => r.result);
}

const topCommand = ['ZRANGE', KEY, 0, TOP - 1, 'REV', 'WITHSCORES'];

// Redis returns [name, score, name, score, ...]
function toRows(flat: string[]) {
  const rows: { name: string; score: number }[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) rows.push({ name: flat[i], score: Number(flat[i + 1]) });
  return rows;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function GET() {
  if (!REDIS_URL || !REDIS_TOKEN) return json({ enabled: false, scores: [] });
  try {
    const [flat] = await redis([topCommand]);
    return json({ enabled: true, scores: toRows(flat) });
  } catch (error) {
    console.error('Leaderboard read failed:', error);
    return json({ enabled: false, scores: [] });
  }
}

export async function POST(req: Request) {
  if (!REDIS_URL || !REDIS_TOKEN) return json({ error: 'Leaderboard is not set up.' }, 503);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Bad request.' }, 400);
  }

  const name = String(body?.name ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
  const score = Number(body?.score);
  if (name.length !== 3) return json({ error: 'Initials need to be 3 letters or numbers.' }, 400);
  if (BLOCKED.has(name)) return json({ error: 'Pick different initials.' }, 400);
  if (!Number.isInteger(score) || score < 1 || score > MAX_SCORE) return json({ error: 'That score does not look right.' }, 400);

  try {
    // At most 8 submissions a minute from one address
    const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    const limitKey = `lane-closed:limit:${ip}`;
    const [count] = await redis([['INCR', limitKey], ['EXPIRE', limitKey, 60, 'NX']]);
    if (count > 8) return json({ error: 'Slow down. Try again in a minute.' }, 429);

    // One entry per set of initials, keeping its best score; store only the top 100
    const [, , flat] = await redis([
      ['ZADD', KEY, 'GT', score, name],
      ['ZREMRANGEBYRANK', KEY, 0, -101],
      topCommand,
    ]);
    return json({ enabled: true, scores: toRows(flat) });
  } catch (error) {
    console.error('Leaderboard write failed:', error);
    return json({ error: 'Could not save the score. Try again.' }, 500);
  }
}
