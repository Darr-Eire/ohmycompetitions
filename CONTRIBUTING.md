# 🤝 Contributing to OhMyCompetitions (OMC)

First off — **thank you** for considering a contribution!  
OMC is built by **Pioneers** for the **Pi Network** community. We value clear code, safety, and fast iteration.

---

## 📌 TL;DR (Fast Path)
1) **Fork** this repo → **Clone** your fork
```bash
git clone https://github.com/<your-username>/ohmycompetitions.git
cd ohmycompetitions
```
2) **Create a branch**
```bash
git checkout -b feat/awesome-idea
```
3) **Install & run**
```bash
npm install
cp .env.example .env.local    # create your local env
npm run dev                   # http://localhost:3000
```
4) **Commit & push**
```bash
git add -A
git commit -m "feat: add XP leaderboard widget"
git push origin feat/awesome-idea
```
5) **Open a Pull Request** to `main`  

> Note: This repo requires merging via PRs (branch protection).

---

## 🧱 Project Setup

### Prerequisites
- Node.js 18+ and npm 9+
- MongoDB Atlas connection (URI in `.env.local`)
- (Optional) Vercel account for previews

### Environment Variables
Create **`.env.local`** at the project root (never commit real secrets):
```env
# Mongo
MONGODB_URI="your_mongo_uri"
MONGODB_DB="ohmycompetitions"
# Backward-compat aliases supported by code (optional):
MONGO_DB_URL=""
MONGO_DB_URI=""

# Admin header auth (used by /api/admin/*)
ADMIN_USER="OhMyAdmin"
ADMIN_PASS="change-this"

# Pi Network
PI_API_SECRET_KEY="your_pi_api_key"
NEXT_PUBLIC_PI_APP_ID="your.pi.app.id"
NEXT_PUBLIC_PI_ENV="production"   # or "sandbox"
```

### Start Dev Server
```bash
npm install
npm run dev
# open http://localhost:3000
```

---

## 🌳 Branches & Naming
Use **short, clear** prefixes:
- `feat/<name>` – new features (e.g., `feat/gift-ticket-page`)
- `fix/<name>` – bug fixes
- `docs/<name>` – documentation
- `chore/<name>` – tooling or misc
- `refactor/<name>` – internal code changes without new features

---

## 📝 Commit Style (Conventional Commits)
Keep commits small and descriptive. Examples:
- `feat: add gift-ticket client page`
- `fix(api): handle missing transaction identifier`
- `docs: update README screenshots section`
- `refactor(db): centralize dbConnect exports`
- `chore: add lint script`

Prefix with scope when useful: `fix(auth):`, `feat(admin):`, etc.

---

## 🧑‍💻 Code Guidelines
- **Safety first:** never hardcode secrets; always use env vars.
- **Database:** import the shared connector and reuse it.
  ```js
  import { dbConnect } from 'lib/dbConnect'; // named export
  await dbConnect();
  ```
- **API routes:** validate all inputs; return proper status codes (400, 401/403, 404, 429, 500).
- **Admin routes:** use `requireAdmin(req)` (sends `x-admin-user` / `x-admin-pass` headers).
- **Async/await:** prefer over callbacks; handle errors with try/catch.
- **Frontend:** keep UI consistent (Tailwind, accessible labels); avoid blocking SSR for pages that should be client-only (use `'use client'`).
- **Imports:** project uses `src/` with baseUrl alias; prefer `import X from 'lib/x'` over long relative paths.
- **Rate limiting:** when adding sensitive endpoints, include basic throttling or note where it’s enforced.
- **Logs:** helpful but not noisy; never log secrets or full tokens.

---

## 🧪 Running & Testing
- Dev server: `npm run dev`
- Build locally: `npm run build`
- Start production build: `npm start`
- (If present) Lint: `npm run lint`

> Manual checks: verify pages like `/gift-ticket`, `/admin/*`, and API routes you touched. Ensure Pi-related flows work in **Pi Browser** if applicable.

---

## 🔐 Security
- Do **not** commit any credentials or tokens.
- If you suspect a secret is exposed, **rotate it immediately** and update envs.
- Use HTTP headers for admin (never put admin creds in URLs or client state beyond localStorage for the guard).

---

## ✅ Pull Request Checklist
Before opening your PR:
- [ ] PR title uses Conventional Commits style
- [ ] Build passes locally (`npm run build`)
- [ ] No secrets in code or `.env.local`
- [ ] Updated docs (README/CONTRIBUTING) if behavior changes
- [ ] Added helpful console/error messages where appropriate
- [ ] For UI changes, attached screenshots or short description

**After opening PR:**
- Request a review
- Ensure Vercel preview deploy passes
- Address comments promptly

---

## 🧭 Issue Reports
Include:
- What happened vs. expected
- Repro steps
- Logs or screenshots
- Environment (browser, OS, Node version)

Feature requests welcome — describe the problem, proposed solution, and alternatives.

---

## 🤝 Community & Conduct
Be respectful and collaborative. We’re building a welcoming hub for Pioneers.  
Harassment, hate speech, and spam are not tolerated.

---

## 📬 Contact
- Open a **GitHub Issue** for bugs/requests
- Tag **@Darr-Eire** in PRs/discussions for review

---

💜 **Built by Pioneers. For Pioneers.**
