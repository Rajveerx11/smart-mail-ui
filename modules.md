# Smart Mail UI — Module Inventory

> **Project:** `smart-mail-ui` (Axon Mail)
> **Stack:** React 19 · Vite 7 · Zustand · Supabase · Tailwind CSS · Framer Motion · Lucide Icons
> **Generated:** 2026-03-26

---

## 1. App Entry Point

### main.jsx
- **Path:** `src/main.jsx`
- **Description:** React DOM entry point that renders `<App />` inside `StrictMode` and suppresses browser-extension errors.
- **Key exports:** None (side-effect only)

### App.jsx
- **Path:** `src/App.jsx`
- **Description:** Root component that initializes auth & realtime subscriptions, handles login routing, and assembles the full layout (Topbar → Sidebar → MailTabs → MailList/MailView + Modals).
- **Key exports:** `App` (default)

---

## 2. State Management (Zustand Store)

### mailStore
- **Path:** `src/store/mailStore.js`
- **Description:** Central Zustand store managing all application state — user auth, mail CRUD, folder/category navigation, search, compose, profile, and AI features.
- **Key state:** `user`, `mails`, `selectedMail`, `activeFolder`, `activeCategory`, `searchText`, `searchHistory`, `isLoading`, `isRefreshing`, `isAnalyzing`, `isComposeOpen`, `isSidebarOpen`, `isProfileOpen`, `isAddAccountOpen`, `isSignOutOpen`
- **Key actions:**
  - `initializeAuth()` — session restore + auth listener
  - `fetchMails()` / `forceRefresh()` — fetch emails from Supabase
  - `sendMail(emailData)` — send via edge function `/send-email`
  - `generateAISummary(id)` / `generateAIDraft(id)` — call AI edge functions
  - `subscribeToMails()` — Postgres realtime (INSERT / UPDATE / DELETE)
  - `updateUser(updates)` / `uploadProfilePhoto(file)` / `logout()`
  - UI toggles: `openCompose`, `closeCompose`, `toggleSidebar`, `toggleProfile`, etc.

---

## 3. Database & Backend (Supabase)

### Supabase Client
- **Path:** `src/lib/supabase.js`
- **Description:** Creates and exports the Supabase client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables.
- **Key exports:** `supabase` (named + default)

### AI Assistant Edge Function
- **Path:** `supabase/functions/ai-assistant/index.ts`
- **Description:** Deno-based Supabase Edge Function serving three API routes for email send, AI copilot, and inbound webhook processing.
- **Routes:**
  - `POST /send-email` — Sends email via Resend API, uploads attachments to Supabase Storage, saves to `emails` table (Sent folder)
  - `POST /summarize` — Generates AI email summary using Groq (Llama 3.3 70B) and saves to DB
  - `POST /generate-reply` — Generates AI reply draft using Groq and saves to DB
  - `POST (webhook)` — Handles `email.received` inbound webhook — retrieves full email from Resend, downloads & stores attachments, inserts into `emails` table (Inbox folder)
- **Key integrations:** Resend API, Groq AI API, Supabase Storage

---

## 4. Services

### emailService
- **Path:** `src/services/emailService.js`
- **Description:** Service layer providing API functions for email operations — fetching, reading, replying, on-demand AI analysis, and realtime subscriptions.
- **Key functions:**
  - `fetchEmails(folder)` — Fetch all emails from a given folder
  - `fetchEmailById(emailId)` — Fetch single email by UUID
  - `markAsRead(emailId)` — Mark email as read
  - `sendReply(replyData)` — Send reply via FastAPI backend
  - `analyzeOnDemand(emailId)` — Trigger on-demand AI analysis
  - `subscribeToEmails(onInsert, onUpdate)` — Realtime email subscription

---

## 5. UI Components — Layout

### Topbar
- **Path:** `src/components/Topbar.jsx`
- **Description:** Top navigation bar with Axon logo, sidebar toggle, search bar with history dropdown, refresh button, and profile avatar with hover tooltip.
- **Key features:** Search with history, force refresh, profile menu trigger

### Sidebar
- **Path:** `src/components/Sidebar.jsx`
- **Description:** Collapsible left sidebar with folder navigation (Inbox, Sent, Spam) and Compose button.
- **Key features:** Collapsible mode (64px / 256px), active folder highlighting

### IconNavbar
- **Path:** `src/components/IconNavbar.jsx`
- **Description:** Alternative icon-based vertical navigation bar with expandable labels (Inbox, Starred, Snoozed, Sent, Drafts, Spam).
- **Key features:** Expand/collapse toggle

---

## 6. UI Components — Mail Display

### MailTabs
- **Path:** `src/components/MailTabs.jsx`
- **Description:** Category tab bar shown only for Inbox (Primary, Promotions, Social, Updates).
- **Key features:** Tab switching with active indicator

### MailList
- **Path:** `src/components/MailList.jsx`
- **Description:** Scrollable email list panel with combined filtering by folder, category, and search text.
- **Key features:** Folder + category + search filtering, realtime subscription, read/unread styling

### MailItem
- **Path:** `src/components/MailItem.jsx`
- **Description:** Individual email row component displaying subject, sender, and category badges (Spam, Promo, Social, Updates).
- **Key features:** Category badges, click-to-select

### MailView
- **Path:** `src/components/MailView.jsx`
- **Description:** Full email viewer with sender info, email body, attachment handling (download/preview via signed URLs), and AI Assistant sidebar for summary generation and smart reply drafting.
- **Key features:** Attachment download/view, AI summary, AI draft reply, copy-to-clipboard

---

## 7. UI Components — Compose & Search

### ComposeModal
- **Path:** `src/components/ComposeModal.jsx`
- **Description:** Floating compose window with To/Subject/Body fields, file attachment support (upload to Supabase Storage), minimize/close, and auto-fill from AI draft replies.
- **Key features:** File attachments, upload to Supabase Storage, auto-fill from AI drafts, minimizable

### AdvancedSearch
- **Path:** `src/components/AdvancedSearch.jsx`
- **Description:** Overlay panel for advanced email search with filters for From, To, Subject, keywords, date range, folder, and attachment presence.
- **Key features:** Multi-field search form, date range selector

---

## 8. UI Components — Authentication & Account

### LoginPage
- **Path:** `src/components/LoginPage.jsx`
- **Description:** Email/password login page using Supabase `signInWithPassword`, with error handling for unverified emails and invalid credentials.
- **Key features:** Form validation, Supabase auth, branded UI

### AuthModal
- **Path:** `src/components/AuthModal.jsx`
- **Description:** Multi-purpose auth modal that shows Manage Account, Add Account, or Sign Out views based on `authView` state.
- **Key features:** 3 auth views in single modal

### AddAccountModal
- **Path:** `src/components/AddAccountModal.jsx`
- **Description:** Modal dialog for adding another email account with email/password fields.
- **Key features:** Minimal add-account form

### SignOutModal
- **Path:** `src/components/SignOutModal.jsx`
- **Description:** Confirmation modal for signing out with Cancel/Sign Out actions.
- **Key features:** Confirmation dialog pattern

### ManageAccountModal
- **Path:** `src/components/ManageAccountModal.jsx`
- **Description:** Account management modal showing user info and links to Personal Info, Security, and Privacy settings.
- **Key features:** Settings navigation cards

---

## 9. UI Components — Profile

### ProfileMenu (profileMenu.jsx)
- **Path:** `src/components/profileMenu.jsx`
- **Description:** Dropdown profile card with avatar (upload-on-hover), display name, email, and action buttons for Add Account and Sign Out.
- **Key features:** Profile photo upload overlay, name derivation from email

### UserProfileMenu
- **Path:** `src/components/UserProfileMenu.jsx`
- **Description:** Alternative profile dropdown with Google-style account card showing user avatar, name, email, and Profile/Sign Out buttons.
- **Key features:** Click-outside-to-close, Google-style UI

---

## 10. Pages

### ViewProfile
- **Path:** `src/pages/ViewProfile.jsx`
- **Description:** Full profile page with editable display name, profile photo upload, and account management actions (Manage Account, Add Account, Sign Out).
- **Key features:** Inline name editing, photo upload with progress, success/error feedback, logout

---

## 11. UI Components — Shared / Utility

### SmartBadge
- **Path:** `src/components/SmartBadge.jsx`
- **Description:** Colored pill badge component for email category labels (Work → blue, Spam → red, Safe → green).
- **Key exports:** `SmartBadge` (default)

### SplashScreen
- **Path:** `src/components/SplashScreen.jsx`
- **Description:** Branded splash screen with Axon logo animation and "Continue to Axon" CTA button.
- **Key features:** Logo pop animation, fade-up text

### AnimatedButton
- **Path:** `src/components/AnimatedButton.jsx`
- **Description:** Reusable gradient button with ripple effect, hover scale, and active press animation.
- **Key exports:** `AnimatedButton` (default)

---

## 12. Utilities (AI / Classification)

### mailClassifier
- **Path:** `src/utils/mailClassifier.js`
- **Description:** Rule-based email classifier that categorizes emails into Spam, Promotions, Social, Updates, or Primary based on sender and content keywords.
- **Key functions:** `classifyMail(mail)` → `{ folder, category }`

### spamDetector
- **Path:** `src/utils/spamDetector.js`
- **Description:** Score-based spam detection utility that evaluates email subject and body against spam indicator patterns.
- **Key functions:** `isSpam(mail)` → `boolean` (threshold ≥ 5)

### autoReply
- **Path:** `src/utils/autoReply.js`
- **Description:** Template-based auto-reply generator that produces canned responses based on email subject keywords (interview, meeting, support).
- **Key functions:** `generateAutoReply(mail)` → `string`

---

## 13. Configuration & Build

| File | Description |
|---|---|
| `package.json` | Project metadata, scripts (`dev`, `build`, `lint`, `preview`), and dependencies |
| `vite.config.js` | Vite build config with React plugin |
| `tailwind.config.js` | Tailwind CSS theme configuration |
| `postcss.config.js` | PostCSS config (Tailwind + Autoprefixer) |
| `eslint.config.js` | ESLint config with React Hooks and Refresh plugins |
| `index.html` | HTML shell with `#root` mount point |
| `.env` / `.env.example` | Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`) |
| `supabase/config.toml` | Supabase local development configuration |

---

## 14. Styling

| File | Description |
|---|---|
| `src/index.css` | Global styles, Tailwind directives, and custom animations |
| `src/App.css` | App-level component styles |

---

## 15. Documentation

| File | Description |
|---|---|
| `README.md` | Project overview, setup instructions, and architecture summary |
| `context.md` | Detailed project context and integration specifications |
| `documentation.md` | Technical documentation for the email system |
| `bodhak_integration_spec.md` | Integration specification for Bodhak AI platform |
