# ThinkMate — Rational Page (Next.js)

Lightweight Next.js app that renders the Rational page for ThinkMate. This README explains how to run, build and deploy the site, required environment variables, and troubleshooting tips.

## Quick start (local)

Requirements
- Node.js 18+ (recommended)
- npm / yarn / pnpm (uses lockfile if present)
- macOS / Linux / WSL: bash/zsh terminal

Install and run
```bash
cd thinkmate
# install
npm ci        # or `yarn` or `pnpm install`
# dev server (Next.js)
npm run dev
# open http://localhost:3000
```

Build and preview
```bash
cd thinkmate
npm ci
npm run build
npm start      # if configured; otherwise use `npx next start`
```

Export static site (for GitHub Pages)
```bash
# write a next.config.js with basePath/assetPrefix if serving under /<repo>/
npx next build
npx next export -o out
# serve exported static files
python3 -m http.server 8080 -d out
# open http://localhost:8080/<basePath>/
```

## Environment variables

Create `.env.local` in `thinkmate/` for local dev. Typical variables used in this project:
```env
# server/API
DATABASE_URL=postgresql://user:pass@host:5432/dbname   # if using Prisma/Postgres
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
NEXT_PUBLIC_API_BASE=     # optional: external API base (for static exports)

# Databricks (if used server-side)
DATABRICKS_HOST=...
DATABRICKS_TOKEN=...
DATABRICKS_HTTP_PATH=...
```
- Do NOT expose server secrets to the client. Use `NEXT_PUBLIC_` prefix only for safe, public values.

## Libraries & tooling

Check `thinkmate/package.json` for exact dependency versions. Below are important libraries used in this project, what they do, and quick tips for working with them.

- **Next.js** — React framework used for pages, routing, server-side rendering, and static export.
	- Docs: https://nextjs.org/docs
	- Dev: `npm run dev` (inside `thinkmate/`)
	- Build: `npx next build` / `npx next export`

- **React** — UI library used by Next.js.
	- Keep heavy data or secrets on server-side (API routes or getServerSideProps).

- **SWR** — data fetching hook for React (stale-while-revalidate pattern).
	- Docs: https://swr.vercel.app/
	- Use it in client components to fetch API routes; provide a `fetcher` that falls back to static JSON for exported sites if needed.

- **framer-motion** — animation library for React.
	- Docs: https://www.framer.com/docs/

- **GSAP** — advanced animation (used in visualization components).
	- Docs: https://greensock.com/gsap/

- **@databricks/sql** — Databricks SQL client (server-side only).
	- Use this only in `getStaticProps`/`getServerSideProps` or API routes to avoid bundling server-side native code into the browser.

- **Prisma** — ORM for relational databases or MongoDB (optional in this project if used).
	- Docs: https://www.prisma.io/docs
	- Important: import Prisma only in server-side code (API routes, server components). Use a singleton instance to avoid excessive connections in serverless environments.
	- Example check: `npx prisma -v` and inspect `prisma/schema.prisma`.

- **MongoDB driver / Mongoose** — if you're using MongoDB Atlas instead of Prisma.
	- Atlas free tier is available for development.
	- Use a cached `MongoClient` singleton to avoid connection storms in serverless.

- **Prisma Data Proxy** — useful when deploying Prisma on serverless platforms to avoid connection limits.
	- Docs: https://www.prisma.io/docs/guides/deployment/deploying-to-prisma-data-proxy

Quick commands to inspect installed libraries and versions

```bash
# show dependencies and versions for the thinkmate app
cat thinkmate/package.json

# show a compact list of installed package versions
cd thinkmate && npm ls --depth=0

# check Prisma binary / client version (if present)
npx prisma -v
```

Notes:
- Prisma requires Node server-side only (do not import in client code).
- If you deploy to serverless platforms (Vercel) avoid using SQLite in production — prefer a managed Postgres, MySQL, or MongoDB Atlas.
- For serverless with relational DBs, consider Prisma Data Proxy or a singleton client pattern to prevent connection exhaustion.


## Deployment

Recommended (supports API routes): Vercel
- Import repo on Vercel and set Project Root to `thinkmate`.
- Add environment variables in Vercel dashboard.
- Vercel will build and host both pages and API routes.

Static (GitHub Pages)
- Works only for fully static pages (no Next.js API routes).
- Use `next export` and push the `out/` folder to GitHub Pages (via `gh-pages` or Actions).
- If hosting at `https://<user>.github.io/<repo>/` set `basePath` and `assetPrefix` in `next.config.js` before export.

Example `next.config.js` for GitHub Pages:
```javascript
const path = require('path');
module.exports = {
	outputFileTracingRoot: path.join(__dirname, '.'),
	basePath: '/<repo-name>',
	assetPrefix: '/<repo-name>/',
	images: { unoptimized: true },
	eslint: { ignoreDuringBuilds: true },
};
```

## Troubleshooting

- 404 from `/api/...`:
	- Make sure Next dev server is running (API routes exist only server-side).
	- If site is statically exported, API routes will 404 — host API separately or pre-generate static JSON.
	- Check `useCountryStats` to use relative paths (`/api/...`) or `NEXT_PUBLIC_API_BASE`.

- Prisma errors:
	- Ensure Prisma is used server-side only and `DATABASE_URL` is set.
	- For serverless, consider Prisma Data Proxy or use a managed DB with connection pooling.

- CI / Actions:
	- Confirm export step produces `out/index.html` and Actions uploads the correct artifact.
	- If Pages shows README, it means Pages served repo root (no exported site published). Push `out/` to `gh-pages` or use Actions Pages deployment.

## Inspect dependencies
```bash
cat thinkmate/package.json
```

## Contributing
- Keep server-only code in API routes or `getServerSideProps`/`getStaticProps`.
- Avoid importing server libs into client components.

## License
Specify your license here (e.g. MIT).


