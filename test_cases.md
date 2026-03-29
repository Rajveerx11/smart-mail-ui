# Smart Mail UI (Axon Mail) — Comprehensive Test Cases

---

## Module 1: mailStore (Zustand)

**File:** `src/store/mailStore.js`

| Serial No. | Test Case ID | Description / Objective | Pre-condition | Input Steps | Expected Output | Actual Output | Result (Pass/Fail) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | TC_MAILSTORE_001 | Verify initial `user` state is null | Store is freshly initialized | 1. Import `useMailStore` 2. Read `user` state | `user` is `null` | | |
| 2 | TC_MAILSTORE_002 | Verify initial `mails` state is empty array | Store is freshly initialized | 1. Read `mails` state | `mails` is an empty array `[]` | | |
| 3 | TC_MAILSTORE_003 | Verify initial `selectedMail` is null | Store is freshly initialized | 1. Read `selectedMail` state | `selectedMail` is `null` | | |
| 4 | TC_MAILSTORE_004 | Verify default active folder is Inbox | Store is freshly initialized | 1. Read `activeFolder` state | `activeFolder` is `"Inbox"` | | |
| 5 | TC_MAILSTORE_005 | Verify default active category is Primary | Store is freshly initialized | 1. Read `activeCategory` state | `activeCategory` is `"Primary"` | | |
| 6 | TC_MAILSTORE_006 | Verify initial search text is empty | Store is freshly initialized | 1. Read `searchText` state | `searchText` is `""` | | |
| 7 | TC_MAILSTORE_007 | Verify initial search history is empty | Store is freshly initialized | 1. Read `searchHistory` state | `searchHistory` is `[]` | | |
| 8 | TC_MAILSTORE_008 | Verify all boolean flag defaults | Store is freshly initialized | 1. Read all boolean flags (`isLoading`, `isRefreshing`, `isAnalyzing`, `isComposeOpen`, `isComposeMinimized`, `isSidebarOpen`, `isProfileOpen`, `isAddAccountOpen`, `isSignOutOpen`) | All are `false` except `isSidebarOpen` which is `true` | | |
| 9 | TC_MAILSTORE_009 | Verify openCompose sets compose modal open | `isComposeOpen` is `false` | 1. Call `openCompose()` | `isComposeOpen` becomes `true`, `isComposeMinimized` becomes `false` | | |
| 10 | TC_MAILSTORE_010 | Verify closeCompose closes compose modal | `isComposeOpen` is `true` | 1. Call `closeCompose()` | `isComposeOpen` becomes `false`, `isComposeMinimized` becomes `false` | | |
| 11 | TC_MAILSTORE_011 | Verify toggleMinimize minimizes compose | `isComposeOpen` is `true`, `isComposeMinimized` is `false` | 1. Call `toggleMinimize()` | `isComposeMinimized` becomes `true` | | |
| 12 | TC_MAILSTORE_012 | Verify toggleMinimize restores compose | `isComposeMinimized` is `true` | 1. Call `toggleMinimize()` | `isComposeMinimized` becomes `false` | | |
| 13 | TC_MAILSTORE_013 | Verify toggleSidebar closes sidebar | `isSidebarOpen` is `true` | 1. Call `toggleSidebar()` | `isSidebarOpen` becomes `false` | | |
| 14 | TC_MAILSTORE_014 | Verify toggleSidebar opens sidebar | `isSidebarOpen` is `false` | 1. Call `toggleSidebar()` | `isSidebarOpen` becomes `true` | | |
| 15 | TC_MAILSTORE_015 | Verify toggleProfile opens profile menu | `isProfileOpen` is `false` | 1. Call `toggleProfile()` | `isProfileOpen` becomes `true` | | |
| 16 | TC_MAILSTORE_016 | Verify toggleProfile closes profile menu | `isProfileOpen` is `true` | 1. Call `toggleProfile()` | `isProfileOpen` becomes `false` | | |
| 17 | TC_MAILSTORE_017 | Verify closeProfile forces profile closed | `isProfileOpen` is `true` | 1. Call `closeProfile()` | `isProfileOpen` becomes `false` | | |
| 18 | TC_MAILSTORE_018 | Verify openAddAccount opens modal and closes profile | `isProfileOpen` is `true` | 1. Call `openAddAccount()` | `isAddAccountOpen` becomes `true`, `isProfileOpen` becomes `false` | | |
| 19 | TC_MAILSTORE_019 | Verify closeAddAccount closes add-account modal | `isAddAccountOpen` is `true` | 1. Call `closeAddAccount()` | `isAddAccountOpen` becomes `false` | | |
| 20 | TC_MAILSTORE_020 | Verify openSignOut opens modal and closes profile | `isProfileOpen` is `true` | 1. Call `openSignOut()` | `isSignOutOpen` becomes `true`, `isProfileOpen` becomes `false` | | |
| 21 | TC_MAILSTORE_021 | Verify closeSignOut closes sign-out modal | `isSignOutOpen` is `true` | 1. Call `closeSignOut()` | `isSignOutOpen` becomes `false` | | |
| 22 | TC_MAILSTORE_022 | Verify adding a search term to empty history | `searchHistory` is `[]` | 1. Call `addSearchHistory("test query")` | `searchHistory` becomes `["test query"]` | | |
| 23 | TC_MAILSTORE_023 | Verify new search term is prepended | `searchHistory` is `["query1"]` | 1. Call `addSearchHistory("query2")` | `searchHistory` becomes `["query2", "query1"]` (newest first) | | |
| 24 | TC_MAILSTORE_024 | Verify search history caps at 5 items | `searchHistory` has 5 items | 1. Call `addSearchHistory("query6")` | `searchHistory` has 5 items with `"query6"` first, oldest item dropped | | |
| 25 | TC_MAILSTORE_025 | Verify duplicate search term is moved to front | `searchHistory` is `["a", "b"]` | 1. Call `addSearchHistory("a")` | `searchHistory` becomes `["a", "b"]` — duplicate moved to front, no duplication | | |
| 26 | TC_MAILSTORE_026 | Verify empty string is ignored in search history | `searchHistory` is `["a"]` | 1. Call `addSearchHistory("")` | `searchHistory` remains `["a"]` — empty string ignored | | |
| 27 | TC_MAILSTORE_027 | Verify whitespace-only string is ignored | `searchHistory` is `["a"]` | 1. Call `addSearchHistory("   ")` | `searchHistory` remains `["a"]` — whitespace-only string ignored | | |
| 28 | TC_MAILSTORE_028 | Verify clearSearch resets search text | `searchText` is `"some text"` | 1. Call `clearSearch()` | `searchText` becomes `""` | | |
| 29 | TC_MAILSTORE_029 | Verify setUser updates user state | Store initialized | 1. Call `setUser({ id: "u1", email: "a@b.com" })` | `user` becomes the provided user object | | |
| 30 | TC_MAILSTORE_030 | Verify setFolder changes folder and resets category/selectedMail | `activeFolder` is `"Inbox"`, `selectedMail` is set | 1. Call `setFolder("Sent")` | `activeFolder` becomes `"Sent"`, `activeCategory` resets to `"Primary"`, `selectedMail` resets to `null` | | |
| 31 | TC_MAILSTORE_031 | Verify setActiveCategory changes category and clears selectedMail | `activeCategory` is `"Primary"`, `selectedMail` is set | 1. Call `setActiveCategory("Social")` | `activeCategory` becomes `"Social"`, `selectedMail` resets to `null` | | |
| 32 | TC_MAILSTORE_032 | Verify setSearchText updates search text | Store initialized | 1. Call `setSearchText("hello")` | `searchText` becomes `"hello"` | | |
| 33 | TC_MAILSTORE_033 | Verify setSelectedMail selects a mail | Store initialized | 1. Call `setSelectedMail({ id: 1, subject: "Test" })` | `selectedMail` becomes the provided mail object | | |
| 34 | TC_MAILSTORE_034 | Verify updateUser success path | `user` is set, Supabase auth mock returns success | 1. Call `updateUser({ name: "New Name" })` | `supabase.auth.updateUser` called with `{ data: { name: "New Name" } }`, local `user` state updated, returns `{ success: true }` | | |
| 35 | TC_MAILSTORE_035 | Verify updateUser handles auth error | `user` is set, Supabase auth mock returns error | 1. Call `updateUser({ name: "x" })` | Returns `{ success: false, error: <message> }`, `user` state unchanged | | |
| 36 | TC_MAILSTORE_036 | Verify logout clears all user state | User is logged in, Supabase `signOut` succeeds | 1. Call `logout()` | `user` becomes `null`, `mails` becomes `[]`, `selectedMail` becomes `null`, returns `{ success: true }` | | |
| 37 | TC_MAILSTORE_037 | Verify logout handles signOut failure | User is logged in, Supabase `signOut` fails | 1. Call `logout()` | Returns `{ success: false, error: <message> }`, state unchanged | | |
| 38 | TC_MAILSTORE_038 | Verify successful profile photo upload | User is logged in, valid image file (PNG, 2MB) | 1. Call `uploadProfilePhoto(file)` | File uploaded to `profile-photos/<userId>_<timestamp>.png`, user metadata updated with public URL, returns `{ success: true, url: <publicUrl> }` | | |
| 39 | TC_MAILSTORE_039 | Verify upload fails when no user is logged in | User is **not** logged in (`user` is `null`) | 1. Call `uploadProfilePhoto(file)` | Returns `{ success: false, error: "No user logged in" }` | | |
| 40 | TC_MAILSTORE_040 | Verify upload rejects non-image files | User is logged in, file is a PDF (non-image) | 1. Call `uploadProfilePhoto(pdfFile)` | Returns `{ success: false, error: "Please select a valid image file" }` | | |
| 41 | TC_MAILSTORE_041 | Verify upload rejects files exceeding 5MB | User is logged in, image file is 6MB | 1. Call `uploadProfilePhoto(largeFile)` | Returns `{ success: false, error: "Image size must be less than 5MB" }` | | |
| 42 | TC_MAILSTORE_042 | Verify upload handles storage upload failure | User is logged in, valid image, Supabase storage upload fails | 1. Call `uploadProfilePhoto(file)` | Returns `{ success: false, error: <uploadError.message> }` | | |
| 43 | TC_MAILSTORE_043 | Verify upload handles updateUser failure after successful upload | User is logged in, valid image, upload succeeds, `updateUser` fails | 1. Call `uploadProfilePhoto(file)` | Returns `{ success: false, error: <error> }` | | |
| 44 | TC_MAILSTORE_044 | Verify initializeAuth with active session | Supabase auth has active session | 1. Call `initializeAuth()` | `user` set from session, `fetchMails()` called, auth listener subscription returned | | |
| 45 | TC_MAILSTORE_045 | Verify initializeAuth with no session | Supabase auth has no session | 1. Call `initializeAuth()` | `user` remains `null`, `fetchMails()` not called, auth listener still subscribed | | |
| 46 | TC_MAILSTORE_046 | Verify auth state change on login event | Auth listener active, new login event fires | 1. Simulate `onAuthStateChange` with valid session | `user` updated to new session user, `fetchMails()` called | | |
| 47 | TC_MAILSTORE_047 | Verify auth state change on logout event | Auth listener active, logout event fires | 1. Simulate `onAuthStateChange` with `null` session | `user` set to `null`, `mails` set to `[]`, `selectedMail` set to `null` | | |
| 48 | TC_MAILSTORE_048 | Verify fetchMails success flow with loading states | `isLoading` is `false`, Supabase returns emails | 1. Call `fetchMails()` | `isLoading` set to `true`, then after fetch `mails` populated, `isLoading` set to `false` | | |
| 49 | TC_MAILSTORE_049 | Verify fetchMails duplicate guard prevents concurrent calls | `isLoading` is `true` (concurrent call) | 1. Call `fetchMails()` while already loading | Function returns immediately without making another query | | |
| 50 | TC_MAILSTORE_050 | Verify fetchMails handles Supabase query error | Supabase query returns error | 1. Call `fetchMails()` | Error logged to console, `isLoading` set to `false`, `mails` unchanged | | |
| 51 | TC_MAILSTORE_051 | Verify fetchMails handles null data with fallback | Supabase query returns `null` data | 1. Call `fetchMails()` | `mails` set to `[]` (fallback) | | |
| 52 | TC_MAILSTORE_052 | Verify forceRefresh triggers fetch with refreshing state | Store has mails | 1. Call `forceRefresh()` | `isRefreshing` set to `true`, `fetchMails()` called, after 600ms `isRefreshing` set to `false` | | |
| 53 | TC_MAILSTORE_053 | Verify sendMail success flow | Edge function reachable, valid email data | 1. Call `sendMail({ to: "x@y.com", subject: "Hi", body: "Hello" })` | POST to `/send-email`, `fetchMails()` called after, returns `true` | | |
| 54 | TC_MAILSTORE_054 | Verify sendMail handles non-ok response | Edge function returns non-ok response | 1. Call `sendMail(data)` | Throws error with message from response body or `"Failed to send email"` | | |
| 55 | TC_MAILSTORE_055 | Verify sendMail handles network error | Network error on fetch | 1. Call `sendMail(data)` with network down | Throws network error | | |
| 56 | TC_MAILSTORE_056 | Verify generateAISummary updates state with summary | Valid email ID, edge function returns summary | 1. Call `generateAISummary("email-id-1")` | `isAnalyzing` toggled, summary saved to `selectedMail.summary` and matching mail in `mails` | | |
| 57 | TC_MAILSTORE_057 | Verify generateAIDraft updates state with draft | Valid email ID, edge function returns draft | 1. Call `generateAIDraft("email-id-1")` | `isAnalyzing` toggled, `ai_draft` saved to `selectedMail.ai_draft` and matching mail in `mails` | | |
| 58 | TC_MAILSTORE_058 | Verify realtime INSERT adds new email | Realtime channel set up | 1. Call `subscribeToMails()` 2. Simulate INSERT event with new email | New email prepended to `mails` array | | |
| 59 | TC_MAILSTORE_059 | Verify realtime INSERT deduplicates existing emails | Email already exists in `mails` | 1. Simulate INSERT event with same `id` as existing | Email is NOT duplicated in `mails` | | |
| 60 | TC_MAILSTORE_060 | Verify realtime UPDATE modifies email in-place | Existing email in `mails` | 1. Simulate UPDATE event for that email | Email updated in-place in `mails` array | | |
| 61 | TC_MAILSTORE_061 | Verify realtime UPDATE also updates selectedMail | `selectedMail` matches the updated email ID | 1. Simulate UPDATE event | `selectedMail` also updated with new record | | |
| 62 | TC_MAILSTORE_062 | Verify realtime DELETE removes email (potential bug) | Existing email in `mails` | 1. Simulate DELETE event | **BUG CHECK:** Code uses `filter(m => m.id === oldRecord.id)` — KEEPS only deleted email instead of removing it. Expected: email removed | | |
| 63 | TC_MAILSTORE_063 | Verify subscription cleanup function works | Subscription active | 1. Call the cleanup function returned by `subscribeToMails()` | `supabase.removeChannel(channel)` called, subscription torn down | | |
| 64 | TC_MAILSTORE_064 | Verify file extension extraction for photo upload | File name is `photo.jpg` | 1. Call `uploadProfilePhoto(file)` | `fileExt` extracted as `"jpg"`, filename format is `<userId>_<timestamp>.jpg` | | |
| 65 | TC_MAILSTORE_065 | Verify file with no extension still attempts upload | File has no extension (e.g., `Dockerfile`) | 1. Call `uploadProfilePhoto(file)` with `file.name = "image"` | `fileExt` is `"image"` (last element after split by `.`), upload still attempted | | |

---

## Module 2: Supabase Client

**File:** `src/lib/supabase.js`

| Serial No. | Test Case ID | Description / Objective | Pre-condition | Input Steps | Expected Output | Actual Output | Result (Pass/Fail) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | TC_SUPABASE_001 | Verify client is created with valid env vars | `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env` | 1. Import `supabase` from `src/lib/supabase.js` | `supabase` is a valid Supabase client instance (not `null`/`undefined`) | | |
| 2 | TC_SUPABASE_002 | Verify warning when URL env var is missing | `VITE_SUPABASE_URL` is missing from `.env` | 1. Import the module | Console warning `"⚠️ Supabase credentials not found. Check your .env file."` is displayed | | |
| 3 | TC_SUPABASE_003 | Verify warning when anon key env var is missing | `VITE_SUPABASE_ANON_KEY` is missing from `.env` | 1. Import the module | Console warning `"⚠️ Supabase credentials not found. Check your .env file."` is displayed | | |
| 4 | TC_SUPABASE_004 | Verify behavior when both env vars are missing | Both env vars are missing | 1. Import the module | Console warning displayed, `createClient` still called with `undefined` args | | |
| 5 | TC_SUPABASE_005 | Verify named and default exports are identical | Valid env vars set | 1. Import named export `supabase` 2. Import default export | Both named and default exports reference the same client instance | | |
| 6 | TC_SUPABASE_006 | Verify client can execute a basic query | Valid env vars set | 1. Use `supabase.from('emails').select('*')` | Query executes without import errors; confirms client is functional | | |
| 7 | TC_SUPABASE_007 | Verify behavior with invalid URL format | Invalid URL format in `VITE_SUPABASE_URL` (e.g., `"not-a-url"`) | 1. Import the module 2. Attempt a query | Client is created but queries fail with connection error | | |
| 8 | TC_SUPABASE_008 | Verify behavior with wrong anon key | Valid URL but wrong anon key | 1. Import the module 2. Attempt a query | Query returns 401/403 authentication error | | |

---

## Module 3: AI Assistant Edge Function

**File:** `supabase/functions/ai-assistant/index.ts`

| Serial No. | Test Case ID | Description / Objective | Pre-condition | Input Steps | Expected Output | Actual Output | Result (Pass/Fail) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | TC_AIEDGE_001 | Verify CORS preflight returns 200 with headers | Edge function deployed | 1. Send `OPTIONS` request to function URL | Response status `200`, body `"ok"`, CORS headers present | | |
| 2 | TC_AIEDGE_002 | Verify CORS headers on POST responses | CORS headers configured | 1. Send any valid POST request | Response includes all 3 CORS headers | | |
| 3 | TC_AIEDGE_003 | Verify send-email route with valid payload | Resend API key valid, valid payload | 1. POST to `/send-email` with `{ to, subject, body }` | Email sent via Resend, saved to `emails` table with `folder: "Sent"`, returns `{ success: true, id }` | | |
| 4 | TC_AIEDGE_004 | Verify send-email with valid attachments | Valid payload with attachments array | 1. POST to `/send-email` with `attachments: [{ storage_path, filename }]` | Signed URL created for attachment, included in Resend payload, email sent successfully | | |
| 5 | TC_AIEDGE_005 | Verify attachment with missing storage_path is skipped | Attachment has missing `storage_path` | 1. POST with `attachments: [{ filename: "f.pdf" }]` | Invalid attachment skipped with console warning, email still sent | | |
| 6 | TC_AIEDGE_006 | Verify attachment with missing filename is skipped | Attachment has missing `filename` | 1. POST with `attachments: [{ storage_path: "p" }]` | Invalid attachment skipped, email sent | | |
| 7 | TC_AIEDGE_007 | Verify signed URL creation failure is handled gracefully | Signed URL creation fails for an attachment | 1. POST with valid attachment but invalid storage path | Failed attachment skipped (logged), email sent without it | | |
| 8 | TC_AIEDGE_008 | Verify send-email without attachments field | No attachments in payload | 1. POST to `/send-email` without `attachments` field | `resendPayload` does not include `attachments` key, email sent successfully | | |
| 9 | TC_AIEDGE_009 | Verify send-email handles Resend API error | Resend API returns error | 1. POST to `/send-email` with invalid API key | Error thrown, response status `400`, error message in body | | |
| 10 | TC_AIEDGE_010 | Verify /summarize route generates and saves summary | Valid `email_id` in database | 1. POST to `/summarize` with `{ email_id }` | Email fetched, Groq called, AI response saved to `summary` column, returns `{ success: true, data }` | | |
| 11 | TC_AIEDGE_011 | Verify /generate-reply route generates and saves draft | Valid `email_id` in database | 1. POST to `/generate-reply` with `{ email_id }` | Email fetched, Groq called, AI response saved to `ai_draft` column, returns `{ success: true, data }` | | |
| 12 | TC_AIEDGE_012 | Verify AI route handles non-existent email_id | `email_id` does not exist | 1. POST to `/summarize` with invalid id | Supabase `.single()` returns error, function errors | | |
| 13 | TC_AIEDGE_013 | Verify AI route handles missing/invalid Groq API key | Groq API key missing or invalid | 1. POST to `/summarize` | Groq API returns error, function returns 400 | | |
| 14 | TC_AIEDGE_014 | Verify AI route handles empty Groq response | Groq API returns empty choices | 1. POST to `/summarize` | Accessing `gData.choices[0].message.content` throws, caught by global catch | | |
| 15 | TC_AIEDGE_015 | Verify inbound webhook processes received email | Valid inbound webhook payload | 1. POST with `{ type: "email.received", data: { email_id } }` | Resend retrieval called, email inserted into `emails` table with `folder: "Inbox"`, returns `{ success: true }` | | |
| 16 | TC_AIEDGE_016 | Verify extractEmail strips angle brackets from sender | Inbound email `from` has angle brackets | 1. Trigger inbound webhook | `extractEmail` extracts `"user@test.com"` (without angle brackets) | | |
| 17 | TC_AIEDGE_017 | Verify extractEmail handles plain email address | Inbound email `from` is plain address | 1. Trigger inbound webhook | `extractEmail` returns `"user@test.com"` directly | | |
| 18 | TC_AIEDGE_018 | Verify recipient extraction from array `to` field | Inbound email `to` is an array | 1. Trigger webhook where `fullEmail.to` is array | `to[0]` used as recipient | | |
| 19 | TC_AIEDGE_019 | Verify default subject for missing subject | Inbound email has no subject | 1. Trigger webhook, `fullEmail.subject` is `undefined` | Subject defaults to `"(No Subject)"` | | |
| 20 | TC_AIEDGE_020 | Verify text body is used as primary content | Inbound email has `text` body | 1. Trigger webhook, `fullEmail.text` is `"Hello"` | `bodyContent` is `"Hello"` | | |
| 21 | TC_AIEDGE_021 | Verify HTML fallback when text body is absent | Inbound email has no `text` but has `html` | 1. Trigger webhook | `bodyContent` falls back to `fullEmail.html` | | |
| 22 | TC_AIEDGE_022 | Verify fallback when both text and html are absent | Inbound email has neither `text` nor `html` | 1. Trigger webhook | `bodyContent` is `"No content found"` | | |
| 23 | TC_AIEDGE_023 | Verify inbound webhook handles Resend retrieval error | Resend retrieval API returns error | 1. Trigger webhook with invalid email ID | Error thrown: `"Resend Error: <message>"`, response 400 | | |
| 24 | TC_AIEDGE_024 | Verify inbound attachments are downloaded and stored | Inbound email has attachments from Resend | 1. Trigger webhook, attachments list returned | Each attachment downloaded, uploaded to storage, metadata saved in `attachments` column | | |
| 25 | TC_AIEDGE_025 | Verify oversized attachments (>10MB) are skipped | Attachment exceeds 10MB | 1. Trigger webhook with >10MB attachment | Attachment skipped with warning, other valid attachments still processed | | |
| 26 | TC_AIEDGE_026 | Verify failed attachment download is skipped | Attachment download fails | 1. Trigger webhook, `download_url` returns non-ok | Attachment skipped, email still inserted | | |
| 27 | TC_AIEDGE_027 | Verify failed storage upload is skipped | Supabase storage upload fails for attachment | 1. Trigger webhook | Failed attachment skipped, remaining attachments processed | | |
| 28 | TC_AIEDGE_028 | Verify all failed attachments results in null | All attachments fail processing | 1. Trigger webhook, all attachments error | `inboundAttachments` set to `null`, email inserted without attachments | | |
| 29 | TC_AIEDGE_029 | Verify non-ok attachment list API is non-fatal | Attachment list API returns non-ok | 1. Trigger webhook | Warning logged, email inserted without attachments | | |
| 30 | TC_AIEDGE_030 | Verify attachment exception is non-fatal | Attachment handling throws exception | 1. Trigger webhook, catch block fires | Warning logged, email insertion continues | | |
| 31 | TC_AIEDGE_031 | Verify attachment missing download_url is skipped | Attachment missing `download_url` | 1. Trigger webhook | Attachment skipped with warning | | |
| 32 | TC_AIEDGE_032 | Verify inbound webhook handles DB insert failure | Supabase insert fails for inbound email | 1. Trigger webhook, insert returns error | Error thrown, response 400 | | |
| 33 | TC_AIEDGE_033 | Verify unknown route returns 404 | Unknown route | 1. POST to `/unknown-path` | Response status `404`, body `{ error: "Route not found" }` | | |
| 34 | TC_AIEDGE_034 | Verify malformed JSON body returns 400 | Request body is not valid JSON | 1. POST with malformed body | `req.json()` throws, caught by global catch, response 400 | | |
| 35 | TC_AIEDGE_035 | Verify behavior when SUPABASE_URL env var is missing | `SUPABASE_URL` env var is missing | 1. Deploy and call function | Supabase client created with empty string, queries fail | | |
| 36 | TC_AIEDGE_036 | Verify default content_type fallback for attachments | Attachment has no `content_type` | 1. Trigger webhook | Falls back to `"application/octet-stream"` for upload and metadata | | |

---

## Module 4: emailService

**File:** `src/services/emailService.js`

| Serial No. | Test Case ID | Description / Objective | Pre-condition | Input Steps | Expected Output | Actual Output | Result (Pass/Fail) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | TC_EMAILSERVICE_001 | Verify fetchEmails returns mapped emails for default Inbox folder | Supabase has emails in Inbox folder | 1. Call `fetchEmails()` (default folder) | Query filters by `folder = 'Inbox'`, ordered descending by `created_at`, returns mapped array with correct keys | | |
| 2 | TC_EMAILSERVICE_002 | Verify fetchEmails filters by specified folder | Supabase has emails in Sent folder | 1. Call `fetchEmails('Sent')` | Returns only emails where `folder = 'Sent'` | | |
| 3 | TC_EMAILSERVICE_003 | Verify fetchEmails returns empty array for empty folder | Folder has no emails | 1. Call `fetchEmails('Drafts')` | Returns empty array `[]` | | |
| 4 | TC_EMAILSERVICE_004 | Verify fetchEmails propagates Supabase error | Supabase query returns error | 1. Call `fetchEmails()` | Error thrown, `console.error` called with `'Error fetching emails:'` | | |
| 5 | TC_EMAILSERVICE_005 | Verify field mapping from Supabase to frontend format | Email field mapping validation | 1. Call `fetchEmails()` with known data | `sender` → `from`, `message_id` → `messageId`, `is_spam` → `isSpam`, `read_status` → `readStatus`, `created_at` → `createdAt` | | |
| 6 | TC_EMAILSERVICE_006 | Verify fetchEmailById returns single email | Valid email UUID exists | 1. Call `fetchEmailById("valid-uuid")` | Returns single email object with all fields | | |
| 7 | TC_EMAILSERVICE_007 | Verify fetchEmailById throws on non-existent UUID | Invalid/non-existent UUID | 1. Call `fetchEmailById("non-existent-uuid")` | `.single()` returns error, error thrown | | |
| 8 | TC_EMAILSERVICE_008 | Verify fetchEmailById handles null input | `null` passed as emailId | 1. Call `fetchEmailById(null)` | Error thrown | | |
| 9 | TC_EMAILSERVICE_009 | Verify markAsRead updates read_status to true | Valid unread email UUID | 1. Call `markAsRead("valid-uuid")` | `read_status` updated to `true` in database, returns `true` | | |
| 10 | TC_EMAILSERVICE_010 | Verify markAsRead is idempotent on already-read email | Already-read email | 1. Call `markAsRead("already-read-uuid")` | Still succeeds (idempotent), returns `true` | | |
| 11 | TC_EMAILSERVICE_011 | Verify markAsRead handles Supabase update failure | Supabase update fails | 1. Call `markAsRead("uuid")` with simulated error | Error thrown, logged as `'Error marking email as read:'` | | |
| 12 | TC_EMAILSERVICE_012 | Verify markAsRead behavior for non-existent email | Non-existent email UUID | 1. Call `markAsRead("invalid-uuid")` | Update affects 0 rows but no error thrown (Supabase behavior), returns `true` | | |
| 13 | TC_EMAILSERVICE_013 | Verify sendReply posts correctly mapped data to backend | FastAPI backend reachable, valid reply data | 1. Call `sendReply({ emailId, replyText, toAddress, subject })` | POST to `${API_URL}/reply` with mapped keys, returns parsed JSON response | | |
| 14 | TC_EMAILSERVICE_014 | Verify sendReply throws on non-ok backend response | Backend returns non-ok response | 1. Call `sendReply(data)` | Error thrown: `'Failed to send reply'` | | |
| 15 | TC_EMAILSERVICE_015 | Verify sendReply handles network failure | Network error reaching backend | 1. Call `sendReply(data)` with backend down | Fetch throws network error, error logged | | |
| 16 | TC_EMAILSERVICE_016 | Verify sendReply with missing required fields | Missing required fields in `replyData` | 1. Call `sendReply({})` | Request sent with `undefined` values; backend may reject | | |
| 17 | TC_EMAILSERVICE_017 | Verify analyzeOnDemand posts to correct endpoint | FastAPI backend reachable | 1. Call `analyzeOnDemand("valid-uuid")` | POST to `${API_URL}/analyze-on-demand` with `{ email_id }`, returns JSON response | | |
| 18 | TC_EMAILSERVICE_018 | Verify analyzeOnDemand throws on non-ok response | Backend returns non-ok response | 1. Call `analyzeOnDemand("id")` | Error thrown: `'Failed to start analysis'` | | |
| 19 | TC_EMAILSERVICE_019 | Verify analyzeOnDemand handles network failure | Network error | 1. Call `analyzeOnDemand("id")` with backend down | Fetch throws, error logged | | |
| 20 | TC_EMAILSERVICE_020 | Verify subscribeToEmails creates realtime channel | Supabase realtime enabled | 1. Call `subscribeToEmails(onInsert, onUpdate)` | Channel `'emails-realtime'` created, subscribed to INSERT and UPDATE events, returns channel object | | |
| 21 | TC_EMAILSERVICE_021 | Verify INSERT event triggers onInsert with mapped data | Subscription active, INSERT event fires | 1. Insert a new email into `emails` table | `onInsert` callback called with mapped email object (frontend format) | | |
| 22 | TC_EMAILSERVICE_022 | Verify UPDATE event triggers onUpdate with mapped data | Subscription active, UPDATE event fires | 1. Update an email in `emails` table | `onUpdate` callback called with mapped email object | | |
| 23 | TC_EMAILSERVICE_023 | Verify null onInsert callback is safely guarded | `onInsert` is `null`/`undefined` | 1. Call `subscribeToEmails(null, onUpdate)` 2. Trigger INSERT event | No error thrown — `if (onInsert)` guard prevents call | | |
| 24 | TC_EMAILSERVICE_024 | Verify null onUpdate callback is safely guarded | `onUpdate` is `null`/`undefined` | 1. Call `subscribeToEmails(onInsert, null)` 2. Trigger UPDATE event | No error thrown — `if (onUpdate)` guard prevents call | | |
| 25 | TC_EMAILSERVICE_025 | Verify channel unsubscribe stops events | Subscription active | 1. Call `.unsubscribe()` on returned channel | Channel unsubscribed, no more events received | | |
| 26 | TC_EMAILSERVICE_026 | Verify subscription status is logged | Subscription status logging | 1. Call `subscribeToEmails(cb1, cb2)` | Console logs `'📡 Realtime subscription status:'` with status value | | |
| 27 | TC_EMAILSERVICE_027 | Verify behavior when VITE_API_URL is not set | `VITE_API_URL` not set | 1. Call `sendReply(data)` | Fetch URL is `undefined/reply`, network error thrown | | |
| 28 | TC_EMAILSERVICE_028 | Verify INSERT payload field mapping is correct | INSERT event payload field mapping | 1. Trigger INSERT, verify mapped object | `payload.new.sender` → `from`, `payload.new.message_id` → `messageId`, etc. | | |

---

## Module 5: mailClassifier

**File:** `src/utils/mailClassifier.js`

| Serial No. | Test Case ID | Description / Objective | Pre-condition | Input Steps | Expected Output | Actual Output | Result (Pass/Fail) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | TC_MAILCLASSIFIER_001 | Verify default classification returns Primary | None | 1. Call `classifyMail({ from: "user@test.com", subject: "Hello", body: "Normal email" })` | Returns `{ folder: "Inbox", category: "Primary" }` | | |
| 2 | TC_MAILCLASSIFIER_002 | Verify "win money" triggers Spam | None | 1. Call `classifyMail({ from: "x@y.com", subject: "Win money now", body: "" })` | Returns `{ folder: "Spam", category: "" }` | | |
| 3 | TC_MAILCLASSIFIER_003 | Verify "free offer" triggers Spam | None | 1. Call with body containing `"free offer"` | Returns `{ folder: "Spam", category: "" }` | | |
| 4 | TC_MAILCLASSIFIER_004 | Verify "lottery" triggers Spam | None | 1. Call with body containing `"lottery"` | Returns `{ folder: "Spam", category: "" }` | | |
| 5 | TC_MAILCLASSIFIER_005 | Verify "click here" triggers Spam | None | 1. Call with subject containing `"click here"` | Returns `{ folder: "Spam", category: "" }` | | |
| 6 | TC_MAILCLASSIFIER_006 | Verify "earn fast" triggers Spam | None | 1. Call with body containing `"earn fast"` | Returns `{ folder: "Spam", category: "" }` | | |
| 7 | TC_MAILCLASSIFIER_007 | Verify "crypto" triggers Spam | None | 1. Call with body containing `"crypto"` | Returns `{ folder: "Spam", category: "" }` | | |
| 8 | TC_MAILCLASSIFIER_008 | Verify amazon sender triggers Promotions | None | 1. Call with `from: "deals@amazon.com"` | Returns `{ folder: "Inbox", category: "Promotions" }` | | |
| 9 | TC_MAILCLASSIFIER_009 | Verify flipkart sender triggers Promotions | None | 1. Call with `from: "offers@flipkart.com"` | Returns `{ folder: "Inbox", category: "Promotions" }` | | |
| 10 | TC_MAILCLASSIFIER_010 | Verify "sale" keyword triggers Promotions | None | 1. Call with body containing `"sale"` | Returns `{ folder: "Inbox", category: "Promotions" }` | | |
| 11 | TC_MAILCLASSIFIER_011 | Verify plain "offer" triggers Promotions not Spam | None | 1. Call with subject containing `"offer"` (not `"free offer"`) | Returns `{ folder: "Inbox", category: "Promotions" }` | | |
| 12 | TC_MAILCLASSIFIER_012 | Verify linkedin sender triggers Social | None | 1. Call with `from: "notifications@linkedin.com"` | Returns `{ folder: "Inbox", category: "Social" }` | | |
| 13 | TC_MAILCLASSIFIER_013 | Verify facebook sender triggers Social | None | 1. Call with `from: "alerts@facebook.com"` | Returns `{ folder: "Inbox", category: "Social" }` | | |
| 14 | TC_MAILCLASSIFIER_014 | Verify twitter sender triggers Social | None | 1. Call with `from: "info@twitter.com"` | Returns `{ folder: "Inbox", category: "Social" }` | | |
| 15 | TC_MAILCLASSIFIER_015 | Verify github sender triggers Updates | None | 1. Call with `from: "notifications@github.com"` | Returns `{ folder: "Inbox", category: "Updates" }` | | |
| 16 | TC_MAILCLASSIFIER_016 | Verify noreply sender triggers Updates | None | 1. Call with `from: "noreply@service.com"` | Returns `{ folder: "Inbox", category: "Updates" }` | | |
| 17 | TC_MAILCLASSIFIER_017 | Verify "login" keyword triggers Updates | None | 1. Call with body containing `"login"` | Returns `{ folder: "Inbox", category: "Updates" }` | | |
| 18 | TC_MAILCLASSIFIER_018 | Verify case-insensitive matching | None | 1. Call with `from: "WIN@MONEY.COM"` (uppercase) | Returns Spam — `.toLowerCase()` normalizes case | | |
| 19 | TC_MAILCLASSIFIER_019 | Verify spam words in from field are detected | None | 1. Call with `from: "win money@scam.com"` | Returns Spam — all fields concatenated for matching | | |
| 20 | TC_MAILCLASSIFIER_020 | Verify Spam priority over Promotions | None | 1. Call with `from: "amazon@scam.com"` and subject: `"win money"` | Returns Spam — spam check runs first | | |
| 21 | TC_MAILCLASSIFIER_021 | Verify Spam priority over Social | None | 1. Call with `from: "linkedin@scam.com"` and body: `"click here"` | Returns Spam — spam check has higher priority | | |
| 22 | TC_MAILCLASSIFIER_022 | Verify all-empty fields return Primary | None | 1. Call with empty `from`, `subject`, `body` (all `""`) | Returns `{ folder: "Inbox", category: "Primary" }` | | |
| 23 | TC_MAILCLASSIFIER_023 | Verify Promotions priority over Social | None | 1. Call with `from: "amazon-linkedin@company.com"` | Returns Promotions — promotions check runs before social | | |
| 24 | TC_MAILCLASSIFIER_024 | Verify "offer" alone is not Spam | None | 1. Call with body containing `"offer"` but NOT `"free offer"` | Returns Promotions (not Spam) | | |
| 25 | TC_MAILCLASSIFIER_025 | Verify multiple Updates keywords detected | None | 1. Call with `subject: "Your login alert from github"` | Returns Updates | | |
| 26 | TC_MAILCLASSIFIER_026 | Verify Social priority over Updates when both match | None | 1. Call with `from: "no-reply@noreply-twitter.com"` | Returns Social — social check runs before updates | | |

---

## Module 6: spamDetector

**File:** `src/utils/spamDetector.js`

| Serial No. | Test Case ID | Description / Objective | Pre-condition | Input Steps | Expected Output | Actual Output | Result (Pass/Fail) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | TC_SPAMDETECTOR_001 | Verify clean email returns false | None | 1. Call `isSpam({ subject: "Hello", body: "Normal message" })` | Score = 0, returns `false` | | |
| 2 | TC_SPAMDETECTOR_002 | Verify "free" + "win" exceeds threshold | None | 1. Call `isSpam({ subject: "Free gift", body: "Win a prize" })` | `"free"` +3, `"win"` +3 = 6 ≥ 5, returns `true` | | |
| 3 | TC_SPAMDETECTOR_003 | Verify "free" alone is below threshold | None | 1. Call `isSpam({ subject: "Free", body: "normal" })` | `"free"` +3, score = 3 < 5, returns `false` | | |
| 4 | TC_SPAMDETECTOR_004 | Verify "win" alone is below threshold | None | 1. Call `isSpam({ subject: "Win", body: "normal" })` | `"win"` +3, score = 3 < 5, returns `false` | | |
| 5 | TC_SPAMDETECTOR_005 | Verify "click here" + "urgent" is below threshold | None | 1. Call `isSpam({ subject: "Click here", body: "urgent" })` | +2 + +2 = 4 < 5, returns `false` | | |
| 6 | TC_SPAMDETECTOR_006 | Verify "free" + "click here" meets threshold | None | 1. Call `isSpam({ subject: "FREE click here", body: "" })` | +3 + +2 = 5 ≥ 5, returns `true` | | |
| 7 | TC_SPAMDETECTOR_007 | Verify `!!!` regex match scores +2 | None | 1. Call `isSpam({ subject: "Deal!!!", body: "" })` | `!!!` +2, score = 2 < 5, returns `false` | | |
| 8 | TC_SPAMDETECTOR_008 | Verify "win" + `$$$` meets threshold | None | 1. Call `isSpam({ subject: "Win $$$", body: "" })` | +3 + +2 = 5 ≥ 5, returns `true` | | |
| 9 | TC_SPAMDETECTOR_009 | Verify `!!!` + `$$$` alone is below threshold | None | 1. Call `isSpam({ subject: "!!!", body: "$$$" })` | +2 + +2 = 4 < 5, returns `false` | | |
| 10 | TC_SPAMDETECTOR_010 | Verify "free" + `!!!` + `$$$` exceeds threshold | None | 1. Call `isSpam({ subject: "FREE!!!", body: "$$$" })` | +3 + +2 + +2 = 7 ≥ 5, returns `true` | | |
| 11 | TC_SPAMDETECTOR_011 | Verify case-insensitive score accumulation | None | 1. Call `isSpam({ subject: "FREE", body: "WIN" })` | `.toLowerCase()` normalizes, +3 + +3 = 6, returns `true` | | |
| 12 | TC_SPAMDETECTOR_012 | Verify empty inputs score zero | None | 1. Call `isSpam({ subject: "", body: "" })` | Score = 0, returns `false` | | |
| 13 | TC_SPAMDETECTOR_013 | Verify multiple trigger words accumulate | None | 1. Call `isSpam({ subject: "Urgent click here", body: "free" })` | +2 + +2 + +3 = 7, returns `true` | | |
| 14 | TC_SPAMDETECTOR_014 | Verify all triggers hit produces high score | None | 1. Call `isSpam({ subject: "free win", body: "click here urgent !!!" })` | +3 + +3 + +2 + +2 + +2 = 12, returns `true` | | |
| 15 | TC_SPAMDETECTOR_015 | Verify substring matching behavior ("freedom", "winner") | None | 1. Call `isSpam({ subject: "freedom", body: "winner" })` | `"free"` in `"freedom"` +3, `"win"` in `"winner"` +3 = 6, returns `true` | | |
| 16 | TC_SPAMDETECTOR_016 | Verify exact threshold boundary (score = 5) returns true | Boundary test | 1. Call `isSpam({ subject: "click here", body: "free" })` | +2 + +3 = 5 (exact threshold), returns `true` | | |
| 17 | TC_SPAMDETECTOR_017 | Verify just-below-threshold (score = 4) returns false | Boundary test | 1. Call `isSpam({ subject: "click here urgent", body: "" })` | +2 + +2 = 4, returns `false` | | |
| 18 | TC_SPAMDETECTOR_018 | Verify includes() is not cumulative for repeated words | None | 1. Call `isSpam({ subject: "free free free", body: "" })` | `"free"` matched once by `.includes()` → +3 total, returns `false` | | |

---

## Module 7: autoReply

**File:** `src/utils/autoReply.js`

| Serial No. | Test Case ID | Description / Objective | Pre-condition | Input Steps | Expected Output | Actual Output | Result (Pass/Fail) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | TC_AUTOREPLY_001 | Verify "interview" keyword generates interview reply | None | 1. Call `generateAutoReply({ subject: "Interview Invitation" })` | Returns `"Thank you for the interview invitation. I will attend."` | | |
| 2 | TC_AUTOREPLY_002 | Verify "interview" detected in longer subject | None | 1. Call `generateAutoReply({ subject: "Schedule an interview" })` | Returns interview reply | | |
| 3 | TC_AUTOREPLY_003 | Verify "meeting" keyword generates meeting reply | None | 1. Call `generateAutoReply({ subject: "Team Meeting Tomorrow" })` | Returns `"Meeting confirmed. See you there."` | | |
| 4 | TC_AUTOREPLY_004 | Verify "support" keyword generates support reply | None | 1. Call `generateAutoReply({ subject: "Support Ticket #123" })` | Returns `"Thanks for contacting support. I will review shortly."` | | |
| 5 | TC_AUTOREPLY_005 | Verify unmatched subject returns default reply | None | 1. Call `generateAutoReply({ subject: "Hello World" })` | Returns `"Thank you for reaching out. I will respond soon."` | | |
| 6 | TC_AUTOREPLY_006 | Verify empty subject returns default reply | None | 1. Call `generateAutoReply({ subject: "" })` | Returns default reply | | |
| 7 | TC_AUTOREPLY_007 | Verify case-insensitive keyword matching | None | 1. Call `generateAutoReply({ subject: "INTERVIEW" })` | Returns interview reply — `.toLowerCase()` normalizes | | |
| 8 | TC_AUTOREPLY_008 | Verify "interview" priority over "meeting" and "support" | None | 1. Call `generateAutoReply({ subject: "Interview for Meeting Support" })` | Returns interview reply — checked first | | |
| 9 | TC_AUTOREPLY_009 | Verify "meeting" priority over "support" | None | 1. Call `generateAutoReply({ subject: "Meeting Support Required" })` | Returns meeting reply — checked before support | | |
| 10 | TC_AUTOREPLY_010 | Verify keyword detected as substring in subject | None | 1. Call `generateAutoReply({ subject: "Re: Interview Follow-up" })` | Returns interview reply | | |
| 11 | TC_AUTOREPLY_011 | Verify plural substring "interviews" matches "interview" | None | 1. Call `generateAutoReply({ subject: "interviews scheduled" })` | Returns interview reply — substring match | | |
| 12 | TC_AUTOREPLY_012 | Verify "supportive" matches "support" as substring | None | 1. Call `generateAutoReply({ subject: "supportive message" })` | Returns support reply — substring match | | |
| 13 | TC_AUTOREPLY_013 | Verify subject with no matching keywords returns default | None | 1. Call `generateAutoReply({ subject: "Quarterly Report" })` | Returns default reply | | |
| 14 | TC_AUTOREPLY_014 | Verify keyword with surrounding whitespace is detected | None | 1. Call `generateAutoReply({ subject: "   interview   " })` | Returns interview reply | | |
| 15 | TC_AUTOREPLY_015 | Verify keyword within hyphenated word is detected | None | 1. Call `generateAutoReply({ subject: "meeting-reminder" })` | Returns meeting reply | | |
