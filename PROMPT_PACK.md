# PROMPT_PACK.md — Xavier 300
## Coding Agent Build Instructions
**Platform:** Tech Certification Mock Exam | **Market:** Nigeria
**Stack:** Next.js 14 · TypeScript · Tailwind · PostgreSQL · Prisma · Node.js · Paystack · Claude API

---

> **AGENT INSTRUCTIONS:**
> - Execute ONE step at a time. Do not skip ahead.
> - After each step, run the tagged review command.
> - Every 5 steps a Context Refresh Prompt is provided — read it fully before continuing.
> - All design decisions are governed by `DESIGN.md`. All feature decisions are governed by `PRD.md`.
> - Read both files at the start of this session before executing Step 01.

---

## [STEP 01] — Project Scaffolding & Repository Setup

**Context:**
You are building Xavier 300 — a Nigerian tech certification mock exam platform. This step sets up the full monorepo foundation with all tooling configured correctly before any feature code is written.

**Task:**
1. Scaffold a Next.js 14 project with App Router and TypeScript strict mode:
   ```bash
   npx create-next-app@latest xavier-300 --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   ```
2. Initialize a Git repository and create `.gitignore` (include `.env`, `.env.local`, `node_modules`, `.next`, `prisma/dev.db`)
3. Install all frontend dependencies:
   ```bash
   npm install zustand @tanstack/react-query react-hook-form @hookform/resolvers zod framer-motion lucide-react recharts class-variance-authority clsx tailwind-merge
   ```
4. Install shadcn/ui:
   ```bash
   npx shadcn-ui@latest init
   ```
   Select: Default style, CSS variables enabled, Slate base colour (we override with our own tokens)
5. Install shadcn components needed:
   ```bash
   npx shadcn-ui@latest add button card dialog badge progress tabs input label toast sheet
   ```
6. Create the backend folder structure inside the monorepo:
   ```
   /apps
     /web        ← Next.js app
     /api        ← Express.js backend
   /packages
     /db         ← Prisma schema + client
     /types      ← Shared TypeScript types
   ```
7. Initialize the `/apps/api` Express.js project:
   ```bash
   cd apps/api && npm init -y
   npm install express cors helmet dotenv bcryptjs jsonwebtoken express-rate-limit zod express-validator @prisma/client bull ioredis resend
   npm install -D typescript @types/express @types/node @types/bcryptjs @types/jsonwebtoken ts-node-dev
   ```
8. Create `tsconfig.json` for the API with strict mode
9. Create `.env.example` with ALL required environment variables:
   ```env
   # Database
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...

   # Auth
   JWT_SECRET=
   JWT_REFRESH_SECRET=

   # Paystack
   PAYSTACK_SECRET_KEY=
   PAYSTACK_PUBLIC_KEY=
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

   # Anthropic
   ANTHROPIC_API_KEY=

   # Email (Resend)
   RESEND_API_KEY=
   EMAIL_FROM=noreply@xavier300.com.ng

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   API_URL=http://localhost:4000
   NEXT_PUBLIC_API_URL=http://localhost:4000

   # Web Push (VAPID)
   VAPID_PUBLIC_KEY=
   VAPID_PRIVATE_KEY=
   VAPID_EMAIL=
   ```
10. Make initial commit: `git commit -m "feat: initial project scaffolding — Xavier 300"`

**Expected Output:**
- Monorepo structure created and committed
- All dependencies installed
- `.env.example` populated with all variable names
- Project runs with `npm run dev` without errors

**File/Folder Targets:** `/`, `/apps/web`, `/apps/api`, `/packages`

→ **After this step: `/review`**

---

## [STEP 02] — Design System & Global Styles

**Context:**
Requires STEP 01 complete. You are implementing the Xavier 300 design system from DESIGN.md. This step creates all CSS variables, font imports, Tailwind config, and base component styles. Nothing functional — purely visual foundation.

**Task:**
1. Update `/apps/web/src/app/globals.css` with the complete CSS variable system from DESIGN.md (light mode + dark mode via `[data-theme="dark"]`):
   - All `--bg-*` tokens
   - All `--text-*` tokens
   - All `--accent-*` tokens
   - All `--border-*`, `--shadow-*`, `--space-*`, `--radius-*` tokens
   - All animation easing tokens
2. Add Google Fonts import to `globals.css`:
   - Cormorant Garamond (600, 700) — display font
   - DM Sans (300, 400, 500, 600) — UI font
   - JetBrains Mono (400, 600) — timer/score font
3. Update `tailwind.config.ts` to extend with:
   - Custom colours mapping to CSS variables
   - Custom font families: `display`, `ui`, `mono`
   - Custom border-radius tokens
   - Custom spacing tokens
   - Dark mode: `class` strategy using `data-theme` attribute
4. Create `/apps/web/src/lib/theme.ts`:
   ```typescript
   // Theme manager — reads localStorage + system preference
   // Sets data-theme attribute on document.documentElement
   // Exports: getTheme(), setTheme(), toggleTheme()
   ```
5. Create `/apps/web/src/components/theme-provider.tsx`:
   - Wraps app in theme context
   - Initialises theme on mount (no flash of wrong theme)
   - Exports `useTheme()` hook
6. Create `/apps/web/src/components/theme-toggle.tsx`:
   - Pill-shaped toggle with Sun/Moon Lucide icons
   - Smooth 300ms transition on toggle
7. Update `layout.tsx` to wrap with ThemeProvider and apply `font-ui` as default body font

**Expected Output:**
- Both light and dark themes visually correct
- Font families load correctly
- Theme toggle works without page flash
- Tailwind classes `bg-primary`, `text-primary`, `accent-primary` etc. resolve correctly

**File Targets:** `globals.css`, `tailwind.config.ts`, `src/lib/theme.ts`, `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`, `src/app/layout.tsx`

→ **After this step: `/review` then `/qa`**

---

## [STEP 03] — Database Schema & Prisma Setup

**Context:**
Requires STEP 01 complete. This step creates the complete database schema and Prisma configuration.

**Task:**
1. Create `/packages/db/schema.prisma` with the COMPLETE schema from PRD.md Section 6:
   - All models: `User`, `Domain`, `Certification`, `Question`, `ExamAttempt`, `Payment`, `WeeklyScore`, `SupportTicket`
   - All enums: `Role`, `SubStatus`, `Difficulty`, `QuestionSource`, `QuestionStatus`, `AttemptStatus`, `PlanType`, `PaymentStatus`, `TicketType`, `TicketStatus`
   - Add `@@index` on: `userId`, `certificationId`, `status`, `weekStart`, `createdAt` where applicable
2. Create `/packages/db/seed.ts`:
   - Seed all 9 domains with correct slugs, descriptions, priority values
   - Seed all certifications per domain (from PRD.md Section 2)
   - Create 1 Super Admin user (credentials via env vars)
3. Add Prisma generate + push scripts to `package.json`
4. Create `/packages/db/index.ts` — exports Prisma client as singleton:
   ```typescript
   // Prevents multiple Prisma instances in development (Next.js hot reload issue)
   const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
   export const prisma = globalForPrisma.prisma || new PrismaClient()
   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
   ```
5. Run:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```
6. Commit: `git commit -m "feat: database schema + seed data"`

**Expected Output:**
- All tables created in PostgreSQL
- Prisma client generated
- Seed data visible in Prisma Studio (`npx prisma studio`)
- 9 domains, all certifications, 1 admin user present in DB

**File Targets:** `/packages/db/schema.prisma`, `/packages/db/seed.ts`, `/packages/db/index.ts`

→ **After this step: `/review`**

---

## [STEP 04] — Auth API (Backend)

**Context:**
Requires STEP 03 complete. Build the complete authentication API on the Express.js backend.

**Task:**
1. Create Express app entry point `/apps/api/src/index.ts`:
   - Setup: cors, helmet, express.json(), rate limiting
   - Mount all routers
   - Error handling middleware
2. Create `/apps/api/src/middleware/auth.middleware.ts`:
   - `authenticate` — verifies JWT access token, attaches `req.user`
   - `requireRole(role)` — checks user role
   - `requireSubscription` — checks subscription is active (not expired)
3. Create `/apps/api/src/services/auth.service.ts`:
   - `hashPassword(password)` → bcrypt hash
   - `comparePassword(password, hash)` → boolean
   - `generateTokens(userId, role)` → `{ accessToken, refreshToken }`
   - `generateOTP()` → 6-digit string
   - `sendVerificationEmail(email, otp)` → via Resend
4. Create `/apps/api/src/routes/auth.routes.ts` with all endpoints from PRD Section 7:
   - `POST /signup` — validate input (Zod), create user, send OTP email
   - `POST /verify-email` — validate OTP, mark verified, return tokens
   - `POST /login` — validate credentials, check email verified, return tokens
   - `POST /refresh` — validate refresh token, return new access token
   - `POST /logout` — invalidate refresh token
   - `POST /resend-otp` — generate new OTP, resend email
   - `POST /forgot-password` — send reset link
   - `POST /reset-password` — validate token, update password
5. All Zod schemas for request validation
6. Rate limit `/auth/*` to 10 req/min per IP

**Expected Output:**
- All auth endpoints functional and tested via Postman/curl
- OTP email sends correctly
- JWT tokens generated and validated
- Error responses follow consistent format: `{ success: false, error: { code, message } }`

**File Targets:** `/apps/api/src/index.ts`, `/apps/api/src/middleware/`, `/apps/api/src/services/auth.service.ts`, `/apps/api/src/routes/auth.routes.ts`

→ **After this step: `/review` then `/careful`**

---

## [STEP 05] — Auth Frontend (Login, Signup, Verify)

**Context:**
Requires STEP 04 complete. Build the authentication pages following DESIGN.md exactly.

**Task:**
1. Create `/apps/web/src/lib/api.ts`:
   - Axios instance with base URL from `NEXT_PUBLIC_API_URL`
   - Request interceptor: attach access token from cookie/localStorage
   - Response interceptor: on 401, attempt token refresh, retry once, then redirect to login
2. Create `/apps/web/src/store/auth.store.ts` (Zustand):
   - State: `user`, `isAuthenticated`, `isLoading`
   - Actions: `login()`, `logout()`, `setUser()`, `refreshAuth()`
3. Create `/apps/web/src/app/(auth)/login/page.tsx`:
   - Design: Split layout — left side large "Xavier 300" display typography + tagline on `--bg-secondary` background, right side login form on `--bg-primary`
   - Form fields: Email, Password (toggle visibility)
   - Pill CTA button (indigo)
   - Link to signup
   - "Forgot password?" link
   - Theme toggle in top-right corner
4. Create `/apps/web/src/app/(auth)/signup/page.tsx`:
   - Same split layout
   - Fields: Full Name, Email, Password, Phone Number, State (dropdown — all 36 Nigerian states), Occupation, Years of Experience (dropdown: 0–1, 1–3, 3–5, 5–10, 10+)
   - Password strength indicator
5. Create `/apps/web/src/app/(auth)/verify/page.tsx`:
   - 6-digit OTP input (individual boxes, auto-advance on input)
   - Resend OTP countdown (60 seconds)
   - Success animation → redirect to dashboard
6. Create `/apps/web/src/app/(auth)/forgot-password/page.tsx` and `/reset-password/page.tsx`
7. Create auth route guards using Next.js middleware (`middleware.ts`):
   - Protected routes redirect to `/login` if not authenticated
   - Auth routes redirect to `/dashboard` if already authenticated
   - Subscription check routes redirect to `/pricing` if not subscribed

**Expected Output:**
- All auth pages visually match DESIGN.md (warm cream bg, large typography, pill buttons)
- Forms validate with Zod + React Hook Form
- Full auth flow works end-to-end: signup → verify email → login → dashboard
- Dark mode works on all auth pages

**File Targets:** `src/lib/api.ts`, `src/store/auth.store.ts`, `src/app/(auth)/`, `middleware.ts`

→ **After this step: `/review` then `/qa`**

---

## ⟳ CONTEXT REFRESH — After Step 05

```
You are building Xavier 300 — a Nigerian tech certification mock exam platform.

COMPLETED so far:
✅ STEP 01: Project scaffolded (Next.js 14 + Express.js monorepo)
✅ STEP 02: Design system — CSS variables, fonts, theme toggle
✅ STEP 03: Database schema — all 9 models created, seeded
✅ STEP 04: Auth API — signup, login, OTP, JWT
✅ STEP 05: Auth frontend — login, signup, verify pages

NEXT: STEP 06 — Landing Page

DESIGN PRINCIPLES (always active):
- Warm minimal palette: cream (#F5F2EC), deep indigo (#3730A3), obsidian (#1A1A18)
- Fonts: Cormorant Garamond (display), DM Sans (UI), JetBrains Mono (mono)
- Cards: glassmorphism with backdrop-blur
- Buttons: pill-shaped (border-radius: 100px)
- Reference: GreenMotive editorial layout (large type, glass cards, floating nav)
- Both light + dark mode on every page

TECH STACK:
- Frontend: Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui, Zustand, React Query, Framer Motion
- Backend: Express.js, Prisma, PostgreSQL, Redis, JWT
- AI: Anthropic Claude API (claude-sonnet-4-20250514)
- Payments: Paystack
```

---

## [STEP 06] — Landing Page

**Context:**
Requires STEP 05 complete. This is the most important marketing page. It must match the GreenMotive reference exactly in layout philosophy — large editorial hero, floating pill nav, glass cards for domains.

**Task:**
1. Create `/apps/web/src/components/layout/navbar.tsx`:
   - Floating pill nav (centered) — `Menu` + `Browse Courses` pills
   - Logo: Xavier 300 X mark + wordmark (top-left)
   - Right: `Start Free Trial` pill button (indigo) OR user avatar if logged in
   - Theme toggle integrated
   - On scroll: `backdrop-blur-md` + subtle border appears
   - Mobile: hamburger → full-screen overlay
2. Create `/apps/web/src/app/(public)/page.tsx` — Landing Page sections:
   **Section 1 — Hero:**
   - Large display text: "Welcome to Your Practice Centre for Tech Certification"
   - Sub-headline: "Exam-ready confidence. Nigerian pricing. World-class preparation."
   - CTA pills: "Start Free Trial" (indigo filled) + "Browse Courses" (outline)
   - Subtle grain texture overlay on background
   - Staggered Framer Motion entrance (headline → subtext → CTAs, 100ms delay each)

   **Section 2 — Domain Grid:**
   - Title: "Choose Your Certification Path"
   - 3-column grid (desktop) → 2-col (tablet) → 1-col (mobile)
   - 9 glass cards, one per domain
   - Each card: geometric icon mark, domain name (caps, tracking-wide), certification count, hover lift effect
   - Clicking a card scrolls to certification list OR navigates to `/courses/[slug]`
   - Priority domains (Data Analysis, Data Science, Cybersecurity) shown first

   **Section 3 — How It Works:**
   - 4 steps with numbered markers: Choose → Practice → Get Results → Improve
   - Horizontal timeline (desktop) → vertical (mobile)

   **Section 4 — Pricing:**
   - Two cards: Monthly (₦5,000) + Annual (₦50,000)
   - Annual shows "Save ₦10,000" badge
   - 1-week free trial prominent
   - Both cards link to `/signup`

   **Section 5 — Footer:**
   - Xavier 300 wordmark
   - Links: About, Pricing, Support, Privacy Policy
   - "Built for Nigerian tech professionals"

**Expected Output:**
- Landing page matches editorial reference (large type, glass cards, cream background)
- All Framer Motion animations smooth (60fps)
- Fully responsive desktop → mobile
- Dark mode correct on all sections
- Performance: LCP < 2.5s, no layout shift

**File Targets:** `src/components/layout/navbar.tsx`, `src/app/(public)/page.tsx`

→ **After this step: `/review` then `/qa`**

---

## [STEP 07] — Dashboard & Course Selection Pages

**Context:**
Requires STEP 06 complete. Authenticated users land here after login. This is the main hub — recent activity, quick access to courses, weekly leaderboard preview.

**Task:**
1. Create layout `/apps/web/src/app/(protected)/layout.tsx`:
   - Sidebar nav (desktop) — Logo, nav items: Dashboard, Courses, Leaderboard, Profile, Support
   - Top bar: User name + avatar, theme toggle, notification bell
   - Mobile: bottom tab bar (Dashboard, Courses, Leaderboard, Profile)
2. Create `/apps/web/src/app/(protected)/dashboard/page.tsx`:
   - Welcome header: "Welcome back, [First Name]" in display font
   - Stats row: Exams Taken (this week), Average Score, Current Streak, Rank
   - "Continue Practicing" — last 2 certifications attempted
   - "Weak Areas" — top 3 topics needing work (from last exam AI analysis)
   - Weekly Leaderboard Preview — top 5 + user's rank
   - Subscription status banner (if trial remaining: "X days left in free trial")
3. Create `/apps/web/src/app/(protected)/courses/page.tsx`:
   - Same domain grid as landing page but authenticated version
   - Shows user progress per domain (% of certifications attempted)
   - Filter tabs: All, Priority, In Progress, Not Started
4. Create `/apps/web/src/app/(protected)/courses/[slug]/page.tsx`:
   - Domain header with icon
   - List of certifications as cards
   - Each cert card shows: name, question count, difficulty badge, user's best score (if attempted), attempt count today
   - CTA: "Start Exam" button (disabled if 3 attempts used today with tooltip)
5. Create React Query hooks:
   - `useDomains()` → GET /api/domains
   - `useCertification(slug)` → GET /api/certifications/:slug
   - `useDashboardStats()` → GET /api/users/me/stats
   - `useTodayAttempts(certId)` → GET /api/exams/attempts/today

**Expected Output:**
- Dashboard loads with real data from API
- Course hierarchy: Domains → Certifications navigable
- Attempt count enforced (3/day) — button disabled with tooltip when limit reached
- Subscription banner shows correctly for trial/expired/subscribed users

**File Targets:** `src/app/(protected)/layout.tsx`, `src/app/(protected)/dashboard/`, `src/app/(protected)/courses/`

→ **After this step: `/review` then `/qa`**

---

## [STEP 08] — Exam Session (Core — Most Critical Step)

**Context:**
Requires STEP 07 complete. This is the most complex component in the application. READ ALL ANTI-CHEAT REQUIREMENTS from PRD US-07 carefully before writing any code.

**Task:**
1. Create Exam API endpoints in `/apps/api/src/routes/exam.routes.ts`:
   - `POST /exams/start` — validates attempt limit (3/day), selects 40 random approved questions from pool, shuffles questions + options, creates `ExamAttempt` record, returns session token + shuffled questions
   - `POST /exams/:id/submit` — validates session token, calculates score per question, identifies weak topics, calls AI for recommendations (async), saves results
   - `GET /exams/:id/results` — returns full results + AI recommendations

2. Create `/apps/api/src/services/exam.service.ts`:
   - `getRandomQuestions(certId, count)` — random 40 from approved pool, no repeats within session
   - `shuffleOptions(question)` — Fisher-Yates shuffle on A/B/C/D, remaps correct answer
   - `calculateResults(answers, questions)` — score, weak topics grouped by topic field
   - `generateSessionToken(examId, userId)` — signed JWT with 35min expiry

3. Create `/apps/web/src/store/exam.store.ts` (Zustand):
   - State: `questions`, `currentIndex`, `answers`, `timeRemaining`, `status`, `flags`, `sessionToken`
   - Actions: `setAnswer()`, `flagQuestion()`, `nextQuestion()`, `prevQuestion()`, `pauseExam()`, `resumeExam()`, `submitExam()`
   - Persist answers to localStorage every 30s (network recovery)

4. Create `/apps/web/src/app/(protected)/exam/[id]/lobby/page.tsx`:
   - Exam rules listed clearly
   - Cert name, question count, time limit
   - Attempt counter: "Attempt 1 of 3 today"
   - Anti-cheat warning (tab switch = auto-submit)
   - "Enter Fullscreen & Start Exam" — single CTA
   - Clicking CTA: requests fullscreen API, then navigates to session page

5. Create `/apps/web/src/app/(protected)/exam/[id]/session/page.tsx` — THE EXAM INTERFACE:
   **Layout:**
   - Top bar: Xavier 300 logo (left), "Question X of 40" (center), countdown timer (right, JetBrains Mono)
   - Main: Question text (large, readable)
   - Options: A/B/C/D as clickable pill options (selected state = indigo fill)
   - Bottom bar: Previous, Flag (bookmark icon), Next, Progress bar
   - Flag panel: Slide-out drawer showing flagged questions

   **Timer:**
   - Countdown from 30:00 in JetBrains Mono
   - At 5:00 → turn red + pulse animation
   - At 0:00 → auto-submit

   **Anti-cheat (CRITICAL — implement ALL of these):**
   ```typescript
   // 1. Fullscreen enforcement
   document.addEventListener('fullscreenchange', handleFullscreenChange)
   // Exit fullscreen → warning modal (1st time), auto-submit (2nd time)

   // 2. Tab/window visibility
   document.addEventListener('visibilitychange', handleVisibilityChange)
   // Hidden → pause + warning (1st time), auto-submit (2nd time)

   // 3. Right-click disable
   document.addEventListener('contextmenu', e => e.preventDefault())

   // 4. Copy/paste disable
   document.addEventListener('copy', e => e.preventDefault())
   document.addEventListener('cut', e => e.preventDefault())

   // 5. Text selection disable (CSS)
   // user-select: none on exam container

   // 6. Keyboard shortcuts disable
   document.addEventListener('keydown', e => {
     if (e.ctrlKey && ['c','v','a','p','s'].includes(e.key)) e.preventDefault()
     if (e.key === 'F12') e.preventDefault()
   })

   // 7. Watermark overlay (user ID embedded)
   // Semi-transparent diagonal text overlay with userId

   // 8. Answer auto-save to localStorage every 30s
   ```

   **Network Handling:**
   ```typescript
   window.addEventListener('online', handleReconnect)
   window.addEventListener('offline', handleDisconnect)
   // Offline → pause timer + show "Connection Lost" overlay
   // Online → show "Reconnected — Resume?" modal
   ```

6. Anti-cheat warning modal component — clear, non-dismissible without acknowledging

**Expected Output:**
- Complete exam flow: lobby → fullscreen session → submit → results
- All 8 anti-cheat measures active
- Timer counts down correctly
- Network disconnect pauses exam and restores state
- Answers auto-saved to localStorage
- Questions and options are shuffled (never same order twice)

**File Targets:** `exam.routes.ts`, `exam.service.ts`, `exam.store.ts`, `exam/[id]/lobby/`, `exam/[id]/session/`

→ **After this step: `/review` then `/qa` then `/careful`**

---

## [STEP 09] — Exam Results & AI Recommendations

**Context:**
Requires STEP 08 complete. The results page is the highest-value touchpoint — this is where students learn and where the platform proves its worth.

**Task:**
1. Create `/apps/api/src/services/ai.service.ts`:
   ```typescript
   // generateRecommendations(weakTopics: string[], certName: string): Promise<Recommendation[]>
   // Uses Anthropic Claude API (claude-sonnet-4-20250514)
   // Returns array of: { topic, recommendation (specific text resource), priority }
   // Prompt from PRD Section 8
   // Parse JSON response safely — strip markdown fences before JSON.parse
   ```

2. Create `/apps/web/src/app/(protected)/exam/[id]/results/page.tsx`:
   **Layout:**
   - Score hero: Large score (e.g. "84%") in JetBrains Mono, animated count-up from 0 to final
   - Radial progress ring (SVG, animated, indigo stroke on cream track)
   - Stats row: Correct/Total, Time Taken, Speed (Q/min), Rank Change
   - Performance band badge: Excellent (≥85%), Good (70-84%), Needs Work (<70%)

   **Question Review Section:**
   - Expandable list of all questions
   - Green ✓ for correct, Red ✗ for wrong
   - Wrong answers show correct answer + explanation (from question model)
   - Weak topics summary: grouped by topic with percentage

   **AI Recommendations Section:**
   - Heading: "Your personalised study plan"
   - Card per weak topic with AI-generated specific resource recommendation
   - Rendered with a subtle indigo left border
   - Loading skeleton while AI generates (async after submit)

   **CTA Section:**
   - "Retake Exam" (if attempts remain today)
   - "Try Another Certification"
   - "View Leaderboard"

3. Update Zustand exam store to clear state after results are loaded

**Expected Output:**
- Score count-up animation smooth
- Radial ring animates on load
- AI recommendations appear within 5 seconds of page load
- Correct/wrong question breakdown accurate
- All CTAs navigate correctly

**File Targets:** `ai.service.ts`, `exam/[id]/results/page.tsx`

→ **After this step: `/review` then `/qa`**

---

## [STEP 10] — Leaderboard Page

**Context:**
Requires STEP 09 complete. Leaderboard is the retention gamification feature.

**Task:**
1. Create `/apps/api/src/routes/leaderboard.routes.ts`:
   - `GET /leaderboard/weekly` — top 20 by `avgScore` from `WeeklyScore`, include current user's rank even if outside top 20
   - `GET /leaderboard/previous` — previous week's top 3 (stored in separate table or archived)
2. Create `/apps/api/src/jobs/leaderboard.job.ts` (Bull queue):
   - Runs every Monday 00:00 WAT (Africa/Lagos timezone)
   - Archives top 3 of current week
   - Resets all `WeeklyScore` records for new week
3. Create `/apps/web/src/app/(protected)/leaderboard/page.tsx`:
   - Header: "Weekly Leaderboard" + "Resets in Xd Xh" countdown
   - Top 3 podium (gold/silver/bronze) — displayed prominently
   - Full ranked list (#4–#20) — table style
   - Current user row always visible (highlighted with indigo bg) — shows rank even if #150
   - User identity: First name + Last name initial (e.g. "Adaeze O.") — privacy by design
   - Stats columns: Rank, Name, Avg Score, Exams Taken This Week
   - Previous week's champions section below main board
   - Empty state for new week (Monday morning)

**Expected Output:**
- Leaderboard loads with real data
- Countdown to reset accurate (WAT timezone)
- Current user always visible regardless of rank
- Previous week's top 3 shown with trophy badges
- Reset job scheduled and tested

**File Targets:** `leaderboard.routes.ts`, `leaderboard.job.ts`, `leaderboard/page.tsx`

→ **After this step: `/review` then `/qa`**

---

## ⟳ CONTEXT REFRESH — After Step 10

```
You are building Xavier 300 — a Nigerian tech certification mock exam platform.

COMPLETED so far:
✅ STEP 01: Project scaffolding
✅ STEP 02: Design system
✅ STEP 03: Database schema
✅ STEP 04: Auth API
✅ STEP 05: Auth frontend
✅ STEP 06: Landing page
✅ STEP 07: Dashboard + course selection
✅ STEP 08: Exam session + anti-cheat (CRITICAL)
✅ STEP 09: Results + AI recommendations
✅ STEP 10: Leaderboard + weekly reset job

NEXT: STEP 11 — Paystack Payment & Subscription System

REMINDER — Key constraints:
- Payment: Paystack — Bank Transfer PRIORITY, card, USSD
- Hard lock on Day 8 of trial
- Plans: Monthly ₦5,000 | Annual ₦50,000
- Webhook verification is the source of truth for payment status
- Daily attempt limit: 3 per certification
- Anti-cheat: tab switch x2 = auto-submit (this is already built, do not regress)
```

---

## [STEP 11] — Payment & Subscription System

**Context:**
Requires STEP 10 complete. This is the #1 revenue system. Test thoroughly with Paystack test keys before touching live keys.

**Task:**
1. Create `/apps/api/src/services/payment.service.ts`:
   - `initiatePayment(userId, plan)` → calls Paystack API to create transaction, returns payment URL + reference
   - `verifyPayment(reference)` → calls Paystack verify endpoint, checks amount matches plan, updates user subscription
   - `handleWebhook(payload, signature)` → validates Paystack HMAC signature, processes `charge.success` event, updates subscription
   - `calculateSubscriptionEnd(plan)` → Monthly: +30 days, Annual: +365 days

2. Create `/apps/api/src/routes/payment.routes.ts`:
   - `POST /payments/initiate` (auth required) — create Paystack transaction
   - `POST /payments/verify` (auth required) — manual bank transfer verification trigger
   - `POST /payments/webhook` (NO auth — public, signature-validated) — Paystack webhook
   - `GET /payments/history` (auth required) — user's payment history

3. Create `/apps/web/src/app/(public)/pricing/page.tsx`:
   - Two pricing cards (Monthly + Annual) — glass card style
   - Feature list per plan
   - Annual card has "Most Popular" badge + "Save ₦10,000" callout
   - "Start Free Trial" CTA (no card required) for new users
   - CTA for existing expired users: "Resubscribe"
   - Paystack payment flow:
     - Select plan → click CTA → API initiates payment → redirect to Paystack hosted page OR inline modal
     - Bank Transfer: Show account details page + "I have paid" button → triggers manual verification
     - On success: redirect to `/dashboard` with success toast

4. Create subscription middleware check:
   ```typescript
   // Runs on every protected route
   // Checks: subscriptionStatus + subscriptionEndsAt + trialStartedAt
   // If trial expired (>7 days) + not subscribed → redirect to /pricing
   // If subscribed but expired → update status to EXPIRED + redirect to /pricing
   ```

5. Create subscription banner component (shown on dashboard when trial is active):
   - "X days remaining in your free trial" — warm amber background
   - CTA: "Upgrade Now"

**Expected Output:**
- Full payment flow works with Paystack TEST keys
- Bank transfer flow shows account details + manual verify
- Webhook correctly upgrades subscription on payment
- Hard lock works: Day 8+ with no payment → /pricing redirect
- Payment history visible to user

**File Targets:** `payment.service.ts`, `payment.routes.ts`, `pricing/page.tsx`

→ **After this step: `/review` then `/careful`**

---

## [STEP 12] — Question Management API (AI Generation + Teacher + Admin)

**Context:**
Requires STEP 11 complete. Three-source question engine — the content backbone of the platform.

**Task:**
1. Create `/apps/api/src/services/question.service.ts`:
   - `generateQuestionsWithAI(certId, topic, count, difficulty)`:
     - Calls Anthropic Claude API with prompt from PRD Section 8
     - Parses JSON response (strip markdown fences before parse)
     - Saves questions with `source: AI`, `status: PENDING_REVIEW`
     - Returns generated question count
   - `getApprovedQuestions(certId)` → returns only APPROVED questions for exam
   - `getRandomSample(questions, count)` → Fisher-Yates shuffle, take first N

2. Create `/apps/api/src/routes/question.routes.ts`:
   - `POST /questions` (Teacher/Admin) — submit question, validate with Zod
   - `GET /questions/my` (Teacher) — teacher's own submissions + status

3. Create `/apps/api/src/routes/admin.routes.ts`:
   - `GET /admin/questions` — all questions, filterable by domain/cert/status/source
   - `PATCH /admin/questions/:id` — approve / reject (with rejection note) / edit
   - `POST /admin/questions/generate` — trigger AI generation (body: certId, topic, count, difficulty)
   - `GET /admin/users` — all users with filters
   - `PATCH /admin/users/:id` — update subscription/role
   - `GET /admin/stats` — platform analytics
   - `GET /admin/tickets` — all support tickets
   - `PATCH /admin/tickets/:id` — respond + update status

**Expected Output:**
- AI question generation works (test with 5 questions for Data Analysis → Power BI)
- Teacher submission creates PENDING questions
- Admin can approve/reject and bulk-approve AI questions
- Only APPROVED questions appear in exam sessions

**File Targets:** `question.service.ts`, `question.routes.ts`, `admin.routes.ts`

→ **After this step: `/review`**

---

## [STEP 13] — Admin Dashboard (Frontend)

**Context:**
Requires STEP 12 complete. Admin panel is a separate layout with full content management capability.

**Task:**
1. Create `/apps/web/src/app/admin/layout.tsx`:
   - Sidebar with: Dashboard, Questions, Users, Tickets, Analytics
   - Admin role check — redirect non-admins to `/dashboard`
   - Distinct visual style — use `--bg-secondary` base (slightly darker than student dashboard)

2. Create `/apps/web/src/app/admin/page.tsx` — Admin Overview:
   - Stats cards: Total Users, Active Subscribers, Trial Users, Revenue (MTD)
   - Chart: Daily active users (last 30 days) — Recharts line chart
   - Chart: Exams taken per domain — Recharts bar chart
   - Question bank status: approved/pending/rejected count per domain

3. Create `/apps/web/src/app/admin/questions/page.tsx`:
   - Table: all questions with columns: Domain, Cert, Topic, Source badge (AI/Teacher/Admin), Status badge, Actions
   - Filters: Domain dropdown, Status tabs (All/Pending/Approved/Rejected), Source filter
   - Approve/Reject inline actions (single click with confirmation)
   - "Generate with AI" button → modal: select cert, topic, count (10/25/50), difficulty → calls API
   - Bulk approve: checkbox select + "Approve Selected" button

4. Create `/apps/web/src/app/admin/users/page.tsx`:
   - Table: users with name, email, subscription status badge, join date, exams taken, last active
   - Filter by: subscription status, date range
   - Actions: extend subscription, revoke subscription, change role
   - Export CSV button

5. Create `/apps/web/src/app/admin/tickets/page.tsx`:
   - Ticket list grouped by status (Open, In Progress, Resolved)
   - Click ticket → slide-out panel showing ticket details + response input
   - Admin responds → status updates → email sent to user

**Expected Output:**
- Admin can generate, review, and approve AI questions from the UI
- User management functional
- Stats display real data from API
- Ticket response system works end-to-end

**File Targets:** `src/app/admin/`

→ **After this step: `/review` then `/qa`**

---

## [STEP 14] — Teacher Dashboard (Frontend)

**Context:**
Requires STEP 13 complete. Teacher workflow is simpler than admin — add questions, track approval status.

**Task:**
1. Create `/apps/web/src/app/teacher/layout.tsx`:
   - Sidebar: Dashboard, Add Question, My Questions
   - Teacher role check

2. Create `/apps/web/src/app/teacher/page.tsx`:
   - Stats: Questions Submitted, Questions Approved, Questions Pending, Approval Rate %
   - Recent submissions table with status badges

3. Create `/apps/web/src/app/teacher/questions/new/page.tsx` — Add Question Form:
   - Step 1: Select Domain → Select Certification
   - Step 2: Select difficulty, enter topic tag
   - Step 3: Question text (textarea, min 20 chars)
   - Step 4: 4 answer options + select correct answer (radio)
   - Step 5: Explanation for correct answer
   - Live preview of question as it will appear in exam
   - Submit → success toast "Question submitted for review"

4. Create `/apps/web/src/app/teacher/questions/page.tsx`:
   - Table of all submitted questions
   - Status badge: Pending (amber), Approved (green), Rejected (red)
   - Rejected questions show rejection note from admin
   - Ability to edit and resubmit rejected questions

**Expected Output:**
- Teacher can submit complete questions with all fields
- Approval status visible and updated in real-time
- Rejected questions show admin's rejection reason

**File Targets:** `src/app/teacher/`

→ **After this step: `/review` then `/qa`**

---

## [STEP 15] — Notifications System

**Context:**
Requires STEP 14 complete. Daily practice reminders via Web Push + email fallback.

**Task:**
1. Create `/apps/api/src/services/notification.service.ts`:
   - `sendPushNotification(userId, title, body)` → Web Push via VAPID
   - `sendEmailNotification(email, subject, content)` → via Resend
   - `subscribeToPush(userId, subscription)` → save push subscription to DB (add `pushSubscription` JSON field to User model)

2. Create `/apps/api/src/jobs/notification.job.ts` (Bull):
   - Runs daily — for each user with `notificationsEnabled: true`:
     - Check if user has taken any exam today
     - If not → send push notification at their `notificationTime` (WAT)
     - If push fails → send email fallback
   - Cron: `0 9 * * *` (9 AM WAT default — but respect per-user `notificationTime`)

3. Create `/apps/web/src/lib/push.ts`:
   - `requestPushPermission()` → asks browser for notification permission
   - `subscribeToPush()` → registers service worker, creates push subscription, sends to API
   - `unsubscribeFromPush()` → removes subscription

4. Create `/apps/web/public/sw.js` — Service Worker:
   - Handles `push` events — shows notification with Xavier 300 branding
   - Notification click → opens `/dashboard`

5. Add notification preference to Profile settings page:
   - Toggle: Enable/Disable daily reminders
   - Time picker: preferred notification time
   - Update via `PATCH /api/users/me`

6. Add in-app notification bell to nav:
   - Shows badge if user hasn't practiced today
   - Click → shows dropdown: "Practice today to maintain your streak!"

**Expected Output:**
- Push notification permission requested on first login (after brief delay)
- Daily job sends notifications only to users who haven't practiced
- In-app bell shows/hides based on today's activity
- Email fallback works when push is declined

**File Targets:** `notification.service.ts`, `notification.job.ts`, `push.ts`, `public/sw.js`

→ **After this step: `/review`**

---

## ⟳ CONTEXT REFRESH — After Step 15

```
You are building Xavier 300 — a Nigerian tech certification mock exam platform.

COMPLETED so far:
✅ STEP 01–05: Foundation (project, design, DB, auth)
✅ STEP 06–07: Landing page, dashboard, courses
✅ STEP 08–10: Exam session (anti-cheat), results (AI), leaderboard
✅ STEP 11: Paystack payment + subscription hard lock
✅ STEP 12: Three-source question engine (AI + teacher + admin)
✅ STEP 13: Admin dashboard
✅ STEP 14: Teacher dashboard
✅ STEP 15: Daily notifications (push + email)

REMAINING: STEP 16 — Support Tickets | STEP 17 — Profile | STEP 18 — QA & Polish | STEP 19 — Seed & Deploy
```

---

## [STEP 16] — Support Ticket System

**Context:**
Requires STEP 15 complete.

**Task:**
1. Create `/apps/web/src/app/(protected)/support/page.tsx`:
   - List of user's open and resolved tickets
   - "New Ticket" button

2. Create `/apps/web/src/app/(protected)/support/new/page.tsx`:
   - Form: Issue Type (dropdown: Payment, Access, Exam Bug, Account, Other), Subject, Description (textarea, 1000 char limit with counter)
   - Submit → API creates ticket + sends confirmation email with ticket ID

3. Create `/apps/web/src/app/(protected)/support/[ticketId]/page.tsx`:
   - Ticket details: type, subject, created date, status badge
   - Message thread: user message + admin responses (styled like chat)
   - Status timeline

4. Email templates (via Resend):
   - `ticket-created.tsx` — "Your ticket #XXXX has been received"
   - `ticket-updated.tsx` — "Admin has responded to your ticket #XXXX"

**Expected Output:**
- Full ticket lifecycle: create → admin responds → user sees response → resolved
- Email notifications sent at each stage
- Ticket history paginated

→ **After this step: `/review` then `/qa`**

---

## [STEP 17] — User Profile Page

**Context:**
Requires STEP 16 complete.

**Task:**
1. Create `/apps/web/src/app/(protected)/profile/page.tsx`:
   - Profile header: Avatar (initials-based, no upload needed for v1), Full Name, Email, Member since
   - Subscription status card: Plan, expiry date, "Upgrade/Renew" CTA
   - Edit profile section: Name, Phone, State, Occupation, Experience (all editable)
   - Notification preferences: toggle + time picker
   - Exam history: table of all past attempts with cert name, date, score, time taken
   - Change password section
   - Account deletion request (opens support ticket of type ACCOUNT)

**Expected Output:**
- All profile fields editable and saved via API
- Subscription status accurate
- Full exam history paginated
- Password change works with current password verification

→ **After this step: `/review` then `/qa`**

---

## [STEP 18] — QA, Polish & Performance Pass

**Context:**
Requires ALL previous steps complete. This is the full QA and polish pass before final deployment setup.

**Task:**
1. **Cross-browser testing checklist:**
   - Test all exam flows on Chrome, Firefox, Safari, Edge
   - Verify anti-cheat works differently per browser (fullscreen API varies)
   - Test on mobile (Chrome iOS, Safari iOS, Chrome Android)

2. **Dark mode audit:**
   - Every page must look correct in dark mode
   - No hardcoded colours — all via CSS variables
   - Fix any `text-gray-*` or `bg-white` that aren't using tokens

3. **Performance audit:**
   - Run Lighthouse on landing page → fix any issues scoring < 85
   - Lazy load domain grid images/icons
   - Add `loading="lazy"` to below-fold content
   - Ensure exam page has no layout shift (CLS = 0)

4. **Error handling audit:**
   - Every API call has a loading state, error state, and empty state
   - All forms show field-level errors
   - Network error on exam → graceful pause (already built, verify still works)
   - Expired token → silent refresh → retry

5. **Security audit:**
   - All admin/teacher routes have role checks
   - Exam submit endpoint validates session token
   - Paystack webhook validates HMAC signature
   - Rate limiting active on auth routes
   - No sensitive data in client-side logs

6. **Accessibility audit:**
   - All form inputs have labels
   - Exam options have `role="radio"` and keyboard navigation
   - Score results have `aria-live` for screen readers
   - Colour contrast ≥ 4.5:1 in both themes

7. **Mobile polish:**
   - Dashboard stats scroll horizontally on small screens
   - Exam interface legible on 375px width
   - Bottom tab nav works on iOS (safe area insets)

8. **Add Sentry error monitoring:**
   ```bash
   npm install @sentry/nextjs @sentry/node
   ```
   Configure for both web and API

→ **After this step: `/review` then `/qa`**

---

## [STEP 19] — Database Seeding & Question Bank Population

**Context:**
Requires STEP 18 complete. Before launch, the question bank needs minimum 200 approved questions per certification.

**Task:**
1. Create `/packages/db/seed-questions.ts`:
   - For each certification, call the AI question generation service
   - Generate 50 questions per difficulty level (Easy/Medium/Hard) per key topic
   - Auto-approve all seeded questions (source: AI, status: APPROVED)
   - Target: minimum 200 approved questions per certification × 9 domains

2. Topic lists per certification to seed:
   ```typescript
   const TOPICS = {
     'power-bi': ['DAX Functions', 'Data Modelling', 'Visualisations', 'Power Query', 'Row-Level Security', 'Deployment'],
     'data-analysis': ['Statistical Analysis', 'Data Cleaning', 'Excel Functions', 'Pivot Tables', 'Data Visualisation', 'SQL Basics'],
     'cybersecurity': ['Network Security', 'Cryptography', 'Ethical Hacking', 'Incident Response', 'Compliance', 'Cloud Security'],
     // ... all 9 domains
   }
   ```

3. Run seed in batches (avoid API rate limits — 2 second delay between batches)

4. Verify: `npx prisma studio` → Questions table → filter by status APPROVED → confirm counts

→ **After this step: `/review`**

---

## [STEP 20] — Production Deployment

**Context:**
Requires STEP 19 complete. Final deployment to Vercel (frontend) + Railway (API + DB + Redis).

**Task:**
1. **Railway Setup:**
   - Create Railway project
   - Add PostgreSQL service → get `DATABASE_URL`
   - Add Redis service → get `REDIS_URL`
   - Deploy API service from `/apps/api` → get API URL
   - Set all environment variables from `.env.example`

2. **Vercel Setup:**
   - Connect GitHub repo to Vercel
   - Set root directory to `/apps/web`
   - Set all `NEXT_PUBLIC_*` environment variables + server-side env vars
   - Deploy → get production URL

3. **Domain Configuration:**
   - Add custom domain (e.g. `xavier300.com.ng`) to Vercel
   - Update `CORS` in API to allow production domain

4. **Paystack Live Keys:**
   - Switch from test to live Paystack keys
   - Register webhook URL in Paystack dashboard: `https://api.xavier300.com.ng/api/payments/webhook`

5. **Final environment checklist:**
   - [ ] DATABASE_URL (live Railway PostgreSQL)
   - [ ] REDIS_URL (live Railway Redis)
   - [ ] JWT_SECRET (strong random string, min 64 chars)
   - [ ] JWT_REFRESH_SECRET (different strong random string)
   - [ ] PAYSTACK_SECRET_KEY (live key)
   - [ ] PAYSTACK_PUBLIC_KEY (live key)
   - [ ] ANTHROPIC_API_KEY (live key)
   - [ ] RESEND_API_KEY (live key)
   - [ ] VAPID keys generated and set

6. **Post-deploy smoke test:**
   - Sign up with real email → receive OTP ✓
   - Complete free trial → see pricing page on Day 8 ✓
   - Make test payment (₦100 test) → subscription activates ✓
   - Take exam → anti-cheat fires on tab switch ✓
   - Complete exam → AI recommendations appear ✓
   - Leaderboard populates ✓
   - Admin: generate questions → approve → appear in exam ✓

7. Commit: `git commit -m "feat: production deployment configuration"`
   Tag: `git tag v1.0.0`

→ **After this step: `/ship` then `/land-and-deploy` then `/document-release`**

---

## Summary — Build Sequence

| Step | Feature | Gate |
|---|---|---|
| 01 | Project scaffolding | `/review` |
| 02 | Design system | `/review` `/qa` |
| 03 | Database schema | `/review` |
| 04 | Auth API | `/review` `/careful` |
| 05 | Auth frontend | `/review` `/qa` |
| 06 | Landing page | `/review` `/qa` |
| 07 | Dashboard + courses | `/review` `/qa` |
| 08 | **Exam session (CRITICAL)** | `/review` `/qa` `/careful` |
| 09 | Results + AI recs | `/review` `/qa` |
| 10 | Leaderboard | `/review` `/qa` |
| 11 | Payments (Paystack) | `/review` `/careful` |
| 12 | Question engine | `/review` |
| 13 | Admin dashboard | `/review` `/qa` |
| 14 | Teacher dashboard | `/review` `/qa` |
| 15 | Notifications | `/review` |
| 16 | Support tickets | `/review` `/qa` |
| 17 | Profile page | `/review` `/qa` |
| 18 | QA & polish pass | `/review` `/qa` |
| 19 | Question seeding | `/review` |
| 20 | Production deploy | `/ship` `/land-and-deploy` |

---

*PROMPT_PACK.md v1.0 — Xavier 300 | Ready for execution by Antigravity/Codex or Claude Code/Gemini*
