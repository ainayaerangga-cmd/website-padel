# Smash Point Padel Club (full stack, Vercel)

- `index.html`: landing page, booking widget, pricing, coaches (no build step)
- `api/availability.js`: `GET /api/availability?date=YYYY-MM-DD&type=indoor|outdoor`
- `api/bookings.js`: `POST /api/bookings` with `{date,type,hour,name,phone,coach?}`
- `api/_lib.js`: shared rules and storage
- No dependencies, so `npm install` has nothing to fail on.

## Deploy
1. Upload everything to the root of a NEW GitHub repo.
2. On vercel.com: Add New > Project > import the repo. Framework Preset: Other. Leave build settings empty. Deploy.
3. For bookings that persist and are shared between visitors: Project > Storage > Create Database > Upstash Redis, connect it to the project, then Redeploy. The env vars are added for you.

Without step 3 the API still works, but bookings sit in server memory and can disappear at any time.

## Local
`npx vercel dev` then open http://localhost:3000.

## Before launch
Checkout is a demo. Add Midtrans or Xendit inside `api/bookings.js`.
