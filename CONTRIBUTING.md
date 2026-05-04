<div align="center">

# 🤝 Contributing to Axon Mail

**First off — thank you for taking the time to contribute!** 🎉

Whether you're fixing a typo, squashing a bug, or building a new feature, every contribution helps make Axon Mail better. This document walks you through everything you need to know before opening your first Pull Request.

</div>

---

## 📖 Table of Contents

1. [Code of Conduct](#-code-of-conduct)
2. [How Can I Contribute?](#-how-can-i-contribute)
3. [Before You Start — Read This!](#-before-you-start--read-this)
4. [Development Setup](#-development-setup)
5. [Project Architecture (Quick Primer)](#-project-architecture-quick-primer)
6. [Branch Naming Convention](#-branch-naming-convention)
7. [Commit Message Format](#-commit-message-format)
8. [Pull Request Process](#-pull-request-process)
9. [Code Style Guide](#-code-style-guide)
10. [Testing Your Changes](#-testing-your-changes)
11. [Reporting Bugs](#-reporting-bugs)
12. [Suggesting Features](#-suggesting-features)
13. [Good First Issues](#-good-first-issues)

---

## 📜 Code of Conduct

By participating in this project you agree to be respectful, inclusive, and constructive in all interactions. We have zero tolerance for harassment, discrimination, or hostile behaviour. 

Be kind. Be patient. Help others learn.

---

## 🙋 How Can I Contribute?

There are many ways to help, beyond just writing code:

| Type | Examples |
| :--- | :--- |
| 🐛 **Bug Fixes** | Fix a broken UI component, resolve a state management bug |
| ✨ **New Features** | Add a Drafts folder, email threading, keyboard shortcuts |
| 📄 **Documentation** | Improve README, add JSDoc comments, write guides |
| 🧪 **Tests** | Write unit tests for the Zustand store or utility functions |
| 🎨 **UI/UX** | Improve accessibility, animations, or responsive layouts |
| 🧹 **Refactoring** | Clean up dead code (`emailService.js`), add pagination |

---

## ⚠️ Before You Start — Read This!

> **These points will save you a lot of time.**

### 1. Understand the architecture first

This project has a **unique serverless architecture**. There is no Express, FastAPI, or any traditional backend. Please read the [README Architecture section](README.md#️-architecture--data-flow) and the following two files before writing any code:

- **`src/store/mailStore.js`** — This is where 90% of the application logic lives. All state, all API calls, all Supabase interactions go through here.
- **`supabase/functions/ai-assistant/index.ts`** — This is the **only backend file**. All routes (`/send-email`, `/summarize`, `/generate-reply`, inbound webhook) are handled here.

### 2. Don't add unnecessary state

Axon Mail uses **Zustand** for state. Before adding a new piece of state, ask yourself: "Can this be derived from existing state?" If yes, don't create new state.

### 3. Use the Surgical Update pattern for Realtime

If your feature involves data that could change in real-time, hook into the existing `subscribeToMails()` WebSocket channel in `mailStore.js`. Don't create new Supabase Realtime channels unless necessary.

### 4. Check for existing issues before opening a new one

Search the [issue tracker](https://github.com/Rajveerx11/smart-mail-ui/issues) before creating a new bug report or feature request.

### 5. Open an issue before large PRs

If you're planning a large feature or refactor, please **open a GitHub Issue first** to discuss it. This prevents wasted effort if the direction doesn't align with project goals.

---

## 🛠️ Development Setup

### Prerequisites

| Tool | Minimum Version | Link |
| :--- | :--- | :--- |
| Node.js | v18.x | [nodejs.org](https://nodejs.org/) |
| npm | v9.x | Bundled with Node.js |
| Git | Any recent version | [git-scm.com](https://git-scm.com/) |
| Supabase CLI | Latest | [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli) |

### Fork & Clone

```bash
# 1. Fork the repo via GitHub UI (click "Fork" button)

# 2. Clone YOUR fork (replace YOUR_USERNAME)
git clone https://github.com/YOUR_USERNAME/smart-mail-ui.git
cd smart-mail-ui

# 3. Add the upstream remote to stay in sync
git remote add upstream https://github.com/Rajveerx11/smart-mail-ui.git
```

### Install Dependencies

```bash
npm install
```

### Configure Environment

```bash
# Copy the template
cp .env.example .env

# Open .env and fill in your Supabase credentials
# VITE_SUPABASE_URL=https://your-project-id.supabase.co
# VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

> **Where to find these values:** Supabase Dashboard → Your Project → Settings → API

### Run the Dev Server

```bash
npm run dev
# → http://localhost:5173
```

### Stay in Sync with Upstream

Before starting new work, always pull the latest changes from the main repo:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

---

## 🏗️ Project Architecture (Quick Primer)

```
User Action
    │
    ▼
React Component   (src/components/)
    │
    ▼
useMailStore()    (src/store/mailStore.js)  ← ALL state & API calls live here
    │
    ├── Supabase DB          (SELECT / INSERT / UPDATE / DELETE on emails table)
    ├── Supabase Auth        (session management)
    ├── Supabase Storage     (attachments, profile photos)
    ├── Supabase Realtime    (WebSocket — surgical updates)
    └── Edge Function        (supabase/functions/ai-assistant/index.ts)
            ├── /send-email      → Resend API
            ├── /summarize       → Groq API (Llama 3.3 70B)
            ├── /generate-reply  → Groq API (Llama 3.3 70B)
            └── webhook          ← Resend inbound emails
```

### Key Conventions

#### State Access — Use Selector Slicing

```jsx
// ✅ Correct — only re-renders when `mails` changes
const mails = useMailStore((s) => s.mails);

// ⚠️ Avoid — re-renders on any store change
const everything = useMailStore();
```

#### Adding a New Action to the Store

All new API calls and state mutations belong in `mailStore.js`:

```javascript
// Inside the store's `set()` function
myNewAction: async (param) => {
  // 1. set loading state
  set({ isLoading: true });
  // 2. perform async operation
  const { data, error } = await supabase.from('emails').select(...);
  // 3. update state
  set({ mails: data, isLoading: false });
},
```

#### Edge Function — New Route

Add new backend logic to `supabase/functions/ai-assistant/index.ts` as a new `if` block on the URL path:

```typescript
if (url.pathname.endsWith('/my-new-route')) {
  // handle your route
}
```

---

## 🌿 Branch Naming Convention

Branch names must follow this pattern:

```
<type>/<short-description>
```

| Type | When to use |
| :--- | :--- |
| `feat/` | New feature |
| `fix/` | Bug fix |
| `refactor/` | Code restructure without behaviour change |
| `docs/` | Documentation only |
| `test/` | Adding or updating tests |
| `chore/` | Tooling, dependencies, config |

### Examples

```bash
git checkout -b feat/drafts-folder
git checkout -b fix/realtime-deduplication
git checkout -b docs/improve-setup-guide
git checkout -b refactor/remove-dead-emailservice
git checkout -b test/mailstore-unit-tests
```

---

## 💬 Commit Message Format

This project follows the **[Conventional Commits](https://www.conventionalcommits.org/)** specification.

### Format

```
<type>(<optional-scope>): <short summary>

[optional body]

[optional footer]
```

### Types

| Type | Description |
| :--- | :--- |
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, missing semicolons (no logic change) |
| `refactor` | Code restructure without feature/fix |
| `test` | Adding missing tests |
| `chore` | Build process, dependency updates |
| `perf` | Performance improvement |

### Examples

```bash
# Feature
git commit -m "feat(compose): add file drag-and-drop to compose modal"

# Bug fix (with scope)
git commit -m "fix(realtime): deduplicate INSERT events on rapid re-subscribe"

# Documentation
git commit -m "docs: add supabase database setup guide to README"

# Refactor
git commit -m "refactor: remove dead emailService.js file"

# Breaking change (add ! and BREAKING CHANGE footer)
git commit -m "feat!: replace client-side filtering with server-side pagination

BREAKING CHANGE: fetchMails() now requires a page parameter"
```

> ❌ **Don't do this:**
> ```bash
> git commit -m "fixed stuff"
> git commit -m "WIP"
> git commit -m "update"
> ```

---

## 📬 Pull Request Process

### Before Opening a PR

```bash
# 1. Make sure your branch is up-to-date with upstream/main
git fetch upstream
git rebase upstream/main

# 2. Run the linter — PRs with lint errors will not be reviewed
npm run lint

# 3. Manually test your changes in the browser
npm run dev
```

### Opening the PR

1. Push your branch to **your fork**:
   ```bash
   git push origin feat/your-feature-name
   ```

2. Go to the [original repo on GitHub](https://github.com/Rajveerx11/smart-mail-ui) and click **"Compare & pull request"**.

3. Fill in the PR template completely:

   ```markdown
   ## What does this PR do?
   <!-- Clear description of changes -->

   ## Why is this change needed?
   <!-- Context and motivation -->

   ## How was it tested?
   <!-- Steps the reviewer can take to verify your changes -->

   ## Screenshots (if UI changes)
   <!-- Before / After screenshots -->

   ## Checklist
   - [ ] `npm run lint` passes with no errors
   - [ ] I have tested this locally
   - [ ] I have updated documentation if necessary
   - [ ] My commits follow the Conventional Commits format
   ```

4. Target the **`main`** branch.

5. Request a review from **@Rajveerx11** (the maintainer).

### Review Process

- A maintainer will review your PR within a few days.
- Feedback will be left inline on GitHub.
- Address all comments and push new commits to the same branch.
- Once approved, the maintainer will merge using **Squash and Merge**.

---

## 🎨 Code Style Guide

### JavaScript / JSX

- **Indentation:** 2 spaces (enforced by ESLint)
- **Quotes:** Single quotes for strings (except JSX props which use double quotes)
- **Components:** One component per file, PascalCase filename matching the component name
- **Hooks:** Call only at the top-level of components, never inside loops/conditions
- **Async:** Use `async/await` — avoid `.then()` chaining

```jsx
// ✅ Good
const MyComponent = () => {
  const mails = useMailStore((s) => s.mails);

  const handleClick = async () => {
    await someAsyncOperation();
  };

  return <div onClick={handleClick}>{mails.length} emails</div>;
};

export default MyComponent;
```

### CSS / Tailwind

- Use **Tailwind utility classes** directly — avoid writing raw CSS unless absolutely necessary.
- Check `tailwind.config.js` for the project's custom color palette and theme before adding custom values.
- For animations and transitions, use **Framer Motion** (`motion.div`, `AnimatePresence`) rather than CSS keyframes.

### Zustand Store

- All state mutations must happen inside `set()` calls.
- Group related state variables and actions together with comments.
- Keep components "dumb" — logic belongs in the store, not components.

### File Naming

| Type | Convention | Example |
| :--- | :--- | :--- |
| React Components | PascalCase | `MailView.jsx` |
| Utilities | camelCase | `mailClassifier.js` |
| Store | camelCase | `mailStore.js` |
| Pages | PascalCase | `ViewProfile.jsx` |

---

## 🧪 Testing Your Changes

Currently the project does not have an automated test suite (adding one is a great first contribution!). For now, manually verify:

### Frontend Checklist

- [ ] Login works (email + password via Supabase Auth)
- [ ] Inbox loads emails correctly
- [ ] Clicking an email opens the detail view
- [ ] Compose modal opens and can send an email
- [ ] AI Summarize button works (requires Edge Function running)
- [ ] AI Smart Reply button works (requires Edge Function running)
- [ ] `npm run lint` exits with 0 errors

### Realtime Checklist

- [ ] Open two browser tabs — verify that a new email in one tab appears in the other without refresh
- [ ] Marking an email as read reflects instantly across tabs

### Running Lint

```bash
npm run lint
```

Fix all errors before opening a PR. Warnings are acceptable but should be minimized.

---

## 🐛 Reporting Bugs

Found a bug? Please open a [GitHub Issue](https://github.com/Rajveerx11/smart-mail-ui/issues/new) and include:

```markdown
**Bug description**
A clear, concise description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Observe '...'

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Screenshots / Console errors**
If applicable, paste any error messages from the browser console.

**Environment**
- OS: [Windows / macOS / Linux]
- Browser: [Chrome / Firefox / Safari]
- Node.js version: [run `node --version`]
```

---

## 💡 Suggesting Features

Have an idea? Open a [GitHub Issue](https://github.com/Rajveerx11/smart-mail-ui/issues/new) with the label `enhancement` and include:

- **Problem statement:** What user pain does this solve?
- **Proposed solution:** How would it work?
- **Alternatives considered:** Other approaches you thought about
- **Scope:** Is this a small UI tweak or a major backend change?

---

## 🌱 Good First Issues

New to the codebase? These are great places to start:

| Issue | Description | Difficulty |
| :--- | :--- | :--- |
| Remove dead code | Delete `src/services/emailService.js` (not imported anywhere) | 🟢 Easy |
| Add JSDoc comments | Document functions in `mailStore.js` with JSDoc | 🟢 Easy |
| Keyboard shortcuts | `C` to compose, `Esc` to close modals, `R` to reply | 🟡 Medium |
| Drafts folder | Save compose state to DB before sending | 🟡 Medium |
| Unit tests | Write Vitest tests for `mailClassifier.js` and `spamDetector.js` | 🟡 Medium |
| Pagination | Replace `SELECT *` with server-side `range()` pagination | 🔴 Hard |
| Email threading | Group replies by `message_id` into threads | 🔴 Hard |

---

<div align="center">

### Thank you for contributing to Axon Mail! 🚀

If you have any questions, feel free to open a discussion on GitHub or reach out to the maintainer.

**[⬅️ Back to README](README.md)**

</div>
