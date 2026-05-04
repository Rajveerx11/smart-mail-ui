alter table public.emails
  add column if not exists quarantine_status boolean,
  add column if not exists quarantine_reason text,
  add column if not exists phishing_score integer;

alter table public.emails
  alter column quarantine_status set default false;

update public.emails
set quarantine_status = false
where quarantine_status is null;
