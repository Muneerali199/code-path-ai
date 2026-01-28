# Page Design Spec — Landing Page (kiro.dev-inspired)

## Global Styles (site-wide)
- Theme: desktop-first, dark by default (use existing `.dark` tokens from `src/index.css`).
- Layout system: CSS Grid + Flexbox hybrid.
  - Max content width: `max-w-6xl` (or `max-w-7xl`) centered, with `px-6` desktop padding.
  - Section vertical rhythm: 80–120px on desktop, 48–72px on mobile.
- Typography:
  - H1: 48–56px, tight leading, bold.
  - H2: 32–40px, semibold.
  - Body: 16–18px, muted foreground for supporting copy.
- Buttons:
  - Primary: solid `bg-primary`, hover increases brightness; focus ring `ring-primary/40`.
  - Secondary: `bg-secondary` with border; hover `bg-accent`.

## Routing + Entry Points
- Public entry: `/` renders the Landing Page.
- Authenticated app entry: `/app` renders `EnhancedIDELayout`.
- CTA routing rules:
  - If signed out: “Get started” -> `/auth`.
  - If signed in: “Open app” -> `/app`.

---

## Page: Landing Page (`/`)

### Meta Information
- Title: `CodePath AI — Dual-agent AI coding workspace`
- Description: `Build projects faster with a dual-agent AI: one executes, one explains.`
- Open Graph:
  - `og:title`: same as title
  - `og:description`: same as description
  - `og:image`: `/primary-hooks.png` (or `/logo.svg` fallback)

### Page Structure (stacked sections)
1. Sticky top navigation
2. Hero (left copy + right media)
3. “How it works” (step cards)
4. Feature grid (screenshots)
5. Final CTA band
6. Footer

### Sections & Components

#### 1) Top Navigation (sticky)
- Left: logo (`<img src="/logo.svg" />`) + wordmark “CodePath AI”.
- Middle (desktop only): anchor links to sections: `#how-it-works`, `#features`.
- Right:
  - Secondary button: “Sign in” -> `/auth` (or “Open app” -> `/app` if signed in).
  - Primary button: “Get started” -> `/auth` (or “Open app” -> `/app`).
- Style: translucent background (`bg-background/60`), blur, bottom border.

#### 2) Hero (value prop + primary demo)
- Left column:
  - H1 headline (short, product-first).
  - 1–2 line subheading.
  - CTA row: Primary “Get started”, Secondary “Watch demo” (scroll to demo video).
  - Trust line: small text “Dual-agent AI: Coder-AI executes • Guide-AI explains” (matches existing Auth footer wording).
- Right column media card:
  - Video: `/primary-specs.mp4` embedded with rounded corners.
  - Behavior: `autoplay + muted + loop + playsInline`; show a fallback poster using `/secondary-specs-requirements.png`.

#### 3) How it works (`#how-it-works`)
- 3 step cards in a row (desktop), stacked (mobile):
  1. “Describe your goal” (use `/tertiary-context.png`)
  2. “Generate specs and tasks” (use `/secondary-specs-tasks.png`)
  3. “Execute and learn” (use `/tertiary-diagnostics.png`)
- Each card: image on top, title, 2–3 bullet lines.

#### 4) Feature Highlights (`#features`)
- Two-column alternating rows (image + copy):
  - Feature A: “Primary hooks” with `/primary-hooks.png`.
  - Feature B: “Specs workflow” with `/secondary-specs-design.png` and `/secondary-specs-requirements.png` as a small stacked pair.
  - Feature C: “MCP / tooling” with `/tertiary-mcp.png` and `/tertiary-steering.png`.
- Interaction: subtle hover lift on media cards; no heavy animations.

#### 5) Final CTA band
- Centered headline + single primary CTA.
- Optional small secondary link: “Sign in” (if signed out).

#### 6) Footer
- Left: logo + short tagline.
- Right: minimal links (only if already present elsewhere; otherwise placeholder labels without routes).

### Asset Checklist (must use from `/public`)
- Logo: `/logo.svg`
- Video: `/primary-specs.mp4`
- Screens: `/primary-hooks.png`, `/secondary-specs-design.png`, `/secondary-specs-requirements.png`, `/secondary-specs-tasks.png`
- Supporting: `/tertiary-context.png`, `/tertiary-diagnostics.png`, `/tertiary-mcp.png`, `/tertiary-steering.png`, `/tertiary-vibes.png`
