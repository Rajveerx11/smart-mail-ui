# AI Thought Partner Integration Spec

## 1. Project Stack

- **Framework**: N/A (Project uses **Vite** v7.2.4 + **React** v19.2.0)
- **UI Library**:
  - **Tailwind CSS** (v3.4.17)
  - **Lucide React** (Icons)
  - **Framer Motion** (Animations)
  - *No Radix UI detected.*
- **State Management**: **Zustand** (v5.0.10)
- **Supabase Client**: N/A (Not currently installed)

## 2. File Structure

```
src/
├── components/
│   ├── AddAccountModal.jsx
│   ├── AdvancedSearch.jsx
│   ├── AnimatedButton.jsx
│   ├── AuthModal.jsx
│   ├── ComposeModal.jsx
│   ├── IconNavbar.jsx
│   ├── LoginPage.jsx
│   ├── MailItem.jsx
│   ├── MailList.jsx
│   ├── MailTabs.jsx
│   ├── MailView.jsx
│   ├── ManageAccountModal.jsx
│   ├── Sidebar.jsx
│   ├── SignOutModal.jsx
│   ├── SmartBadge.jsx
│   ├── SplashScreen.jsx
│   ├── Topbar.jsx
│   ├── UserProfileMenu.jsx
│   └── profileMenu.jsx
├── data/
│   └── dummyMails.js (Inferred from import)
├── pages/
│   └── (1 file)
├── store/
│   └── mailStore.js
├── utils/
│   └── (3 files)
├── App.jsx
├── main.jsx
└── index.css
```

## 3. Inbox Logic

**Current Implementation**:

- **Data Source**: `src/store/mailStore.js` initializes `mails` from `../data/dummyMails`.
- **Fetching**: No async fetching. Data is loaded synchronously into the Zustand store.
- **Filtering**: `getFilteredMails` selector in `mailStore.js` filters by folder, category, and search text.
- **Component**: `src/components/MailList.jsx` calls `getFilteredMails()` to display the list.

**Integration Target**:

- Replace `initialMails` with an empty array.
- Add an async `fetchMails` action in `mailStore.js` to query the `emails` table in Supabase.

## 4. Compose Logic

**Current Implementation**:

- **Action**: `sendMail` function in `src/store/mailStore.js`.
- **Logic**: Adds a new mail object to the local `mails` array with `Date.now()` as ID and folder "Sent".
- **Component**: `src/components/ComposeModal.jsx` captures form state (`to`, `subject`, `body`) and calls `sendMail`.

**Integration Target**:

- Update `sendMail` to be async.
- Perform an `INSERT` into the `emails` table via Supabase client.

## 5. Authentication

**Current Implementation**:

- **State**: `user` object in `src/store/mailStore.js` hardcoded to:

  ```javascript
  user: {
    name: "Marco",
    email: "marco@gmail.com",
    photo: null,
  }
  ```

- **Session**: No real session management. `isSignOutOpen` toggles. No real auth.

**Integration Target**:

- Install `@supabase/auth-helpers-react` (or `supabase-js`).
- Replace the hardcoded `user` object with `useSession()` hook or similar from Supabase.
- Implement `createClientComponentClient` equivalent (for Vite, just `createClient`) for single-page app auth flow.
