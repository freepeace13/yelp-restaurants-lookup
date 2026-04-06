# Restaurants Lookup (Yelp)

A small full-stack JavaScript project for searching restaurants by city using the Yelp Fusion API. The repository is structured as an **npm workspaces** monorepo with a **React** single-page app and a **Node/Express** API.

---

## Architecture summary

### High-level design

The application follows a classic **browser client → backend API → external Yelp API** pattern:

1. **Web client (`client/`)** — A React app built with Vite. It renders the UI (city input, results list) and calls **same-origin** HTTP routes under `/api/*` during development.
2. **API server (`server/`)** — An Express application that holds secrets (for example the Yelp API key in environment variables), implements REST endpoints, and forwards or shapes requests to Yelp. This keeps the Fusion API key off the client.
3. **Yelp Fusion API** — External HTTPS service used for live restaurant data (no mock data in production flows).

### Monorepo layout

| Workspace | Technology | Responsibility |
|-----------|------------|----------------|
| **Root** | npm workspaces + `concurrently` | Installs shared tooling; runs client and server together with `npm run dev`. |
| **`client/`** | Vite 6, React 19, TypeScript, Tailwind CSS v4, ESLint | Static assets and UI; dev server with hot reload. |
| **`server/`** | Express (ES modules), `cors`, `dotenv`, ESLint | JSON API, Yelp proxying, environment-based configuration. |

### Development networking

- **Client dev server:** `http://localhost:5173` (Vite default in this project).
- **API server:** `http://localhost:3001` by default (`PORT` in `server/.env`).

Vite is configured to **proxy** requests from the browser that start with `/api` to the backend (`vite.config.ts`). That way the React app can use relative URLs such as `/api/health` without browser CORS issues, while the Express app continues to listen on its own port.

```text
Browser  →  GET /api/...  →  Vite (5173)  →  proxy  →  Express (3001)
```

For production, you would typically serve the built client (`client/dist`) behind a static host or the same reverse proxy as the API, and configure the client’s API base URL or proxy rules accordingly.

### Request flow (target end state)

Once Yelp routes are implemented on the server:

```text
User enters city  →  React posts/GETs /api/...  →  Express validates input
  →  Express calls Yelp Fusion with server-side API key  →  JSON response
  →  React renders name, rating, address, coordinates
```

The current server exposes a minimal **`GET /api/health`** endpoint for smoke checks; Yelp-specific routes and query parameters (location, radius, categories) belong in `server/src/` as you extend the app.

---

## System and software requirements

### Required

- **Node.js** — **20.x or newer** (LTS recommended). The toolchain uses modern ESM, Vite 6, and current ESLint; older Node versions may fail to install or run.
- **npm** — **10.x or newer** (bundled with recent Node installers). This project uses **npm workspaces** at the repository root.

### Optional but useful

- **Git** — For version control and cloning.
- A **Yelp Fusion API key** — Required for real restaurant data once you implement Yelp calls on the server. Create or manage keys in the [Yelp developers](https://www.yelp.com/developers) console.

### Platforms

- **Linux**, **macOS**, and **Windows** (with a normal Node/npm install) are supported for local development.

---

## Local setup

### 1. Clone and enter the project

```bash
git clone <repository-url>
cd restaurants-lookup-yelp-api
```

### 2. Install dependencies

Install once from the **repository root** so workspaces link correctly:

```bash
npm install
```

This installs root dev tools (for example `concurrently`) and dependencies for `client/` and `server/`.

### 3. Configure environment (server)

Copy the example env file and edit it:

```bash
cp server/.env.example server/.env
```

Set at least:

- **`PORT`** — API port (default `3001` if omitted).
- **`YELP_API_KEY`** — Your Yelp Fusion API key when you add Yelp integration.

The server loads variables via `dotenv` from `server/.env` (see `server/src/index.js`).

### 4. Run the app locally

**Run client and API together** (recommended for development):

```bash
npm run dev
```

- Client: **http://localhost:5173**
- API: **http://localhost:3001**  
- Health check: **http://localhost:3001/api/health** (or via the Vite proxy: **http://localhost:5173/api/health**)

**Run workspaces separately** (two terminals):

```bash
npm run dev:client
```

```bash
npm run dev:server
```

### 5. Quality checks

```bash
npm run lint
```

Build the production client bundle:

```bash
npm run build
```

Output is written to `client/dist/`. Serving that folder and running the API in production is deployment-specific (not scripted here by default).

---

## NPM scripts (reference)

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts Vite (client) and Express (server) concurrently. |
| `npm run dev:client` | Client only — Vite dev server. |
| `npm run dev:server` | Server only — Express with `node --watch`. |
| `npm run build` | Production build of the React app (`client/dist`). |
| `npm run lint` | ESLint for `client/` and `server/`. |

---

## Project structure (overview)

```text
restaurants-lookup-yelp-api/
├── package.json          # Workspaces + dev scripts
├── client/               # React + Vite + Tailwind + ESLint
│   ├── src/
│   ├── vite.config.ts    # Dev server + /api proxy
│   └── eslint.config.js
├── server/               # Express API + ESLint
│   ├── src/index.js
│   ├── .env.example
│   └── eslint.config.js
└── README.md
```

---

## Troubleshooting

- **`npm install` errors** — Use Node 20+ and a recent npm; delete `node_modules` and lockfile only if you understand the implications, then reinstall.
- **Port already in use** — Change Vite’s port in `client/vite.config.ts` or set `PORT` in `server/.env`.
- **API not reachable from the browser** — Ensure the server is running on the port Vite proxies to (`3001` by default) and that requests use the `/api` prefix so the Vite proxy applies.
