-- Migration: voeg bounded launch controls toe aan campaign_delivery_records

alter table public.campaign_delivery_records
  add column if not exists launch_date date;

alter table public.campaign_delivery_records
  add column if not exists launch_confirmed_at timestamptz;

alter table public.campaign_delivery_records
  add column if not exists participant_comms_config jsonb;

alter table public.campaign_delivery_records
  add column if not exists reminder_config jsonb;
