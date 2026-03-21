# CLAUDE.md

## Project Overview

BuddyUp / Stitch is a location-based social networking platform with a Gen Z "Neon Nocturne" aesthetic. Users discover friends and activities nearby, join group activities, chat, and earn points on a leaderboard.

The repo contains two parallel implementations:
- **`buddyup-stitch-app/`** — React Native + Expo mobile app (active)
- **`buddyup-stitch-backend/`** — Go REST API backend (active)
- **`buddyup-app/`** / **`buddyup-backend/`** — Older implementation (deleted in git, not used)
- **`stitch_select_interests/`** — Design system reference screens (HTML + screenshots)

---

## Architecture

### Frontend (`buddyup-stitch-app/`)
- **React Native 0.83 + Expo 55** with TypeScript
- **React Navigation** (stack-based, no tabs)
- No global state management — local component state + `fetch()` API calls
- API base: configured in `src/api/client.ts`; override via `EXPO_PUBLIC_API_BASE_URL` env var (falls back to `http://localhost:8080/api/v1` for local dev only)
- Theme system: `src/theme/theme.ts` (single exported `Theme` object)

### Backend (`buddyup-stitch-backend/`)
- **Go 1.26 + Gin** HTTP framework
- **GORM + SQLite** (file: `buddyup.db`, auto-created on first run, gitignored)
- **JWT auth** (30-day expiry): `JWT_SECRET` env var **must** be set — server will not start without it
- **Current dev user**: `CurrentUserID = 5` is hardcoded in `handlers/handlers.go` for development only — **must be replaced** with JWT-derived identity before any real auth is used

#### Route Groups
- `POST /auth/register`, `POST /auth/login`, `POST /auth/google`, `POST /auth/apple`
- `GET /auth/me` (JWT protected)
- `/api/v1/*` — all protected by JWT middleware

---

## Development Commands

### Frontend
```bash
cd buddyup-stitch-app
npm install
npm start          # Expo dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser
```

### Backend
```bash
cd buddyup-stitch-backend
export JWT_SECRET=your-secret-here   # Required — server won't start without it
go run ./cmd/api/main.go             # Starts on :8080, creates buddyup.db
go build ./cmd/api                   # Build binary
```

---

## Key Files

| File | Purpose |
|------|---------|
| `buddyup-stitch-app/src/api/client.ts` | API base URL (override via `EXPO_PUBLIC_API_BASE_URL`) |
| `buddyup-stitch-app/src/theme/theme.ts` | Design tokens (colors, spacing, typography) |
| `buddyup-stitch-app/App.tsx` | Navigation stack root |
| `buddyup-stitch-app/src/screens/` | All screen components |
| `buddyup-stitch-backend/cmd/api/main.go` | Server entry point |
| `buddyup-stitch-backend/internal/db/database.go` | Schema, migrations, seed data |
| `buddyup-stitch-backend/internal/models/models.go` | GORM models |
| `buddyup-stitch-backend/internal/handlers/` | Route handlers |
| `buddyup-stitch-backend/internal/router/router.go` | Route definitions |
| `stitch_select_interests/electric_pulse/DESIGN.md` | Full design system spec |

---

## Design System (Neon Nocturne)

Key rules for UI work:

- **No 1px borders** — use color-shift backgrounds instead
- **Glassmorphism**: `rgba(255,255,255,0.08)` + `blur(20px)` for floating surfaces
- **Gradients**: 135° from `#df8eff` → `#c96ef0`
- **4-level surface hierarchy**: `#290c36` → `#31113f` → `#391648` → `#3e1b4e`
- **Oversized whitespace** between sections

### Core Palette
| Token | Value |
|-------|-------|
| Primary | `#df8eff` |
| Secondary (neon green) | `#2ff801` |
| Background | `#1a0425` |
| Text primary | `#f9dcff` |
| Error | `#ff6e84` |

### Typography
- Display/Headlines: **Epilogue** (bold)
- Body/Labels: **Plus Jakarta Sans**

---

## Data Models

- **User**: id, name, email, bio, avatar, isOnline, points, interests (M2M)
- **Interest**: id, name (e.g., "Gym", "Coding", "Art")
- **Friendship**: id, userID, friendID, status (pending/accepted)
- **Activity**: id, hostID, title, description, category, location, startTime, attendees
- **Message**: id, senderID, receiverID, content, isRead
- **Notification**: id, userID, title, body, isRead

---

## Testing

No test infrastructure exists currently. Intended direction when adding tests:

- **Frontend**: Jest + React Native Testing Library (`npm install --save-dev jest @testing-library/react-native`)
- **Backend**: standard Go test tooling (`go test ./...`); table-driven tests per handler package

---

## Notes

- Seed data creates 5 users; dev user is `Shivansh` (id=5)
- `buddyup.db` is gitignored (via `buddyup-stitch-backend/.gitignore`) and auto-created on first `go run`
- `download_screens.py` fetches design screens from a Gemini project export
- The deleted files in git (`buddyup-app/`, `buddyup-backend/`) are the old implementation — ignore them
