# Field Manager — React Native Field Service App (Version 1)

A React Native field service management app built as a tutorial template for [MockMyData.io](https://mockmydata.io). Demonstrates real-world mobile development against a live mock REST API — authentication flow, data fetching, CRUD operations, photo capture with JSONField storage.

Clone it, point it at your MockMyData workspace or your own backend, and start building.

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/mockmydata/field-service-app.git
cd field-service-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your environment

Copy the example env file:

```bash
cp .env.example .env
```

Open `.env` and update the values:

```env
# Your API base URL — no trailing slash
# For local development with ngrok:
EXPO_PUBLIC_API_BASE_URL=https://your-ngrok-url.ngrok-free.app

# For your own backend in production:
# EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com

# MockMyData API key (optional — only needed if using MockMyData)
# EXPO_PUBLIC_API_KEY=sk_your_api_key_here

# Set to true to use MockMyData endpoints
# EXPO_PUBLIC_USE_MOCK_DATA=false
```

### 4. Start the app

```bash
npx expo start
```

Scan the QR code with Expo Go on your device or press `i` for iOS simulator / `a` for Android emulator.

---

## Using MockMyData for Mock Data

Want to develop your frontend without a running backend? Point the app at a [MockMyData.io](https://mockmydata.io) workspace instead.

1. Create a free account at [mockmydata.io](https://mockmydata.io)
2. Create a project and set up your endpoints to match the expected schema
3. Copy your subdomain and API key from the dashboard
4. Update your `.env`:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-tenant.api.mockmydata.io
EXPO_PUBLIC_API_KEY=sk_your_api_key_here
EXPO_PUBLIC_USE_MOCK_DATA=true
```

The app sends `X-API-Key` in request headers automatically when `EXPO_PUBLIC_API_KEY` is set.

> When you're ready to switch to your real backend, update `EXPO_PUBLIC_API_BASE_URL` to your production URL, remove the API key, and set `EXPO_PUBLIC_USE_MOCK_DATA=false`.

---

## What's Included

- Authentication flow — login, register, JWT token handling
- Job management — create, view, update, and delete field service jobs
- Customer management — full CRUD with contact details
- Job types — categorize jobs with icons and colors
- Photo capture — multiple photos per job stored as a JSON array of URLs (upload to S3, Cloudinary, or any storage provider and save the returned URL)
- User profiles — technician details, ratings, and availability

---

## Project Structure