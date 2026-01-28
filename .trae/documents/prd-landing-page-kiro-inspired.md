## 1. Product Overview

A kiro.dev-inspired marketing landing page for CodePath AI that explains the product quickly and drives sign-in/sign-up.
It must reuse existing `/public` media assets and fit into the current React Router flow without breaking the authenticated IDE.

## 2. Core Features

### 2.1 User Roles

| Role                                  | Registration Method              | Core Permissions                                |
| ------------------------------------- | -------------------------------- | ----------------------------------------------- |
| Visitor                               | No registration                  | Can view the landing page and navigate to Auth  |
| Authenticated User (Learner/Employer) | Email + password (Supabase Auth) | Can access Create Project and the IDE workspace |

### 2.2 Feature Module

Our requirements consist of the following main pages:

1. **Landing Page**: top navigation, hero + primary product video, feature sections with screenshots, primary/secondary CTAs, footer.
2. **Auth Page**: sign in, sign up, role selection (learner/employer).
3. **Create Project Page**: choose template, name project, create project and enter IDE.
4. **IDE Workspace**: coding layout, dual-agent AI panels.
5. **Not Found Page**: basic 404 fallback.

### 2.3 Page Details

| Page Name           | Module Name        | Feature description                                                                                                    |
| ------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Landing Page        | Top navigation     | Show logo + product name; provide CTA buttons that route to Auth (if signed out) or App (if signed in).                |
| Landing Page        | Hero               | Present one-sentence value prop and two CTAs (“Get started”, “Watch demo”).                                            |
| Landing Page        | Demo media         | Play `/public/primary-specs.mp4` as the main product demo preview (muted, loop, inline).                               |
| Landing Page        | Feature highlights | Explain the product via 2–3 sections pairing short copy with images from `/public` (see Page Design doc).              |
| Landing Page        | Final CTA + footer | Repeat primary CTA and show minimal footer links (e.g., Terms/Privacy placeholders only if already present elsewhere). |
| Auth Page           | Authentication     | Allow sign-in and sign-up via Supabase; capture role (learner/employer) on sign-up.                                    |
| Create Project Page | Template selection | Let authenticated users select a template, name it, and create a project.                                              |
| IDE Workspace       | Workspace access   | Allow authenticated users to open the IDE and continue after project creation.                                         |

## 3. Core Process

**Visitor Flow (signed out)**: You land on “/”, scan hero + demo, click “Get started”, authenticate on “/auth”, then go to “/create-project”, and finally enter the IDE workspace.

**Returning User Flow (signed in)**: You land on “/”, click “Open app”, go directly to the IDE workspace.

```mermaid
graph TD
  A["Landing Page (/)"] --> B["Auth (/auth)"]
  B --> C["Create Project (/create-project)"]
  C --> D["
```

