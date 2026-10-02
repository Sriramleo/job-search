# Germany Job Hunt — Recruitment OS Frontend (Phase 11)

Production single-page web application for the Germany Job Hunt Recruitment OS, built with React 19, TypeScript, Vite, TailwindCSS (Phase 1 calm, technical minimal aesthetic), and TanStack Query v5. Deployed on Cloudflare Pages (`https://jobsearch.sriramdevops.site`).

---

## 🏗️ Architecture & Integration

```
                              User Browser
                                   │
                                   ▼
                 ┌───────────────────────────────────┐
                 │ Cloudflare Pages Edge (Global CDN)│
                 │    jobsearch.sriramdevops.site    │
                 │  - React 19 SPA (Vite / TS)       │
                 │  - _redirects SPA Fallback (200)  │
                 │  - Client-side Routing            │
                 └─────────────────┬─────────────────┘
                                   │ HTTPS
                                   ▼
                 ┌───────────────────────────────────┐
                 │    FastAPI Backend Application    │
                 │       (api.jobsearch...)          │
                 │  - Port 8000 / Cloud Run          │
                 │  - X-Request-ID Correlation       │
                 │  - RFC 7807 Error Envelope        │
                 └───────────────────────────────────┘
```

### Key Technologies
- **UI Framework**: React 19 + TypeScript
- **Styling**: TailwindCSS with PostCSS (Calm technical minimal theme from Phase 1)
- **State & Server Cache**: TanStack Query v5 (`@tanstack/react-query`) with 60s stale time
- **Icons**: Lucide React
- **Validation**: Zod
- **Testing**: Vitest + React Testing Library (27/27 tests passing)
- **Build Tool**: Vite 6

---

## 🛡️ Human-in-the-Loop Safety Boundaries

The recruitment OS strictly enforces human oversight across all operations:
1. **No Autonomous Application Submission**: Automated form filling stops at `awaiting_human_submission`. The human candidate reviews all fields in the employer portal, clicks submit, and confirms via "Confirm External Submission".
2. **Read-Only Gmail Integration**: Read-only synchronization only. Prepared outreach drafts must be manually sent by the candidate in their own Gmail client.
3. **No LinkedIn Automation**: No autonomous scraping or messaging. Grounded outreach drafts are provided for manual pasting.
4. **Immutable Candidate Evidence**: Candidate engineering evidence is factual and immutable by LLMs.
5. **No Immigration Verdicts**: Blue Card thresholds and visa rules are presented descriptively without legal guarantees.

---

## 📁 Project Structure

```
job-search/
├── public/
│   └── _redirects              # Cloudflare Pages SPA fallback rule
├── src/
│   ├── api/                    # Modular API client layer
│   │   ├── client.ts           # Central HTTP client (X-Request-ID, error handling)
│   │   ├── errors.ts           # Standardized ApiError wrapper
│   │   ├── types.ts            # Domain contracts & Zod schemas
│   │   ├── jobs.ts             # Job board & preview APIs
│   │   ├── applications.ts     # Pipeline & workspace APIs (safety enforced)
│   │   ├── companies.ts        # Company directory APIs
│   │   ├── contacts.ts         # Contacts & outreach APIs
│   │   ├── documents.ts        # CV & evidence document APIs
│   │   ├── interviews.ts       # Interview preparation APIs
│   │   ├── tasks.ts            # Action queue APIs
│   │   ├── research.ts         # Research evidence & dossiers
│   │   ├── inbox.ts            # Gmail read-only & communications
│   │   ├── analytics.ts        # Funnels, AI spend, and health
│   │   ├── settings.ts         # Candidate profile & immigration
│   │   ├── automation.ts       # Automation schedules
│   │   ├── orchestration.ts    # Manual workflow triggers & locks
│   │   ├── health.ts           # Subsystem health diagnostics
│   │   └── store.ts            # Local preview fallback mock store
│   ├── components/             # Reusable UI components
│   ├── pages/                  # Route views (Dashboard, Jobs, Workspace, Inbox, etc.)
│   ├── test/                   # Vitest unit, component, safety, and integration tests
│   ├── types/                  # Shared TypeScript definitions
│   ├── App.tsx                 # Root layout & QueryClientProvider
│   └── main.tsx                # React entrypoint
├── .env.example                # Environment variables template
├── wrangler.jsonc              # Cloudflare Pages deployment configuration
└── vite.config.ts              # Vite bundler configuration
```

---

## 🚀 Local Development

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env`:
```bash
# Connect to running FastAPI backend:
VITE_API_BASE_URL=http://localhost:8000

# Or leave empty to use local preview mock store:
# VITE_API_BASE_URL=
```

### 3. Run Dev Server
```bash
pnpm dev
```
Accessible at `http://localhost:5173`.

---

## 🧪 Testing & Building

```bash
# Run unit, component, safety, and integration tests
pnpm test

# Typecheck and build production bundle
pnpm build
```

---

## 🌐 Cloudflare Pages Deployment

Deploy via Cloudflare Pages:
- **Build command**: `pnpm build`
- **Build output directory**: `dist`
- **Environment variables**: `VITE_API_BASE_URL=https://api.jobsearch.sriramdevops.site`
- **Single Page Application routing**: Managed by `public/_redirects` (`/* /index.html 200`) and `wrangler.jsonc` (`not_found_handling = "single-page-application"`).
