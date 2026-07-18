# Privacy engineering notes — Australian Privacy Principles mapping

> **Status: DRAFT.** This is engineering documentation written by the developer, not
> legal advice, and it has not been reviewed by a privacy lawyer. It maps the app's
> implemented controls to the Australian Privacy Principles (APPs, Privacy Act 1988
> (Cth)) because health information is "sensitive information" under that Act and
> attracts stronger obligations. The user-facing privacy policy lives in the app at
> `/privacy` (Chinese and English). Where a control involves legal nuance that code
> cannot settle, it is flagged **DRAFT** below rather than asserted.

Last updated: 2026-07-18.

## What the app collects

All data is entered by the user (or their family group) and stored in a Supabase
project (PostgreSQL, Singapore region) with row-level security on every table.

| Category | Where | Purpose |
| --- | --- | --- |
| Account | `profiles`, Supabase Auth | Sign-in, display name |
| Health records | `meniere_records`, `diabetes_records`, `medical_records`, `user_medications`, `voice_records` (+ private `voice-records` bucket), `daily_checkins` | The core tracking features |
| Personal/medical profile | `user_preferences` (birthday, medical history, allergies) | Profile and emergency information |
| Emergency | `emergency_contacts`, `emergency_sms_logs` (message text + GPS `location_data`) | SOS features |
| AI weekly reports | `ai_weekly_reports` | User-triggered weekly summaries |
| Weather | `weather_alerts`; browser geolocation used transiently, not stored | Severe-weather banner |
| Family collaboration | `family_members`, `family_calendar_events`, `family_reminders`, `family_expenses`, `family_messages` (+ public `family-avatars` bucket) | Household features |
| Engagement | points tables, `gomoku_rooms` | Rewards and games |
| Feedback | `user_feedback` | Support |
| Consent | `user_consents` (append-only ledger) | Record of privacy consents |

## Controls mapped to the APPs

| APP | Obligation (shorthand) | What is implemented |
| --- | --- | --- |
| APP 1 | Open and transparent management | In-app privacy policy (`/privacy`, bilingual), terms and medical disclaimer; this document in the repository. |
| APP 3 | Collect sensitive information only with consent | Signup requires an explicit agreement checkbox; after sign-in a blocking consent dialog explains what is collected and why, and the decision is written to the `user_consents` append-only ledger with a version and timestamp. Changing the consent wording bumps the version and forces re-consent. Declining signs the user out. |
| APP 5 | Notify about collection | The consent dialog itself lists categories, purposes, storage location and rights before first use; the privacy policy carries the detail, including third parties. |
| APP 6 | Use/disclose only for the collection purpose | Data is used for the app's features only; no advertising or sale. Third-party processors: Supabase (hosting), Open-Meteo (weather; no identity sent), Resend (transactional email), and an AI gateway that receives the last 7 days of records only when the user explicitly generates a weekly report. |
| APP 8 | Cross-border disclosure | Hosting region (Singapore) is disclosed in the policy and consent dialog. **DRAFT:** a formal overseas-disclosure assessment (e.g. contractual safeguards with processors) has not been done; current posture is disclosure + consent. |
| APP 10 | Quality of personal information | Users can edit every record they created, at any time, which keeps information current and accurate. |
| APP 11 | Security and destruction | RLS on all tables; private buckets for voice notes and check-in photos; points economy is server-authoritative (`SECURITY DEFINER` RPCs); env files are out of version control. Self-service account deletion (edge function) removes business rows, storage objects and the auth record, keeping one audit row in `account_deletions`. Voice notes carry a 30-day expiry design — see gaps. |
| APP 12 | Access | Every record is viewable in-app; the privacy centre (设置 → 隐私与数据) downloads all of the user's rows across every table as JSON; a doctor-oriented text export covers the clinically relevant subset. |
| APP 13 | Correction | Full in-app create/edit/delete for the user's own records; profile editing for account data. |

## Deletion in detail

`delete-account` (self-service, typed confirmation) and `admin-delete-user` share the
same server-side flow (extracted to `supabase/functions/_shared/account-deletion.ts`):
write an audit row first, delete every row matching the table/column specs — the 22
user-keyed tables plus `profiles` by `id`, `admin_notifications` by `admin_id` and
`gomoku_rooms` by both `host_id` and `guest_id` — retry failures once and abort
(account intact) if anything still fails, best-effort cleanup of the `voice-records`,
`checkin-photos` and public `family-avatars` buckets (paginated and recursing into
subfolders), then delete the auth user — which cascades the remaining FK-linked rows
(`ai_weekly_reports`, `user_notification_preferences`, `user_consents`). The consent ledger therefore
survives withdrawal but not account deletion, while the `account_deletions` audit row
survives by design.

The privacy centre additionally offers targeted erasure of emergency SMS logs
(message text and GPS location) without deleting the account.

## Known gaps and DRAFT items

1. **Migrations pending**: consent recording (`20260718020000_add_user_consents.sql`)
   and SMS-log deletion (`20260718030000_allow_users_delete_emergency_sms_logs.sql`)
   need to be applied to the live database; the UI degrades honestly until then.
   Two earlier migrations (`20260713030000`, `20260713040000`) are also written but
   not yet applied.
2. **Voice-note retention is not enforced**: `delete_expired_voice_records()` exists
   but its pg_cron schedule is commented out, so the 30-day expiry is currently a
   promise without a broom. **DRAFT:** define and enforce a retention schedule.
3. **Account-deletion blind spots — fixed in code, deploy pending**: the deletion
   flow now removes `gomoku_rooms` rows by host/guest, targets `admin_notifications`
   by its real `admin_id` column (the old wrong-column delete was silently swallowed),
   cleans the public `family-avatars` bucket, and paginates/recurses storage cleanup.
   Takes effect once `supabase functions deploy delete-account admin-delete-user` runs.
4. **`user_feedback` has no self-delete** (admin-managed; may contain free-text
   health context).
5. **Exports exclude binaries**: voice audio files and photos are exported as
   metadata/paths only, not as files.
6. **Data breach response** (Notifiable Data Breaches scheme): no documented process.
   **DRAFT.**
7. **Minors**: the policy states the app is not for under-14s without a guardian;
   there is no technical age gate. **DRAFT.**
8. **AI gateway terms**: weekly-report generation sends recent records to a
   Lovable-hosted AI gateway; the disclosure exists, but the gateway's data-handling
   terms have not been formally reviewed. **DRAFT.**
