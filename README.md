# ThinkMate 🤝

AI-powered collaborative ideation platform that helps students discover shared interests, form meaningful groups, and generate impactful project ideas.

This README is a developer-focused guide for running the project locally, the main libraries used, and where key parts of the code live. It reflects the current repository state (Next.js frontend, a small Python generation server, and Prisma for a local DB).

---


## Requirements

- Node.js (recommended v18+)
- npm or pnpm
- Python 3.10+ (for the optional model API server)
- pyenv (optional but recommended)

Notes:
- The Next.js app is in `thinkmate/` and uses React 19 + Next 15.
- Prisma is configured to use SQLite by default (`thinkmate/prisma/schema.prisma`) but you can point `DATABASE_URL` to Postgres or another provider.
- Some generated Prisma assets include platform-specific query engines (e.g., macOS Darwin binary) — regenerate the client if you change platforms.

---


## Main libraries found in this repo

- Frontend: Next.js 15, React 19
- Charts & visuals: D3.js, Plotly, OGL / Three.js for 3D pieces
- Styling: CSS Modules (some files reference Tailwind)
- Animations / interactions: GSAP, `motion/react`
- Backend (optional): Python FastAPI + Uvicorn, using Hugging Face `transformers` and `torch` for local model inference (see `thinkmate/server/`)
- DB / ORM: Prisma (client located under `thinkmate/generated/prisma` and schema in `thinkmate/prisma/schema.prisma`). By default the schema uses SQLite (file `dev.db`).

Key packages (from `thinkmate/package.json`): `d3`, `three`, `react`, `next`, `@prisma/client`, `swr`, `gsap`, `ogl`, `plotly.js`, and more.

---


## Quick start (development)

Run these from the repository root (`/Users/juhong/Desktop/thinker`). The Next.js app lives in `thinkmate/`.

1) Install frontend dependencies

```bash
cd thinkmate
npm install
# or: pnpm install
```

2) Optional: prepare Python environment for the generation API

```bash
# optional (if you plan to run the local model server)
cd thinkmate
pyenv local 3.11.4   # optional
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3) Start the Next.js frontend

```bash
npm run dev
```

4) Optional: start the Python model API (FastAPI + Uvicorn)

The Python server uses `transformers` and `torch` with the gemma model (see `thinkmate/server/app.py`). To run it (from `thinkmate/`):

```bash
# activate the venv first if used
source .venv/bin/activate
MODEL_ID="google/gemma-3-1b-it" uvicorn server.app:app --host 0.0.0.0 --port 8000 &> server.log &
tail -f server.log
```

Note: Loading large models locally requires sufficient RAM/GPU. The repo's server code tries to load `google/gemma-3-1b-it` via `transformers`.

5) Prisma / Database (local SQLite by default)

```bash
# open Prisma Studio (inspect dev.db)
npx prisma studio --schema='thinkmate/prisma/schema.prisma'

# regenerate client after schema changes
npx prisma generate --schema=thinkmate/prisma/schema.prisma
```

---


## Environment variables

Create `.env.local` in the `thinkmate/` folder or set variables in your shell. Common variables used in the code:

- `DATABASE_URL` — Prisma connection string. If omitted, Prisma uses the `file:./dev.db` SQLite default in the schema.
- `DATABRICKS_SERVER_HOSTNAME`, `DATABRICKS_TOKEN`, `DATABRICKS_HTTP_PATH` — optional; used by some page data fetching via Databricks SQL client.
- `MODEL_ID` — model identifier for the Python generation server (if running locally).

Example `.env.local` (DO NOT commit credentials):

```env
DATABASE_URL="file:./dev.db"
DATABRICKS_SERVER_HOSTNAME=""
DATABRICKS_TOKEN=""
DATABRICKS_HTTP_PATH=""
MODEL_ID="google/gemma-3-1b-it"
```

---


## Notes & troubleshooting

- If you see errors referencing removed variables or a stale client, stop the dev server, delete `.next`, and restart `npm run dev`.
- Many visualization components replace the SVG contents directly. If you see render issues, make sure the `svgRef` exists and the effect cleans up on unmount.
- If you change Node/Python versions or native deps, delete `node_modules` and reinstall. Regenerate Prisma client after schema changes.

To regenerate the Prisma client:

```bash
npx prisma generate --schema=thinkmate/prisma/schema.prisma
```

## Contributing

- Run linting/tests (if available) before opening PRs.
- Keep UI changes localized to components and CSS Modules.
- Document any added visualization libraries and update `package.json`.

## License

See the top-level `LICENSE` file.

If you'd like, I can also:
- Add a small troubleshooting checklist for common runtime errors,
- Add platform-specific notes (macOS vs Linux) for Prisma query-engine binaries,
- Add `npm` scripts to run frontend + backend together via `concurrently` (and patch `package.json`).
