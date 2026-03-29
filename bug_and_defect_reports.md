# Smart Mail UI (Axon Mail) — Bug Reports & Defect Reports

---

## SECTION 1 — BUG REPORTS

---

### BUG-001

**Bug ID:** BUG-001

**Title/Summary:** Realtime DELETE event retains only the deleted email instead of removing it from the mail list

**Description:**
In the `subscribeToMails()` function within the Zustand mail store (`src/store/mailStore.js`), the handler responsible for processing `DELETE` events from the Supabase realtime channel contains a logical error in its filter condition. The current implementation uses `filter(m => m.id === oldRecord.id)`, which retains only the record matching the deleted email's ID and discards every other email from the state. This is the exact opposite of the intended behavior. The correct operator should be `!==`, so that the deleted record is excluded and all other emails are preserved. This bug affects any user who has the application open when an email is deleted — their entire mail list will be wiped and replaced with a single deleted record, causing complete data loss in the UI until a manual refresh is performed.

**Severity:** Critical

**Priority:** P1

**Environment:** Development (localhost:5173) | React 19 | Vite 7 | Supabase

**Steps to Reproduce:**
1. Log into the Axon Mail application and ensure the Inbox contains at least 3–4 emails.
2. Open the browser developer tools and navigate to the Console tab to observe state changes.
3. Open a second browser tab or use the Supabase dashboard to directly delete one email from the `emails` table.
4. Switch back to the first tab where the application is open and observe the mail list.
5. Verify whether the deleted email has been removed from the list or whether the list now shows only the deleted email.
6. Attempt to interact with the remaining UI elements (e.g., click on a mail, switch folders) and observe Application behavior.

**Expected Result:**
The deleted email should be removed from the `mails` array in the Zustand store, and all other emails should remain visible and intact in the mail list.

**Actual Result:**
The `mails` array is replaced with an array containing only the deleted email record. All other emails disappear from the UI. The user sees a single email in their list (the one that was just deleted), and the rest of the mailbox appears empty until a full page refresh is performed.

**Attachments:** N/A

**Reported by:** QA Team — Member 1

**Date Reported:** 2026-03-29

**Assigned to:** Development Team

**Status:** Open

---

### BUG-002

**Bug ID:** BUG-002

**Title/Summary:** classifyMail() crashes with TypeError when email fields are null or undefined

**Description:**
The `classifyMail()` function in `src/utils/mailClassifier.js` immediately calls `.toLowerCase()` on `mail.from`, `mail.subject`, and `mail.body` without verifying whether these properties exist or are non-null. When an email record arrives from Supabase with any of these fields set to `null` or `undefined` — which can happen for inbound emails with missing subjects, empty bodies, or malformed sender information — the function throws an uncaught `TypeError: Cannot read properties of null (reading 'toLowerCase')`. This crash prevents the email from being classified entirely, and since the function is invoked during the mail processing pipeline, it can block downstream operations such as folder assignment and spam detection for that particular email.

**Severity:** High

**Priority:** P1

**Environment:** Development (localhost:5173) | React 19 | Vite 7 | Supabase

**Steps to Reproduce:**
1. Open the Axon Mail application and ensure the Inbox is loaded.
2. Using the Supabase dashboard, manually insert a new email record into the `emails` table with the `subject` field set to `NULL` and the `body` field set to `NULL`.
3. Alternatively, trigger an inbound webhook with an email that has a missing or empty subject line (e.g., `fullEmail.subject` is `undefined`).
4. Observe the browser developer console for errors.
5. Check whether the email appears in the Inbox with a valid folder and category assignment.
6. Repeat the test with `sender` set to `NULL` to confirm the crash occurs for all three fields.

**Expected Result:**
The `classifyMail()` function should handle `null` or `undefined` fields gracefully — treating them as empty strings or skipping the classification — and return a valid `{ folder, category }` object without crashing.

**Actual Result:**
The function throws `TypeError: Cannot read properties of null (reading 'toLowerCase')` at line 2, 3, or 4 of `mailClassifier.js`, depending on which field is null. The email is not classified, and the error propagates up the call stack, potentially disrupting the mail loading flow.

**Attachments:** N/A

**Reported by:** QA Team — Member 1

**Date Reported:** 2026-03-29

**Assigned to:** Development Team

**Status:** Open

---
---

## SECTION 2 — DEFECT REPORTS

---

### DEF-001

**Defect ID:** DEF-001

**Project:** smart-mail-ui (Axon Mail)

**Product:** Axon Mail Web Application

**Release Version:** v1.0.0

**Module:** Supabase Client — `src/lib/supabase.js`

**Test Case ID:** TC_SUPABASE_002, TC_SUPABASE_003

**Detected Build Version:** Build 1.0.0-dev

**Summary:** Supabase client is silently created with undefined credentials when environment variables are missing

**Description:**
The Supabase client initialization module checks for the presence of `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables and logs a `console.warn()` if either is missing. However, it does not prevent `createClient()` from being called with `undefined` values. As a result, the application boots up without any visible failure, and the Supabase client object is exported as a seemingly valid instance. The actual failure only surfaces later — when a component or service attempts to make a query, it receives a cryptic network or authentication error with no clear indication that the root cause is missing environment configuration. This makes debugging significantly harder, especially for new developers onboarding to the project or when deploying to a new environment where the `.env` file has not been configured yet.

**Steps to Replicate:**
1. Remove or comment out the `VITE_SUPABASE_URL` variable from the `.env` file in the project root.
2. Start the development server using `npm run dev`.
3. Open the application in the browser at `localhost:5173`.
4. Observe the browser console — a warning message should appear, but no error or crash occurs.
5. Attempt to log in or load the Inbox, which triggers a Supabase query.
6. Observe the error that appears — it will be a generic network/connection error with no mention of missing environment variables.

**Actual Result:**
The application starts successfully, the Supabase client is created with `undefined` arguments, and the warning is logged only to the console. No error is thrown. When a query is attempted, it fails with a generic connection error that does not indicate the real cause (missing credentials).

**Expected Result:**
The module should throw a descriptive error or halt initialization when required environment variables are missing, preventing the application from proceeding in a broken state. At minimum, the error message should clearly state which variable is missing and reference the `.env` file.

**Severity:** Medium

**Priority:** P2

**Reported by:** QA Team — Member 1

**Assigned to:** Development Team

**Status:** Open

---

### DEF-002

**Defect ID:** DEF-002

**Project:** smart-mail-ui (Axon Mail)

**Product:** Axon Mail Web Application

**Release Version:** v1.0.0

**Module:** AI Assistant Edge Function — `supabase/functions/ai-assistant/index.ts`

**Test Case ID:** TC_AIEDGE_014

**Detected Build Version:** Build 1.0.0-dev

**Summary:** No null-check on Groq API response before accessing nested properties, causing unhandled crash on malformed responses

**Description:**
In the AI Assistant Edge Function, both the `/summarize` and `/generate-reply` routes call the Groq API and immediately access the response at `gData.choices[0].message.content` without validating the response structure. If the Groq API returns an unexpected payload — such as an empty `choices` array, a response without the `message` field, or an error object instead of a completion — this line throws an unhandled `TypeError` (e.g., `Cannot read properties of undefined (reading 'message')`). The error is caught by the global `catch` block, which returns a generic `400` response with only the raw error message. This provides no actionable context to the frontend about what went wrong, making it difficult for both users and developers to diagnose the issue. The defect is particularly impactful because Groq API responses can vary due to rate limiting, model availability, or temporary service disruptions.

**Steps to Replicate:**
1. Deploy the AI Assistant Edge Function to the Supabase project.
2. Ensure at least one email exists in the `emails` table with a valid `id`.
3. Temporarily set the `GROQ_API_KEY` environment variable to an invalid or expired key, or simulate a scenario where the Groq API returns an empty `choices` array.
4. From the frontend, open an email and click "Summarize" or "Generate Reply" to trigger a POST request to the `/summarize` or `/generate-reply` endpoint.
5. Observe the response returned to the frontend — check the status code and error message.
6. Review the Edge Function logs in the Supabase dashboard to see the raw error captured by the catch block.

**Actual Result:**
The Edge Function crashes at `gData.choices[0].message.content` with an unhandled `TypeError`. The global catch block returns a `400` response with a raw error message like `"Cannot read properties of undefined (reading 'message')"`, which provides no useful context to the user or frontend.

**Expected Result:**
The function should validate the Groq API response structure before accessing nested properties. If the response is malformed or empty, it should return a clear, descriptive error message (e.g., `"AI service returned an unexpected response. Please try again."`) with appropriate status code, allowing the frontend to display a user-friendly error.

**Severity:** Medium

**Priority:** P2

**Reported by:** QA Team — Member 1

**Assigned to:** Development Team

**Status:** Open
