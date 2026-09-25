-- ==========================================================
-- SQL Schema untuk Supabase (Buana Computer Store)
-- Jalankan script ini di: Supabase Dashboard > SQL Editor > New Query
-- URL Project: https://supabase.com/dashboard/project/zowifzglponvqdyshmph/sql
-- ==========================================================

create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  items jsonb not null default '[]'::jsonb,
  total_amount bigint not null default 0,
  payment_gateway text default 'tripay',
  payment_channel text default 'qris',
  payment_status text not null default 'PENDING',
  payment_url text,
  qris_string text,
  checkout_url text,
  tripay_reference text,
  tokopay_trx_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  paid_at timestamp with time zone
);

-- Pastikan kolom baru tetap ada jika tabel sudah pernah dibuat sebelumnya
alter table public.orders add column if not exists checkout_url text;
alter table public.orders add column if not exists tripay_reference text;
alter table public.orders add column if not exists pay_code text;
alter table public.orders add column if not exists shipping_zone text;
alter table public.orders add column if not exists shipping_fee bigint;
alter table public.orders add column if not exists refund_note text;
alter table public.orders add column if not exists refunded_at timestamp with time zone;

-- Row Level Security (RLS) agar pembeli & server bisa baca/tulis order
alter table public.orders enable row level security;

-- Policy untuk insert order baru dari checkout web
drop policy if exists "Allow anonymous create order" on public.orders;
create policy "Allow anonymous create order" on public.orders
  for insert with check (true);

-- Policy untuk membaca invoice order
drop policy if exists "Allow anonymous read order by id" on public.orders;
create policy "Allow anonymous read order by id" on public.orders
  for select using (true);

-- Policy untuk update status pembayaran (PAID)
drop policy if exists "Allow anonymous update order" on public.orders;
create policy "Allow anonymous update order" on public.orders
  for update using (true);

-- Policy untuk hapus order testing / sampah dari dashboard admin
drop policy if exists "Allow anonymous delete order" on public.orders;
create policy "Allow anonymous delete order" on public.orders
  for delete using (true);

-- Index pencarian cepat berdasarkan status dan no hp
create index if not exists idx_orders_status on public.orders(payment_status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_phone on public.orders(customer_phone);
