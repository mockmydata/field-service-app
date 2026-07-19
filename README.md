# Field Manager — React Native Field Service App

A React Native + TypeScript field service management app built as a tutorial template for [MockMyData.io](https://mockmydata.io). Jobs, customers, technicians, photo capture, and maps — all running against a live mock REST API.

**Runs in 3 commands. No signup, no config.**

---

## Try It Now

```bash
git clone https://github.com/mockmydata/field-service-app.git
cd field-service-app && npm install
npx expo start
```

Scan the QR code with [Expo Go](https://expo.dev/go) on your phone, or press `i` / `a` for a simulator.

The app boots against a public, shared MockMyData demo workspace with seeded data. On the login screen, tap one of the **demo account** chips (Manager or Technician) and you're in — browse jobs, customers, and technician profiles immediately.

> The demo workspace is shared — other visitors can see data you create there, and it may be reset periodically. For your own private data, see [Use Your Own MockMyData Workspace](#use-your-own-mockmydata-workspace).

---

## What's Included

- Authentication flow — login, register, JWT token handling (demo accounts in mock mode)
- Job management — create, view, update, and delete field service jobs
- Customer management — full CRUD with contact details
- Job types — categorize jobs with icons and colors
- Photo capture — multiple photos per job stored as a JSON array of URLs
- Job map view — customer locations with `react-native-maps`
- User profiles — technician details, ratings, and availability
- Quota awareness — the app reads MockMyData's `X-Plan` / `X-Requests-*` headers and surfaces rate-limit state in a banner

---

## Project Structure

```
src/
├── App.tsx                      # Providers (Auth, Quota, Jobs, Customers, Staff) + navigation root
├── navigation/
│   ├── index.tsx                # Tab + stack navigators
│   └── screens/
│       ├── Home.tsx             # Dashboard: calendar strip, job list, map toggle
│       ├── LoginScreen.tsx      # Login + demo account chips (mock mode)
│       ├── Auth/                # Signup
│       ├── Jobs/                # Job details, add job
│       ├── Customers/           # List, details, shared CustomerForm + Add/Edit wrappers
│       ├── Staff/               # List, details, shared StaffForm + Add/Edit wrappers
│       └── Settings/            # Profile
└── shared/
    ├── api/api.tsx              # Axios client, endpoints, auth, quota header capture
    ├── context/                 # Auth, Job, Customer, Staff, Quota providers
    ├── components/              # Map view, dialogs, pickers, quota banner
    ├── Theme.ts                 # Colors and design tokens
    └── JobConfig.ts             # Job status styles
```

Add and Edit screens are thin wrappers around shared form components (`CustomerForm`, `StaffForm`) — each wrapper supplies initial values and an `onSubmit`, so validation and layout live in exactly one place per entity.

---

## Use Your Own MockMyData Workspace

Want your own data instead of the shared demo?

1. Sign up free and import the endpoints from the [Field Service Template page](https://mockmydata.io/field-service-app)
2. Copy your subdomain and API key from the dashboard
3. Create a `.env`:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-tenant.api.mockmydata.io
EXPO_PUBLIC_API_KEY=sk_your_api_key_here
EXPO_PUBLIC_USE_MOCK_DATA=true
```

The app sends `X-API-Key` automatically when a key is set. Environment values always override the built-in demo defaults.

---

## Point It at a Real Backend

The API layer (`src/shared/api/api.tsx`) is a thin axios client — swap the base URL and the same app runs against any backend implementing the schema:

```env
EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com
EXPO_PUBLIC_USE_MOCK_DATA=false
```

`USE_MOCK_DATA=false` switches auth from demo-account matching to real JWT login/refresh.

### What your backend needs to implement

| Endpoint               | Methods                  | Notes                                               |
| ---------------------- | ------------------------ | --------------------------------------------------- |
| `/api/users/login/`    | POST                     | Returns `{ tokens: { access, refresh }, user }`     |
| `/api/users/register/` | POST                     | `{ name, email, password, password_confirm, role }` |
| `/api/users/`          | GET, POST, PATCH         | Staff list and management                           |
| `/api/jobs/`           | GET, POST, PATCH, DELETE | Jobs, including `customerId`, status, photos array  |
| `/api/customers/`      | GET, POST, PATCH         | Customers with contact details                      |
| `/api/job-types/`      | GET                      | Categories with icon and color                      |

Tokens are stored with `expo-secure-store`. The user object shape the app expects is `AppUser` in `src/shared/api/api.tsx`.

---

## Production Notes

This is a tutorial template — some choices were made to keep it easy to read and run, and I'd change them for a production deployment:

- **Data layer.** Server state here is hand-rolled: an axios client plus React contexts. I kept dependencies light so the fetch → cache → update flow is visible to people learning against a mock API. In a production team codebase I'd use [TanStack Query](https://tanstack.com/query) — it replaces what the contexts do manually (caching the lists, refetching when stale, updating every screen after a mutation) and the contexts shrink down to genuine UI state.
- **Auth.** Mock-mode login matches an email against `/api/users/` — demo-only by design. Against a real backend the app already does JWT with refresh; in production, add token expiry handling and a 401 → refresh → retry interceptor.
- **Photos.** Job photos are stored as an array of URLs in a JSON field, which is exactly what a mock API is good at. In production, upload images to object storage (S3, Cloudflare R2) and store the resulting URLs.
- **Validation.** Form validation is client-side only. A real backend should re-validate everything — client checks are UX, not security.
- **The baked-in demo key.** The default API key in `api.tsx` is scoped to the shared sample workspace only. Never ship a real key in source — use `.env` (already gitignored) for your own credentials.

---

## License

MIT — use it, fork it, build on it.
