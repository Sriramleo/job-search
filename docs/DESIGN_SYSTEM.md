# Germany Job Hunt — Design System Specification

## 1. Visual Thesis & Philosophy
- **Identity:** High-craft European SaaS recruitment workstation / CRM.
- **Atmosphere:** Calm, sharp, information-dense, confident, purposeful.
- **Anti-patterns:** No neon gradients, no cryptocurrency dashboard aesthetics, no generic AI sparkle clutter.

## 2. Color Tokens
| Semantic Role | Hex Code | Usage |
|---|---|---|
| Background | `#F8FAFC` | Main app canvas / slate-50 |
| Surface | `#FFFFFF` | Cards, tables, drawers, modals |
| Primary Text | `#0F172A` | Headings, high emphasis text (slate-900) |
| Secondary Text | `#475569` | Body text, labels (slate-600) |
| Muted Text | `#64748B` | Subtext, timestamps, hints (slate-500) |
| Border | `#E2E8F0` | Dividers, card boundaries (slate-200) |
| Primary Action | `#2563EB` | Interactive buttons, primary links (blue-600) |
| Primary Hover | `#1D4ED8` | Active button state (blue-700) |
| AI / Intelligence | `#7C3AED` | AI-assisted drafts, synthesis (violet-600) |
| Success / Verified | `#16A34A` | Confirmed evidence, offers, completed (green-600) |
| Warning / Review | `#D97706` | Needs human review, pending checks (amber-600) |
| Danger / Blocked | `#DC2626` | Gaps, rejections, overdue tasks (red-600) |
| Unknown / Neutral | `#94A3B8` | Pending verification, unconfirmed (slate-400) |

## 3. Typography Scale
- Primary Font: Inter / sans-serif with tabular figures for metrics
- Page Title: 28–32px (bold, tracking-tight)
- Major Number: 28–36px (semibold)
- Section Header: 18–20px (semibold)
- Body: 14px (minimum)
- Secondary Metadata: 12–13px

## 4. Layout Architecture
- Standard 3-tier App Shell: Left Sidebar (collapsible on mobile/tablet), Top Bar with persistent search and profile, Dynamic Main Stage, Optional Right Drawer.
- Application Workspace: Specialized 3-column workstation layout.
