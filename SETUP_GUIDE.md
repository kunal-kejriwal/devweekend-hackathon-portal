# How to Build a Similar App on APIEngine

This guide walks you through building a multi-role platform (admins, reviewers, submitters) from scratch using **APIEngine** as your backend and **React + Vite** as your frontend. No custom backend server required.

---

## What You'll Need

| Requirement | Where to get it |
|---|---|
| APIEngine account (Business plan recommended) | [theapiengine.com](https://theapiengine.com) |
| Node.js ≥ 18 | [nodejs.org](https://nodejs.org) |
| Git | [git-scm.com](https://git-scm.com) |
| A code editor | VS Code recommended |

### APIEngine plan requirements

| Feature used in this app | Minimum plan |
|---|---|
| SDK Auth (AppUser signup/login/verify) | Free |
| Custom Objects (hackathon-submissions, submission-reviews) | Any paid plan |
| JSON DB (user-roles) | Paid (`can_use_json_database: true`) |
| Standard Events object | Any paid plan |
| Email templates (verification, password reset) | Included with SDK Auth |

---

## Step 1 — Create your APIEngine account

1. Go to [theapiengine.com](https://theapiengine.com) and sign up.
2. Once in the dashboard, note your **api_namespace** — a UUID that scopes all your data. It appears in the top of any downloaded spec file and in Developer Settings.

---

## Step 2 — Collect your API keys

You need **two keys**:

### SDK API Key
- Location: **Developer Settings → SDK tab**
- Starts with `ae-…`
- Used as the `X-API-Key` header on all AppUser (end-user) authentication calls.
- This key is safe to embed in your frontend — it identifies your tenant, not your developer account.

### Developer API Key
- Location: **Developer Settings → API Keys tab** (or API section)
- Starts with `ae_live_…`
- Used as the `X-API-Key` header for developer-level API calls (standard objects, custom objects, JSON DB).
- Also safe to embed when using `ApiKeyAuth` scheme; use developer JWT for write operations.

> 💡 The Developer JWT is obtained at runtime by POSTing your developer username + password to `/accounts/v1/api/auth/token/`. It is **not** a static key — don't hardcode it.

---

## Step 3 — Define your custom objects

Log into the APIEngine dashboard and create the custom objects your app needs.

### For a hackathon platform, create:

#### `hackathon-submissions`
| Field | Type | Required |
|---|---|---|
| `project_name` | Text | ✓ |
| `team_name` | Text | ✓ |
| `team_size` | Number | ✓ |
| `track` | Text | ✓ |
| `description` | Text | ✓ |
| `repo_url` | URL | ✓ |
| `demo_url` | URL | — |
| `submitter_email` | Email | ✓ |
| `submitter_app_user_id` | UUID | — |
| `status` | Text | — |
| `slide_deck_file_uuid` | UUID | — |

#### `submission-reviews`
| Field | Type | Required |
|---|---|---|
| `submission_uuid` | UUID | ✓ |
| `reviewer_name` | Text | ✓ |
| `reviewer_app_user_id` | UUID | — |
| `rating` | Number | ✓ |
| `feedback` | Text | ✓ |

---

## Step 4 — Download your OpenAPI spec

In your APIEngine dashboard, find the **Download Spec** button (usually under Developer Settings or API Docs). Save the file as `apiengine-spec.json` in your project root.

The spec contains:
- All your endpoint paths (pre-filled with your `api_namespace`)
- Request/response schemas for every custom object
- `x-codegen-hints` annotations that describe auth modes, flows, and edge cases — **read these carefully**

---

## Step 5 — Scaffold the React + Vite project

```bash
# In your project directory
npm create vite@latest . -- --template react
npm install axios react-router-dom react-hot-toast date-fns
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure Tailwind — add to `tailwind.config.js`:
```js
content: ['./index.html', './src/**/*.{js,jsx}'],
```

Add to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Step 6 — Build the API client

Create two Axios instances — one for developer operations, one for SDK (end-user) operations:

```js
// src/api/client.js
import axios from 'axios'

const BASE     = 'https://api.theapiengine.com'
const SDK_KEY  = import.meta.env.VITE_SDK_API_KEY
const API_KEY  = import.meta.env.VITE_API_KEY
export const NS = import.meta.env.VITE_API_NAMESPACE

// Developer client — add X-API-Key + developer JWT
export const devClient = axios.create({ baseURL: BASE, headers: { 'X-API-Key': API_KEY } })
devClient.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('dev_access')
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`
  return cfg
})

// SDK (AppUser) client — add X-API-Key + AppUser JWT
export const sdkClient = axios.create({ baseURL: BASE, headers: { 'X-API-Key': SDK_KEY } })
sdkClient.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('sdk_access')
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`
  return cfg
})
```

Add token-refresh interceptors on the response side (see `src/api/client.js` in this repo for the full implementation).

---

## Step 7 — Implement SDK Auth

The AppUser auth flow has four stages:

```
1. POST /api/v1/sdk/auth/signup/
   Body: { email, password, first_name?, last_name? }
   Header: X-API-Key
   → Account created, 6-digit code emailed

2. POST /api/v1/sdk/auth/verify-code/
   Body: { email, code }
   Header: X-API-Key
   → Returns { access, refresh, user }

3. POST /api/v1/sdk/auth/login/
   Body: { email, password }
   Header: X-API-Key
   → Returns { access, refresh, user }

4. POST /api/v1/sdk/auth/token/refresh/
   Body: { refresh }
   Header: X-API-Key
   → Returns { access }   (refresh NOT rotated)
```

**Token storage:** store `access` in memory/state, `refresh` in `localStorage`. Access TTL is 15 minutes; refresh is 7 days.

**Important:** AppUser JWT (`type: app_access`) and developer JWT (`type: access`) are NOT interchangeable. The server rejects the wrong type.

---

## Step 8 — Set up password reset

APIEngine inserts your **Frontend URL** into the password-reset email as:
```
{FRONTEND_URL}/reset-password?token={reset_token}
```

You **must** configure this in two places:
1. **APIEngine Dashboard → Developer Settings → Frontend URL** — set to your app's full URL (e.g. `http://localhost:5173` for dev, `https://yourapp.com` for production)
2. **Your `.env`** — `VITE_FRONTEND_URL=http://localhost:5173`

Then implement:
```
POST /api/v1/sdk/auth/forgot-password/  { email }     → sends reset email
POST /api/v1/sdk/auth/reset-password/   { token, password } → updates password
```

---

## Step 9 — Implement role-based access

Since `AppUser` has **no `custom_data` field**, store roles in the **JSON DB**:

```
Collection slug: user-roles
Record shape:    { user_id: string, email: string, role: 'reviewer' | 'submitter' }
```

Fetch the user's role after every login:
```js
GET /api/v1/db/{namespace}/user-roles/
  ?filter={"user_id": "<appuser_id>"}
  Header: X-API-Key
```

Admin assigns roles via:
```js
POST /api/v1/db/{namespace}/user-roles/
  Body: { user_id, email, role }
  Header: X-API-Key + developer Bearer
```

---

## Step 10 — Protect routes

```jsx
// src/components/ProtectedRoute.jsx
function ProtectedRoute({ children, require }) {
  const { activeMode, isAdmin, isReviewer, loading } = useAuth()
  if (loading) return <Spinner />
  if (!activeMode) return <Navigate to="/login" />
  if (require === 'admin'    && !isAdmin)    return <Navigate to="/dashboard" />
  if (require === 'reviewer' && !isReviewer) return <Navigate to="/dashboard" />
  return children
}
```

---

## Step 11 — Use Standard Events for contest records

APIEngine's Standard Events object (`/api/v1/standard/events/`) maps naturally to hackathon contests:

| Standard field | Maps to |
|---|---|
| `subject` | Contest name |
| `description` | Contest description |
| `start_datetime` | Hackathon start |
| `end_datetime` | Hackathon end |
| `location` | Online / City |
| `custom_data` | Prize pool, tracks, banner image, etc. (schema-free JSON bag) |

---

## Step 12 — Set the Frontend URL and deploy

For production:
1. Build: `npm run build`
2. Deploy `dist/` to Vercel, Netlify, Cloudflare Pages, or any static host.
3. Update **APIEngine Dashboard → Developer Settings → Frontend URL** to your production URL.
4. Set all `VITE_*` env vars in your hosting provider's environment settings (never commit `.env`).

---

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| Login returns 403 after signup | Email not verified yet. Show the verify-code screen. |
| Custom object writes return 401 | Ensure `Authorization: Bearer <dev_jwt>` is present for devClient writes |
| Password reset link 404s | Frontend URL not set in APIEngine Developer Settings |
| Leaderboard empty | Reviews haven't been submitted yet, or `submission_uuid` mismatch |
| Role not detected after login | JSON DB read using SDK key — check the `user_id` filter matches `appuser.id` exactly |

---

## Adapting This Template for Other Apps

The same pattern works for any multi-role platform:

| App type | Custom objects | Roles |
|---|---|---|
| Job board | `job-listings`, `applications` | employer, applicant, recruiter |
| Marketplace | `products`, `orders`, `reviews` | seller, buyer, moderator |
| Online course | `courses`, `enrollments`, `assignments` | instructor, student, TA |
| Bug tracker | `issues`, `comments` | admin, developer, reporter |

The key principles are always the same:
1. Use SDK Auth for end-user accounts
2. Use developer JWT for admin operations
3. Store role metadata in JSON DB (since AppUser has no custom_data)
4. Download the spec, read the `x-codegen-hints`, build from there

---

*Built with [Claude Code](https://claude.ai/code) · Backend by [APIEngine](https://theapiengine.com)*
