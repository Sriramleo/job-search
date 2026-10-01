# Germany Job Hunt — Agent & Operational Rules

## 1. Safety & Phase Boundaries
- **PHASE 1 IS FRONTEND ONLY.**
- Do NOT build, mock, or connect external live APIs: FastAPI, MongoDB, Jev, Gemini, Apify, Gmail API, Playwright runtime, Kubernetes, k0s, Traefik, or Cloudflare.
- Do NOT introduce unmocked network fetch calls that depend on external infrastructure.
- Zero fake immigration guarantees: Never state "Visa Guaranteed" or "Blue Card Guaranteed" or "98% Immigration Confidence". Use factual statuses: `Confirmed by Source`, `Evidence Found`, `Unknown`, `Contradictory` with explicit quote/source URL.

## 2. Technical Stack
- **Framework:** React 19 + TypeScript + Vite 8
- **Routing:** React Router v7 / v6
- **Styling:** Tailwind CSS with modern design tokens adhering strictly to `Frontend-design.md`
- **Icons:** Lucide React
- **Architecture:** Clean component architecture, separation of API contracts (`src/types`), Mock API services (`src/api`), and UI components (`src/components`).

## 3. Verification & Acceptance Criteria
- Run typecheck: `pnpm typecheck` or `tsc --noEmit`
- Run build: `pnpm build`
- Run test: `pnpm test`
- Inspect in browser for layout balance, high contrast, clean typography, responsive wrapping, and zero runtime errors.
