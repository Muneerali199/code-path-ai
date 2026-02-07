## Tech Stack (Current)

### Overview
- Monorepo with a React/Vite frontend and a NestJS backend.
- Supabase is present for database/auth/storage/functions and migrations.
- Multiple AI provider SDKs are integrated in the backend.

### Frontend
- Framework: React 18 + TypeScript.
- Build tooling: Vite with React SWC plugin.
- Styling: Tailwind CSS + PostCSS + shadcn/ui (Radix UI primitives, New York style).
- Routing: React Router.
- State/data: TanStack React Query, Zustand.
- Forms/validation: React Hook Form + Zod + @hookform/resolvers.
- UI/UX: Radix UI, Lucide icons, cmdk, sonner toasts, vaul drawers.
- Rich content: React Markdown + remark-gfm, date-fns.
- Visualization and motion: Recharts, Framer Motion, GSAP, Lenis.
- 3D/editor: Three.js + @react-three/fiber, @monaco-editor/react.
- Integrations: Supabase JS client, Firebase SDK.

### Backend
- Framework: NestJS (TypeScript).
- Auth: Passport + JWT.
- API docs: @nestjs/swagger (OpenAPI).
- Realtime: WebSockets (Socket.IO).
- Validation: class-validator + class-transformer.
- Security: bcrypt.
- HTTP: Axios.
- AI providers: OpenAI, Anthropic, Google Generative AI, You.com SDK.
- Utilities: UUID, RxJS, reflect-metadata.

### Data and Infra
- Database and platform: Supabase (Postgres, auth, functions, migrations).
- DB client: Supabase JS; `pg` present for Node/Postgres access.

### Tooling and Quality
- Linting: ESLint (frontend + backend).
- Formatting: Prettier (backend).
- Testing: Vitest (frontend), Jest (backend).

### Build/Run Scripts
- Root: `dev` runs frontend + backend concurrently.
- Frontend: `vite` dev/build/preview.
- Backend: Nest build and start scripts.

If you want this file to include specific deployment details (hosting, CI/CD, environment variables, secrets management), point me to those configs and I will add them.
