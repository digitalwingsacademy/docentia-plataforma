-- VideoAsset: manifiesto id logico -> proveedor + asset concreto (ADR-003).
-- El MDX referencia <Video id="..." />; esta tabla resuelve ese id sin que
-- el contenido sepa nada de Mux ni de ningun otro proveedor.
create table public.video_assets (
  logical_id text primary key,
  provider text not null default 'mux',
  provider_asset_id text not null,
  playback_id text not null,
  duration_seconds integer,
  captions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.video_assets enable row level security;

create policy "usuarios autenticados leen el manifiesto de video"
  on public.video_assets for select
  using (auth.role() = 'authenticated');
