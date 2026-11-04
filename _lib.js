// Shared helpers for the serverless API. Files starting with "_" are not exposed as routes.
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // start times 06:00 to 21:00
const COURTS = { indoor: ['I1', 'I2', 'I3'], outdoor: ['O1', 'O2'] };
const PRICES = { indoor: 280000, outdoor: 220000 };
const COACHES = { dian: 250000, marco: 350000, sari: 200000 };

// Deterministic "already booked" demo courts. Must match the seed() in index.html.
const seed = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 100; };
const seededTaken = (date, court, hour) => seed(`${date}${court}${hour}`) < 35;

const validDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || '') && !isNaN(new Date(d + 'T12:00:00Z'));
const keyOf = (date, court, hour) => `padel:${date}:${court}:${hour}`;

// Storage: Upstash Redis (REST) when env vars exist, otherwise in-memory (demo only, resets often on Vercel).
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const mem = global.__padelMem || (global.__padelMem = new Map());

async function redis(cmds) {
  const r = await fetch(URL_ + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN }, body: JSON.stringify(cmds) });
  if (!r.ok) throw new Error('Redis error ' + r.status);
  return (await r.json()).map((x) => x.result);
}
async function areTaken(keys) {
  if (!URL_) return keys.map((k) => mem.has(k));
  const [vals] = await redis([['MGET', ...keys]]);
  return vals.map((v) => v !== null);
}
// Atomic claim: returns true only for the first caller (SET NX).
async function claim(key, value) {
  if (!URL_) { if (mem.has(key)) return false; mem.set(key, value); return true; }
  const [res] = await redis([['SET', key, value, 'NX', 'EX', 60 * 60 * 24 * 60]]);
  return res === 'OK';
}

module.exports = { HOURS, COURTS, PRICES, COACHES, seededTaken, validDate, keyOf, areTaken, claim, persistent: !!URL_ };
