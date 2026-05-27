# DESIGN.md — Xavier 300
## Tech Certification Practice Platform

---

## 1. Brand Identity

### Name
**Xavier 300** — The "300" evokes the Spartan 300: disciplined, elite, prepared for battle. Your certification exam IS your battle. This platform makes you ready.

### Tagline
> *"Practice like it's real. Pass like you prepared."*

### Logo Mark
- Geometric abstract **X** — derived from the Elder Futhark *Gebo* rune (ᚷ) geometry
- Two intersecting diagonal strokes with angular notches cut at each terminal — giving it a carved, nordic artifact quality
- Works in single color (obsidian on cream / cream on obsidian)
- Minimum size: 24px
- Clear space: 1x logo height on all sides

---

## 2. Color System

### Philosophy
Warm Minimal — off-white and cream as the dominant canvas, deep indigo as the authority accent, obsidian for text. Feels globally premium but has warmth that resonates with Nigerian users. Not cold, not corporate — confident and welcoming.

### Light Mode Palette

```css
:root {
  /* Backgrounds */
  --bg-primary:      #F5F2EC;   /* warm cream — main canvas */
  --bg-secondary:    #EDEAE2;   /* warm off-white — card backgrounds */
  --bg-glass:        rgba(245, 242, 236, 0.72); /* glassmorphism surface */
  --bg-elevated:     #FFFFFF;   /* modals, dropdowns */

  /* Text */
  --text-primary:    #1A1A18;   /* near-obsidian — headlines */
  --text-secondary:  #4A4A42;   /* warm dark grey — body */
  --text-muted:      #8A8A7E;   /* captions, labels */
  --text-inverse:    #F5F2EC;   /* on dark surfaces */

  /* Accent — Indigo Authority */
  --accent-primary:  #3730A3;   /* deep indigo */
  --accent-hover:    #2E27A0;   /* darker indigo on hover */
  --accent-light:    #EEF2FF;   /* indigo tint for badges, highlights */
  --accent-glow:     rgba(55, 48, 163, 0.15); /* soft glow for focus states */

  /* Semantic */
  --success:         #16A34A;   /* correct answers */
  --success-light:   #DCFCE7;
  --error:           #DC2626;   /* wrong answers */
  --error-light:     #FEE2E2;
  --warning:         #D97706;   /* timer warnings */
  --warning-light:   #FEF3C7;
  --info:            #0284C7;

  /* Borders */
  --border-subtle:   rgba(26, 26, 24, 0.08);
  --border-medium:   rgba(26, 26, 24, 0.16);
  --border-strong:   rgba(26, 26, 24, 0.32);

  /* Shadows */
  --shadow-sm:       0 1px 3px rgba(26,26,24,0.08), 0 1px 2px rgba(26,26,24,0.06);
  --shadow-md:       0 4px 16px rgba(26,26,24,0.10), 0 2px 6px rgba(26,26,24,0.06);
  --shadow-lg:       0 16px 48px rgba(26,26,24,0.12), 0 4px 16px rgba(26,26,24,0.08);
  --shadow-glass:    0 8px 32px rgba(26,26,24,0.08), inset 0 1px 0 rgba(255,255,255,0.6);
}
```

### Dark Mode Palette

```css
[data-theme="dark"] {
  --bg-primary:      #111110;   /* near-black warm */
  --bg-secondary:    #1C1C1A;   /* card backgrounds */
  --bg-glass:        rgba(28, 28, 26, 0.72);
  --bg-elevated:     #252523;

  --text-primary:    #F0EDE6;   /* warm white */
  --text-secondary:  #B8B5AD;
  --text-muted:      #6B6860;
  --text-inverse:    #1A1A18;

  --accent-primary:  #6366F1;   /* lighter indigo for dark bg */
  --accent-hover:    #7C7FF5;
  --accent-light:    #1E1B4B;
  --accent-glow:     rgba(99, 102, 241, 0.20);

  --border-subtle:   rgba(240, 237, 230, 0.06);
  --border-medium:   rgba(240, 237, 230, 0.12);
  --border-strong:   rgba(240, 237, 230, 0.24);

  --shadow-sm:       0 1px 3px rgba(0,0,0,0.3);
  --shadow-md:       0 4px 16px rgba(0,0,0,0.4);
  --shadow-lg:       0 16px 48px rgba(0,0,0,0.5);
  --shadow-glass:    0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
}
```

---

## 3. Typography

### Font Stack

```css
/* Display — Editorial weight for hero headlines */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap');

/* UI — Clean, readable, slightly warm */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

/* Mono — Timer, scores, code */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');

:root {
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-ui:      'DM Sans', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
}
```

### Type Scale

| Token | Size | Weight | Font | Usage |
|---|---|---|---|---|
| `--text-hero` | 80–96px | 700 | Display | Landing hero "Xavier 300" |
| `--text-display` | 48–64px | 600 | Display | Section headers |
| `--text-title` | 32px | 600 | UI | Page titles |
| `--text-heading` | 24px | 600 | UI | Card headers |
| `--text-subheading` | 18px | 500 | UI | Sub-sections |
| `--text-body` | 16px | 400 | UI | Body copy |
| `--text-small` | 14px | 400 | UI | Labels, captions |
| `--text-micro` | 12px | 500 | UI | Badges, tags |
| `--text-timer` | 48px | 600 | Mono | Exam timer |
| `--text-score` | 64px | 600 | Mono | Score display |

---

## 4. Component System

### 4.1 Navigation
- **Desktop:** Floating pill nav centered — `Menu` pill + `Discover Courses` pill (like reference)
- **Right CTA:** Pill button — "Start Free Trial" or user avatar when logged in
- **Logo:** Top-left, X mark + "Xavier 300" wordmark
- **Scroll behaviour:** Nav gains `backdrop-blur` + subtle border on scroll
- **Mobile:** Hamburger → full-screen overlay menu

### 4.2 Cards — Course Cards
```
┌─────────────────────────────┐
│  [blur glass surface]       │
│                             │
│  ✦  [icon mark]             │
│                             │
│  DATA ANALYSIS              │
│  6 Certifications           │
│                             │
│  ████████░░  60% mastered   │
└─────────────────────────────┘
```
- Background: `--bg-glass` with `backdrop-filter: blur(20px)`
- Border: `1px solid var(--border-subtle)`
- Border-radius: `20px`
- Hover: translate Y -4px, shadow intensifies, border brightens
- Icon: abstract geometric mark per course (not emoji)

### 4.3 Buttons

```css
/* Primary */
.btn-primary {
  background: var(--accent-primary);
  color: var(--text-inverse);
  border-radius: 100px;        /* pill */
  padding: 14px 28px;
  font: 500 15px var(--font-ui);
  letter-spacing: 0.01em;
  transition: all 0.2s ease;
}

/* Secondary / Outline */
.btn-secondary {
  background: transparent;
  border: 1px solid var(--border-medium);
  color: var(--text-primary);
  border-radius: 100px;
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}
```

### 4.4 Exam Interface — Special Component
This is the most critical UI component. Strict, focused, no distractions.

```
┌──────────────────────────────────────────────────────┐
│  Xavier 300           Question 12/40      [29:14] 🔴 │
│──────────────────────────────────────────────────────│
│                                                      │
│  In Power BI, which function is used to...           │
│                                                      │
│  ○  A. CALCULATE()                                   │
│  ○  B. SUMX()                                        │
│  ○  C. FILTER()                                      │
│  ○  D. RELATED()                                     │
│                                                      │
│  [← Previous]              [Flag]    [Next →]        │
│                                                      │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░  12/40                │
└──────────────────────────────────────────────────────┘
```

### 4.5 Leaderboard Card
```
┌──────────────────────────────┐
│  🏆 Weekly Leaderboard       │
│  Resets in 3d 14h            │
│──────────────────────────────│
│  #1  Adaeze O.    98% ●●●●● │
│  #2  Emeka T.     96% ●●●●○ │
│  #3  YOU          94% ●●●●○ │
│  #4  Chioma A.    91% ●●●●○ │
└──────────────────────────────┘
```

### 4.6 Result Screen
- Large score in mono font (e.g. `84%`)
- Speed badge
- Radial progress ring
- AI recommendation cards below — per weak topic
- CTA: "Retake" or "Try Another Cert"

---

## 5. Spacing & Layout

```css
:root {
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   24px;
  --space-6:   32px;
  --space-7:   48px;
  --space-8:   64px;
  --space-9:   96px;
  --space-10:  128px;

  --radius-sm:  8px;
  --radius-md:  16px;
  --radius-lg:  24px;
  --radius-xl:  32px;
  --radius-pill: 100px;

  --max-width:  1280px;
  --content-width: 960px;
  --exam-width: 800px;
}
```

---

## 6. Motion & Animation

```css
:root {
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);

  --duration-fast:   150ms;
  --duration-base:   250ms;
  --duration-slow:   400ms;
  --duration-enter:  600ms;
}
```

- **Page load:** Staggered fade-up for hero elements (0ms → 100ms → 200ms)
- **Cards:** Hover lift with shadow bloom
- **Timer:** Pulse animation when under 5 minutes
- **Score reveal:** Count-up animation on result screen
- **Theme toggle:** Smooth 300ms colour transition
- **Correct answer:** Green flash + subtle scale-up
- **Wrong answer:** Red shake animation (subtle, not aggressive)

---

## 7. Icon System
- Library: **Lucide React** (consistent, clean, modern)
- Course icons: Custom geometric SVG marks (not generic emojis)
- Size tokens: 16px (inline), 20px (UI), 24px (feature), 32px (card), 48px (hero)

---

## 8. Screen Inventory

| Screen | Route | Auth Required |
|---|---|---|
| Landing / Home | `/` | No |
| Login | `/login` | No |
| Sign Up | `/signup` | No |
| Email Verification | `/verify` | No |
| Subscription / Pricing | `/pricing` | No |
| Dashboard | `/dashboard` | Yes |
| Course List | `/courses` | Yes |
| Certification List | `/courses/[slug]` | Yes |
| Exam Lobby | `/exam/[id]/lobby` | Yes + Subscribed |
| Exam Session | `/exam/[id]/session` | Yes + Subscribed |
| Exam Results | `/exam/[id]/results` | Yes |
| Leaderboard | `/leaderboard` | Yes |
| Profile | `/profile` | Yes |
| Payment | `/payment` | Yes |
| Support Tickets | `/support` | Yes |
| Admin — Dashboard | `/admin` | Admin |
| Admin — Questions | `/admin/questions` | Admin |
| Admin — Users | `/admin/users` | Admin |
| Admin — Approvals | `/admin/approvals` | Admin |
| Admin — Tickets | `/admin/tickets` | Admin |
| Teacher — Dashboard | `/teacher` | Teacher |
| Teacher — Add Questions | `/teacher/questions/new` | Teacher |

---

## 9. Responsive Breakpoints

```css
/* Mobile first */
--screen-sm:  640px;
--screen-md:  768px;
--screen-lg:  1024px;
--screen-xl:  1280px;
--screen-2xl: 1536px;
```

Desktop is primary. Mobile is fully functional but simplified layout.

---

## 10. Dark Mode Implementation

```js
// Theme stored in localStorage + system preference fallback
const theme = localStorage.getItem('xavier-theme')
  ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

document.documentElement.setAttribute('data-theme', theme);
```

Toggle: Pill switch in top-right nav. Sun/Moon icons from Lucide.

---

*DESIGN.md v1.0 — Xavier 300 | Locked for PRD and Prompt Pack Generation*
