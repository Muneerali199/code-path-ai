## 1.Architecture design
```mermaid
graph TD
  A["User Browser"] --> B["React Frontend (Vite)"]
  B --> C["Supabase JS SDK"]
  C --> D["Supabase Auth"]
  C --> E["Supabase Postgres (RLS)"]
  C --> F["Supabase Edge Functions"]

  subgraph "Frontend Layer"
    B
  end

  subgraph "Service Layer (Provided by Supabase)"
    D
    E
    F
  end
```

## 2.Technology Description
- Frontend: React@18 + react-router-dom@6 + tailwindcss@3 + shadcn/ui (Radix UI) + vite@5
- Backend: Supabase (Auth, Postgres, Edge Functions)

## 3.Route definitions
| Route | Purpose |
|-------|---------|
| / | Public landing page (marketing + CTA into Auth/App) |
| /auth | Sign in / sign up (Supabase Auth) |
| /create-project | Project template selection (requires auth) |
| /app | IDE workspace (requires auth) |
| * | Not found |

## 4.API definitions (If it includes backend services)
### 4.1 Supabase Edge Functions (called from frontend)
- `POST /functions/v1/execute-code` (execute user code and return output)
- `POST /functions/v1/guide-ai` (Guide-AI chat / coaching responses)

## 6.Data model(if applicable)
### 6.1 Data model definition
```mermaid
erDiagram
  PROFILES ||--o{ CODE_SESSIONS : "owns"
  CODE_SESSIONS ||--o{ CHAT_MESSAGES : "has"

  PROFILES {
    uuid id
    uuid user_id
    text email
    text full_name
    user_role role
    text avatar_url
    timestamptz created_at
    timestamptz updated_at
  }
  CODE_SESSIONS {
    uuid id
    uuid user_id
    text title
    text language
    text code
    text output
    timestamptz created_at
    timestamptz updated_at
  }
  CHAT_MESSAGES {
    uuid id
    uuid session_id
    uuid user_id
    text role
    text content
    timestamptz created_at
  }
```

### 6.2 Data Definition Language
Profiles (profiles)
```
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'learner',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
