# Nextdoor Hyperlocal Neighborhood App

A local-first hyperlocal social network prototype for Indian neighborhoods with:

- **Backend**: Node.js + Express + TypeScript (`backend/`)
- **Frontend**: React + TypeScript + Vite (`frontend/`)
- **Shared schema**: TypeScript models in `shared/src/models.ts`
- **Persistence modes**:
  - `PERSISTENCE_MODE=json` (default): JSON files under `data/json/`
  - `PERSISTENCE_MODE=sql`: SQLite file `data/app.db`

## Features

- **Local Feed**: neighborhood posts (text/image/tags), upvotes, comments, radius filtering
- **New Nearby**: business directory with category/radius filtering
- **Community Circles**: societies, access-code join, channels, and message threads (polling)
- **Onboarding**: city/locality selection with mock OTP verification
- **Geo-fenced logic**: locality seed + Haversine distance for feed/business filtering

## Seed Localities (examples)

- Mumbai: Bandra West, Andheri East
- Delhi: Saket, Dwarka
- Bengaluru: Koramangala, Indiranagar
- Hyderabad: Hitech City, Banjara Hills
- Chennai: Adyar, Velachery

## Install

```bash
npm install
```

## Run in development

Start backend only:

```bash
npm run dev:server
```

Start frontend only:

```bash
npm run dev:client
```

Start both:

```bash
npm run dev
```

Backend runs at `http://localhost:4000` and frontend at `http://localhost:5173`.

## Persistence mode switch

JSON mode (default):

```bash
PERSISTENCE_MODE=json npm run dev:server
```

SQLite mode:

```bash
PERSISTENCE_MODE=sql npm run dev:server
```

SQLite schema is auto-created on startup with `CREATE TABLE IF NOT EXISTS` statements.

## API Highlights

- `POST /api/auth/signup`
- `POST /api/auth/request-otp`
- `POST /api/auth/verify`
- `GET /api/feed`
- `POST /api/posts`
- `POST /api/posts/:postId/upvote`
- `GET|POST /api/posts/:postId/comments`
- `GET|POST /api/businesses`
- `GET|POST /api/societies`
- `POST /api/societies/:societyId/join`
- `GET /api/channels/:societyId`, `POST /api/channels`
- `GET|POST /api/messages/:channelId`
