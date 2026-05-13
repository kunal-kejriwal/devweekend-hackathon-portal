# DevWeekend Hackathon Portal

A full-stack hackathon platform frontend built on top of **APIEngine** — letting organizers create contests, participants submit projects, and reviewers rate them.

**Live demo:** [https://apiengine-hackathon-portal-demo.vercel.app](https://apiengine-hackathon-portal-demo.vercel.app)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM v6 |
| HTTP | Axios (two client instances) |
| Notifications | react-hot-toast |
| Backend | [APIEngine](https://theapiengine.com) |

---

## Roles

| Role | Access |
|---|---|
| **Admin / Organizer** | Logs in with APIEngine developer credentials. Full CRUD on contests, submissions, and user role assignments. |
| **Reviewer** | SDK AppUser account assigned the `reviewer` role in JSON DB. Sees pending submissions and can submit ratings + feedback. |
| **Submitter** | Default role for every new AppUser. Can create and edit their own submissions during an active contest. |

---

## Getting Started

### 1. Clone

```bash
git clone https://github.com/kunal-kejriwal/devweekend-hackathon-portal.git
cd devweekend-hackathon-portal
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```env
# SDK tenant key (X-API-Key for AppUser auth + custom objects)
VITE_SDK_API_KEY=ae-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Developer API key (X-API-Key for devClient — standard events, JSON DB)
VITE_API_KEY=ae_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Your api_namespace from APIEngine (from the spec or developer dashboard)
VITE_API_NAMESPACE=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Full URL of THIS app — must match "Frontend URL" in APIEngine Developer Settings
# APIEngine inserts this into password-reset emails
VITE_FRONTEND_URL=http://localhost:5173

VITE_APP_NAME=DevWeekend
```

> ⚠️  `.env` is in `.gitignore` and will never be committed. Only `.env.example` (with placeholder values) is tracked.

### 3. Set Frontend URL in APIEngine

In **APIEngine Dashboard → Developer Settings**, set **Frontend URL** to `http://localhost:5173` for local dev, or `https://apiengine-hackathon-portal-demo.vercel.app` for production. This is required for password-reset email links to work.

### 4. Run

```bash
npm run dev      # development server → http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build locally
```

---

## Project Structure

```
src/
├── api/
│   ├── client.js          # devClient (BearerAuth) + sdkClient (X-API-Key + AppUser JWT)
│   ├── auth.js            # Developer auth + SDK AppUser auth endpoints
│   ├── events.js          # Standard CRM Events (hackathon contests)
│   ├── submissions.js     # Custom object: hackathon-submissions
│   ├── reviews.js         # Custom object: submission-reviews
│   └── roles.js           # JSON DB: user-roles collection
├── context/
│   └── AuthContext.jsx    # Dual session state (developer + AppUser)
├── components/
│   ├── Layout.jsx
│   ├── Navbar.jsx
│   └── ProtectedRoute.jsx
└── pages/
    ├── Landing.jsx        # Public hero + contest listing
    ├── Events.jsx         # Full contest browser
    ├── Leaderboard.jsx    # Rankings by average review score
    ├── Profile.jsx
    ├── auth/              # Login, Signup, VerifyEmail (6-digit OTP), ForgotPassword, ResetPassword
    ├── admin/             # Dashboard, ManageEvents, Submissions, ManageRoles
    ├── reviewer/          # Dashboard (queue), ReviewSubmission (rating + feedback)
    └── submitter/         # Submit.jsx (list + create/edit form)
```

---

## Auth Flows

### AppUser (Reviewer / Submitter)
```
POST /api/v1/sdk/auth/signup/          → account created, 6-digit code emailed
POST /api/v1/sdk/auth/verify-code/     → returns access + refresh JWT + user
POST /api/v1/sdk/auth/login/           → returns access + refresh JWT + user
POST /api/v1/sdk/auth/forgot-password/ → reset link emailed to FRONTEND_URL/reset-password?token=…
POST /api/v1/sdk/auth/reset-password/  → password updated
```

### Admin (Developer)
```
POST /accounts/v1/api/auth/token/      → developer JWT (username + password)
GET  /accounts/v1/api/auth/me/         → developer profile
```

---

## APIEngine Resources Used

| Resource | Endpoint | Used for |
|---|---|---|
| SDK Auth | `/api/v1/sdk/auth/*` | AppUser signup, login, verify, password reset |
| Standard Events | `/api/v1/standard/events/` | Hackathon contest records |
| Custom Object | `hackathon-submissions` | Project submissions |
| Custom Object | `submission-reviews` | Reviewer ratings + feedback |
| JSON DB | `/api/v1/db/{namespace}/user-roles/` | User role assignments |

---

---

## Want to Build a Similar App?

See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for a complete step-by-step walkthrough covering:
- What APIEngine plan + features you need
- How to collect your two API keys
- How to define custom objects
- How to implement SDK Auth (signup → OTP verify → login → refresh)
- How to wire role-based access without a custom backend
- How to set up password-reset emails
- Deployment checklist and common pitfalls

---

## The Prompt That Built This

> *"Consider yourself to be a senior frontend designer who specializes in reading OpenAPI spec JSON files, and building the entire frontend using that file. In this scenario, I will be making use of APIEngine, with the OpenAPI-Spec downloaded for my profile from TheAPIEngine. Your primary requirement is to build me a working frontend for a Devathon Weekend app, where organizers can create a website to host webathon contests.*
>
> *a. Organizers will be admins, and will be able to control everything, and post events.*
> *b. Reviewers will be able to review and rank submission.*
> *c. Submitters will be able to submit.*
>
> *Treat my plan to be Business plan, and build me a frontend using APIEngine backend and it's OpenAPI spec file. I will share my SDK key for Login and other files, and my API Key for dev related endpoints. Also, ensure, the signup, login pages are there, with email send for verification, and confirmations.*
>
> *We have Email templates and others on APIEngine"*

The user also provided:
- The downloaded `apiengine-spec.json` file (already present in the project directory)
- SDK API Key: shared mid-build via chat
- Developer X-API-Key: shared mid-build via chat

---

## My Experience Building This — An Unbiased Review

### What I received

1. A natural-language prompt describing three roles (admin, reviewer, submitter) and the desired platform behavior.
2. A downloaded `apiengine-spec.json` — a 730 KB OpenAPI 3.1 spec auto-generated by APIEngine for the user's account.
3. Two API keys shared partway through the build.

---

### What worked well

**The OpenAPI spec was exceptional quality.** It was not a bare spec — it included rich `x-codegen-hints` annotations on every tag and schema. These told me:

- Which auth mode to use (`BearerAuth` vs `ApiKeyAuth` vs `AppUserBearerAuth`)
- The exact signup → verify-code → login flow with TTLs
- That `AppUser` has no `custom_data` field, and where to store metadata instead (JSON DB)
- The `FRONTEND_URL` pattern for password-reset email links
- That AppUser JWT and developer JWT are NOT interchangeable (different `type` claims)

Without these hints I would have needed to trial-and-error the auth flow. With them, I could build the correct two-client architecture (`devClient` for developer JWT, `sdkClient` for AppUser JWT + X-API-Key) on the first pass.

**The custom objects were pre-defined.** The user had already created `hackathon-submissions` and `submission-reviews` in their APIEngine account. Both appeared in the spec with proper field names and types. I didn't have to design a data model — I could just read it directly from the spec.

**APIEngine's SDK Auth design is clean.** The separation between developer accounts and AppUsers is well thought-out. The 6-digit email OTP flow, token refresh, and password-reset flow are all standard patterns, and the spec described them clearly.

---

### What required judgment calls (not blockers)

**Two API keys, ambiguous naming.** The user shared an "SDK API Key" (`ae-…`) and an "X-API-Key" (`ae_live_…`). The spec consistently describes `X-API-Key` as the SDK tenant key from Developer Settings → SDK tab, but the user labeled them differently. I inferred that one is for SDK Auth endpoints and the other for developer API endpoints, and wired them into two separate env vars (`VITE_SDK_API_KEY` and `VITE_API_KEY`). The correct mapping may need confirming against the actual APIEngine dashboard.

**Role storage.** `AppUser` has no `custom_data` field (the spec explicitly says so). The spec suggests using the app's own data store with `app_user.id` as a foreign key. I chose JSON DB (`user-roles` collection) since it's available in the same APIEngine account. This is a reasonable choice for a demo but a production app might prefer a dedicated custom object for richer querying.

**Admin UX for role assignment.** Assigning a reviewer role currently requires the admin to know the user's AppUser UUID. The spec doesn't expose a "list all AppUsers" endpoint yet (noted as "Phase 4c" in `x-codegen-hints`). I surfaced the UUID on the Profile page and added a help note — workable for a hackathon but a future improvement once the admin user-list endpoint ships.

---

### Overall assessment

**The process was largely seamless.** The combination of a clean OpenAPI spec with machine-readable hints + pre-defined custom objects meant I could scaffold a production-quality 30-file React app in a single session without making guesses about the backend contract. The only friction was the two-key naming ambiguity.

**APIEngine's approach of shipping a personalised spec per developer account is genuinely useful for AI-assisted codegen.** The `x-codegen-hints` annotations are what made the difference — they encode the knowledge a developer would normally get from reading documentation pages. If that annotation pattern is consistently maintained as the API evolves, it removes a significant class of integration errors.

**What I'd improve:** A "list AppUsers by tenant" admin endpoint (roadmapped), and a clearer label distinction between the SDK tab key and the developer API key in the dashboard UI.

---

*Built with [Claude Code](https://claude.ai/code) + [APIEngine](https://theapiengine.com)*
