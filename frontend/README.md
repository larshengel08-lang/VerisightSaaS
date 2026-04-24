# Verisight frontend

Next.js 15 App Router frontend voor de publieke site, loginflow en het dashboard.

## Lokale setup

1. Kopieer `frontend/.env.local.example` naar `frontend/.env.local`.
2. Vul minimaal deze variabelen in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=jouw-service-role-key
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
BACKEND_ADMIN_TOKEN=jouw-backend-admin-token
```

Toelichting:
- `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY` zijn nodig voor login, middleware en server-side Supabase helpers.
- `SUPABASE_SERVICE_ROLE_KEY` blijft server-only, maar is wel nodig voor dashboardroutes die organisatiegeheimen of invites beheren.
- `FRONTEND_URL` wordt gebruikt voor canonieke invite- en auth-redirectlinks.
- `NEXT_PUBLIC_API_URL` is nodig voor de FastAPI-proxyroutes.
- `BACKEND_ADMIN_TOKEN` is nodig voor server-only routes die de backend-adminproxy gebruiken.

Installeer dependencies en start daarna de devserver:

```bash
npm install
npm run dev
```

## Build en verificatie

Gebruik voor een lokale productiecheck dezelfde minimale env-set als hierboven en draai daarna:

```bash
npm run build
```

Voor een CI-achtige check kun je dezelfde build met `CI=true` draaien. De repo gebruikt lokaal een aparte `NEXT_DIST_DIR`, maar in Vercel en CI valt die bewust terug naar de standaard `.next` output.

## Vercel preview en production

Zet in Vercel zowel voor `Preview` als `Production` minimaal deze variabelen:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_URL`
- `NEXT_PUBLIC_API_URL`
- `BACKEND_ADMIN_TOKEN`

Voor previewdeploys mag `FRONTEND_URL` naar de preview-URL wijzen; voor productie moet dit de canonieke productiedomeinnaam zijn.

## Bekende buildnuance

`frontend/app/layout.tsx` gebruikt `next/font/google` voor IBM Plex Sans. Daardoor blijft de build afhankelijk van bereikbaarheid van Google Fonts tijdens `next build`. In normale Vercel- en online CI-omgevingen is dat geen blocker, maar in volledig afgesloten of instabiele netwerken kan dit alsnog een externe buildnuance zijn.
