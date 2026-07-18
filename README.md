# JobHunter-Frontend
A modern, AI-powered job application tracker built with vanilla HTML, CSS, and JavaScript. Track applications, parse emails with AI, and visualize your job hunt — all from a single dashboard.

**Live Demo:** [job-hunter-frontend-mu.vercel.app](https://job-hunter-frontend-mu.vercel.app)

---

## Features

### Authentication
- **Email/Password Login & Signup** with client-side and server-side validation
- **Google OAuth** and **GitHub OAuth** — one-click sign in
- **Forgot Password** — email-based reset link with token validation
- **Session Management** — auto-redirect to dashboard if logged in, auto-redirect to login if session expires

### Dashboard
- **4 Stat Cards** — Total Applications, Interviews (with active count + rate), Offers (with conversion %), Active Pipeline
- **Applications by Status** — Interactive doughnut chart (Applied, Interview, Offer, Rejected)
- **Monthly Applications** — Bar chart showing last 6 months of activity
- **Interview Progress** — Doughnut chart comparing interviewed vs. not interviewed
- Charts **auto-adapt to dark/light mode** via `MutationObserver`

### Applications Management
- **Full CRUD** — Add, edit, delete job applications via modal forms
- **Search** — Real-time debounced search across company and role fields
- **Filter by Status** — Dropdown filter (All, Applied, Interview, Offer, Rejected)
- **Progress Steps** — Visual 4-step progress indicator per application (Applied → Interview → Offer → Done)
- **Status Badges** — Color-coded pill badges for each status
- **AI Badge** — Applications parsed from email show an "AI" indicator
- **Auto-refresh** — Data refreshes every 30 seconds (only when tab is visible)
- **Export as JSON** — Download all applications with one click

### Gmail AI Integration
- **Connect Gmail** — OAuth-based Gmail linking to sync emails automatically
- **Sync Emails** — One-click fetch and AI-parse recent job-related emails
- **Manual Email Paste** — Paste Subject, From, and Body for AI parsing
- Shows connected email, last sync time, duplicate skip counts
- **AI Parser** extracts company, role, and status from email content

### UI/UX
- **Dark Mode** — Full dark theme with smooth transitions, respects OS preference, persisted in localStorage
- **Responsive Design** — Mobile-first with breakpoints at 480px, 580px, 700px, 768px, 850px, 1100px
- **Mobile Navigation** — Hamburger menu with animated icon (3 bars ↔ X)
- **Loading Overlay** — Fullscreen spinner with custom messages during async operations
- **Profile Dropdown** — User avatar, name, email, profile link, sign out
- **Form Validation** — Inline error messages with `aria-live` for accessibility
- **XSS Protection** — All user-supplied data escaped before rendering

---

## Pages

| Page | Path | Description |
|------|------|-------------|
| Home | `Homepage/home.html` | Marketing landing page with feature showcase |
| Login | `Homepage/login.html` | Email/password + OAuth login |
| Signup | `Homepage/signup.html` | Account registration + OAuth |
| Forgot Password | `Homepage/forgot-password.html` | Request password reset link |
| Reset Password | `Homepage/reset-password.html` | Set new password via token |
| Dashboard | `dashboard/dashboard.html` | Stats, charts, Gmail sync, email paste |
| Applications | `dashboard/applications.html` | Full CRUD table/cards for job applications |
| Profile | `dashboard/profile.html` | Edit name and email |

---

## Tech Stack

- **HTML5, CSS3, Vanilla JavaScript** — No frameworks, no build tools
- **Chart.js 4.4.0** (CDN) — Interactive charts on the dashboard
- **Backend:** [Node.js + Express API](https://github.com/Mildhaash/JobHunter-backend) hosted on Vercel
- **Database:** MongoDB Atlas
- **Auth:** Passport.js (Google OAuth 2.0, GitHub OAuth) + bcrypt

---

## Project Structure

frontend/
├── index.html                    # Redirects to home.html
├── shared/
│   └── loading.js                # Global loading overlay component
├── Homepage/
│   ├── home.html                 # Landing page
│   ├── login.html                # Login page
│   ├── signup.html               # Signup page
│   ├── forgot-password.html      # Forgot password page
│   ├── reset-password.html       # Reset password page
│   ├── homepage.css              # Homepage styles + design tokens
│   ├── theme.js                  # Dark/light theme toggle
│   ├── auth.js                   # Login, signup, OAuth logic
│   ├── forgotPassword.js         # Forgot password handler
│   └── resetPassword.js          # Reset password handler
└── dashboard/
    ├── dashboard.html            # Main dashboard
    ├── applications.html         # Applications CRUD page
    ├── profile.html              # Profile edit page
    ├── dashboard.css             # Dashboard styles + design tokens
    ├── dashboard.js              # Charts, stats, Gmail sync
    ├── applications.js           # CRUD, search, filter, modal logic
    ├── profile.js                # Profile load/save logic
    ├── nav.js                    # Dynamic navigation header
    └── data.js                   # Central API client (DataStore)

---

## Design System

### Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-bg` | `#F2F0EA` | `#1B1916` | Page background |
| `--color-surface` | `#FFFFFF` | `#242220` | Card background |
| `--color-text` | `#2E2A24` | `#F2F0EA` | Primary text |
| `--color-accent` | `#A5856F` | `#C9A581` | Brand / primary CTA |
| `--color-blue` | `#A0D4E0` | `#8FC2D1` | Info / applied status |
| `--color-green` | `#8FBF8A` | `#8FBF8A` | Success / offer status |
| `--color-red` | `#C77B6E` | `#D99C90` | Danger / rejected status |

### Typography
- **Display font:** Inter / Montserrat / system-ui (headings, buttons, brand)
- **Body font:** Roboto / Open Sans / system-ui (text, inputs)

### Border Radius
- `--radius-sm`: 6px (buttons, inputs)
- `--radius-md`: 12px (cards, modals)
- `--radius-lg`: 18px (auth cards, feature cards)

---

## API Endpoints

The frontend communicates with the backend via these endpoints:

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/logout` | End session |
| GET | `/api/auth/session` | Validate session |
| POST | `/api/auth/forgot-password` | Request reset link |
| GET | `/api/auth/reset-password/:token` | Validate reset token |
| POST | `/api/auth/reset-password/:token` | Submit new password |
| GET | `/auth/google` | Google OAuth redirect |
| GET | `/auth/github` | GitHub OAuth redirect |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications` | List all |
| GET | `/api/applications/:id` | Get one |
| POST | `/api/applications` | Create |
| PUT | `/api/applications/:id` | Update |
| DELETE | `/api/applications/:id` | Delete |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get profile |
| PUT | `/api/profile` | Update profile |

### Gmail / AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gmail/status` | Connection status |
| GET | `/api/gmail/auth` | Get Gmail OAuth URL |
| POST | `/api/gmail/sync` | Sync and parse emails |
| POST | `/api/gmail/parse` | AI-parse pasted email |

---

## Getting Started

### Prerequisites
- A running [JobHunter Backend](https://github.com/Mildhaash/JobHunter-backend) instance

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/Mildhaash/JobHunter-Frontend.git
   cd JobHunter-Frontend
2. Serve the frontend with any static file server
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8080
3. Open http://localhost:8080 in your browser
Note: The API base URL auto-detects localhost. When running locally, API calls go to http://localhost:3000. In production, they go to the Vercel-hosted backend.
Deployment
This is a static site — deploy to any static hosting platform:
Vercel
1. Import the GitHub repository
2. Set Framework Preset to Other
3. Set Output Directory to . (root)
4. Deploy
GitHub Pages
1. Push to a gh-pages branch
2. Enable GitHub Pages in repository settings
Netlify / Cloudflare Pages
1. Connect the repository
2. Set build command to empty
3. Set publish directory to .
Browser Support
- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome for Android)
License
ISC

