# Smart Mail UI (Axon Mail) — Bug & Defect Reports (UI Components)

---

## SECTION 1 — BUG REPORT

| Field | Details |
| --- | --- |
| **Bug ID** | BUG-003 |
| **Title/Summary** | Auto-scan condition in MailList has operator precedence bug causing non-Inbox emails to be scanned |
| **Description** | In `MailList.jsx` (lines 33–35), the auto-scan condition for incoming emails reads: `mail.folder === "Inbox" && mail.quarantine_status === null || mail.quarantine_status === undefined`. Due to JavaScript operator precedence, `&&` binds tighter than `||`, so this evaluates as `(mail.folder === "Inbox" && mail.quarantine_status === null) || (mail.quarantine_status === undefined)`. This means any email with `quarantine_status === undefined` — regardless of its folder (Sent, Spam, Drafts, etc.) — will pass the condition and be auto-scanned. The intended logic should wrap the `||` in parentheses: `mail.folder === "Inbox" && (mail.quarantine_status === null || mail.quarantine_status === undefined)`. Without this fix, the auto-scan feature fires unnecessarily on every email whose `quarantine_status` hasn't been set, wasting API calls and potentially flagging outbound or spam-folder emails. |
| **Severity** | High |
| **Priority** | P1 |
| **Environment** | Development (localhost:5173) · React 19 · Vite 7 · Supabase |
| **Steps to Reproduce** | 1. Log into the Axon Mail application and navigate to the Inbox so that the MailList component mounts. 2. Send an email so that a new record is created in the `emails` table with `folder: "Sent"` and `quarantine_status: null` (or undefined). 3. Open the browser Developer Tools → Console tab and add a breakpoint or log inside the `autoScanMail` call in `MailList.jsx`. 4. Observe whether the auto-scan fires for the newly sent email in the Sent folder. 5. Switch to the Sent folder and confirm the email exists there — it is not an Inbox email. 6. Verify in the console that `autoScanMail()` was invoked for this Sent-folder email, which should not happen. |
| **Expected Result** | Only emails with `folder === "Inbox"` AND `quarantine_status` of `null` or `undefined` should trigger the auto-scan. Emails in Sent, Spam, or any other folder should never be auto-scanned. |
| **Actual Result** | Any email with `quarantine_status === undefined` is auto-scanned regardless of which folder it belongs to, because the missing parentheses cause the `||` branch to bypass the folder check entirely. This results in unnecessary API calls for non-Inbox emails. |
| **Attachments** | N/A |
| **Reported by** | QA Team — Member 1 |
| **Date Reported** | 2026-04-02 |
| **Assigned to** | Development Team |
| **Status** | Open |

---

## SECTION 2 — DEFECT REPORT

| Field | Details |
| --- | --- |
| **Defect ID** | DEF-003 |
| **Project** | smart-mail-ui (Axon Mail) |
| **Product** | Axon Mail Web Application |
| **Release Version** | v1.0.0 |
| **Module** | MailView — `src/components/MailView.jsx` |
| **Test Case ID** | TC_MAILVIEW_FOLDER_BADGE (applicable to folder-label rendering in the email header) |
| **Detected Build Version** | Build 1.0.0-dev |
| **Summary** | MailView displays a hardcoded "Inbox" folder badge regardless of the email's actual folder |
| **Description** | In `MailView.jsx` (line 132), the folder badge rendered in the email header is hardcoded as `"Inbox"`. Regardless of whether the user is viewing an email from Sent, Spam, Quarantine, or any other folder, the badge always displays "Inbox". This misleads the user about which folder the email belongs to and creates confusion when reviewing quarantined or sent emails. The badge should dynamically reflect the value of `selectedMail.folder` instead of using a static string. This is a UI logic defect — the data is available in the `selectedMail` object but is not being used. |
| **Steps to Replicate** | 1. Log into the Axon Mail application. 2. Navigate to the Sent folder from the sidebar. 3. Click on any email in the Sent folder to open it in MailView. 4. Observe the folder badge in the top-right area of the email header (next to the subject line). 5. Note that the badge displays "Inbox" even though the email is from the Sent folder. 6. Repeat the test by navigating to the Spam and Quarantine folders and opening an email — the badge still reads "Inbox" in all cases. |
| **Actual Result** | The folder badge in the MailView header always displays "Inbox" as a hardcoded string, regardless of which folder the currently selected email belongs to. |
| **Expected Result** | The folder badge should dynamically display the actual folder of the selected email (e.g., "Sent", "Spam", "Quarantine") by reading `selectedMail.folder` instead of using a hardcoded "Inbox" string. |
| **Severity** | Low |
| **Priority** | P3 |
| **Reported by** | QA Team — Member 1 |
| **Assigned to** | Development Team |
| **Status** | Open |
