# Webinars module (UI only, dummy data)

All webinar code is in this folder (`src/webinars/`). Course code is untouched.

## Folder
```
src/webinars/
  lib/
    types.ts           data shapes (= future API contract)
    data.ts            DUMMY webinars, speakers, demo history  ← edit content here
    api.ts             mock service; each function names its future endpoint
    utils.ts           all rules: status, join window, recording, certificate, coupons, validation
    hooks.ts           useNow, useCurrentUser (existing auth slice), useMyRegistrations
    certificatePdf.ts  PDF certificate (pdf-lib, loaded only on download)
  components/
    ui.tsx, WebinarCover.tsx, WebinarCard.tsx, RegisterModal.tsx, RelatedCourse.tsx,
    QuizModal.tsx, CertificatePreview.tsx, WebinarNotFound.tsx, UpcomingWebinars.tsx
  pages/
    WebinarsLayout.tsx, WebinarsListPage.tsx, WebinarSlugLayout.tsx, WebinarDetailPage.tsx,
    LiveRoomPage.tsx, RecordingPage.tsx, VerifyPage.tsx,
    MyWebinarsPage.tsx, WebinarCertificatesPage.tsx
```

## Route files (one line each — Next.js only reads routes from src/app)
```
src/app/webinars/layout.tsx                      → pages/WebinarsLayout
src/app/webinars/page.tsx                        → /webinars
src/app/webinars/[slug]/layout.tsx               → pages/WebinarSlugLayout (SEO)
src/app/webinars/[slug]/page.tsx                 → /webinars/:slug
src/app/webinars/[slug]/live/page.tsx            → /webinars/:slug/live
src/app/webinars/[slug]/recording/page.tsx       → /webinars/:slug/recording
src/app/webinars/verify/page.tsx                 → /webinars/verify?id=
src/app/dashboard/webinars/page.tsx              → /dashboard/webinars
src/app/dashboard/webinar-certificates/page.tsx  → /dashboard/webinar-certificates
```

## Existing files changed (3)
- `src/components/navbar/Navbar.tsx` — Webinars link in header
- `src/components/dashboard/Sidebar.tsx` — My Webinars, Webinar Certificates
- `src/app/page.tsx` — `<UpcomingWebinars/>` on home (optional)

## Backend later
1. Replace the functions in `lib/api.ts` with RTK Query endpoints (same names).
2. Remove `seedDemoHistory` calls in `pages/MyWebinarsPage.tsx` and `pages/WebinarCertificatesPage.tsx`, and the demo "Reset" link.
3. Backend fills `attendancePct` from live join/leave logs; `quizPassed` from `POST /webinars/:id/quiz`.
4. Live room: add the stream embed URL per session in `pages/LiveRoomPage.tsx`.
5. Payment: swap `api.pay()` for Razorpay. Validate coupons on the server.
