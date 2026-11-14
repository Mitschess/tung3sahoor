-- MOMCARE: skema awal Supabase.
-- Jalankan sekali di Supabase → SQL Editor (atau `supabase db push`). Aman dijalankan ulang.
--
-- Isi tabel mengikuti bentuk data di aplikasi (src/lib/types.ts): kolom kamus data disimpan
-- sebagai jsonb supaya 28 tabel kamus tidak perlu dibuat satu per satu.
-- Hak akses (RLS) meniru src/lib/akses.ts. Bila BOLEH_ISI di sana diubah, ubah juga boleh_isi() di sini.

create extension if not exists pgcrypto with schema extensions;

-- ───────────────────────── Tabel ─────────────────────────

create table if not exists public.ibu (
  id text primary key,
  profil jsonb not null default '{}',
  keluarga jsonb not null default '{}',
  nik_hash text not null default '',
  nik_samaran text not null default '–',
  persetujuan jsonb not null,
  wilayah_posyandu text generated always as (profil ->> 'wilayah_posyandu') stored,
  dibuat_pada timestamptz not null default now()
);
-- Satu NIK hanya untuk satu ibu (NIK kosong boleh berulang).
create unique index if not exists ibu_nik_unik on public.ibu (nik_hash) where nik_hash <> '';
create index if not exists ibu_wilayah on public.ibu (wilayah_posyandu);

create table if not exists public.pengguna (
  id uuid primary key references auth.users (id) on delete cascade,
  nama text not null,
  peran text not null check (peran in ('ibu', 'kader', 'bidan', 'dokter')),
  -- Kader: satu posyandu. Bidan: wilayah kerja. Dokter: null (seluruh puskesmas).
  posyandu text[],
  -- Akun ibu ditautkan ke satu baris ibu.
  ibu_id text unique references public.ibu (id) on delete set null,
  telepon text,
  keterangan text,
  dibuat_pada timestamptz not null default now()
);

create table if not exists public.catatan (
  id text primary key,
  tabel text not null,
  ibu_id text not null references public.ibu (id) on delete cascade,
  anak_id text,
  data jsonb not null default '{}',
  meta jsonb not null,
  dibuat_pada timestamptz not null default now()
);
create index if not exists catatan_ibu on public.catatan (ibu_id);

-- Peringatan dihitung di aplikasi; yang disimpan hanya peringatan yang sudah DITUTUP bidan/dokter.
create table if not exists public.status_peringatan (
  id text primary key,
  ibu_id text not null references public.ibu (id) on delete cascade,
  oleh uuid not null references public.pengguna (id),
  pada timestamptz not null default now(),
  catatan text not null
);

create table if not exists public.pengingat (
  id text primary key,
  ibu_id text not null references public.ibu (id) on delete cascade,
  ke text not null check (ke in ('ibu', 'pendamping')),
  telepon text not null,
  pesan text not null,
  oleh uuid not null references public.pengguna (id),
  pada timestamptz not null default now()
);

-- ───────────────────────── Fungsi bantu hak akses ─────────────────────────
-- security definer: dibaca tanpa terkena RLS tabel pengguna sendiri (mencegah rekursi).

create or replace function public.peran_saya() returns text
language sql stable security definer set search_path = '' as $$
  select peran from public.pengguna where id = auth.uid()
$$;

create or replace function public.posyandu_saya() returns text[]
language sql stable security definer set search_path = '' as $$
  select coalesce(posyandu, '{}') from public.pengguna where id = auth.uid()
$$;

create or replace function public.ibu_saya() returns text
language sql stable security definer set search_path = '' as $$
  select ibu_id from public.pengguna where id = auth.uid()
$$;

-- Kader hanya ibu di posyandunya; bidan di wilayah kerjanya; dokter seluruh puskesmas; ibu hanya dirinya.
create or replace function public.boleh_lihat_ibu(p_ibu text) returns boolean
language sql stable security definer set search_path = '' as $$
  select case public.peran_saya()
    when 'dokter' then true
    when 'ibu' then p_ibu = public.ibu_saya()
    when 'kader' then exists (select 1 from public.ibu i where i.id = p_ibu and i.wilayah_posyandu = any (public.posyandu_saya()))
    when 'bidan' then exists (select 1 from public.ibu i where i.id = p_ibu and i.wilayah_posyandu = any (public.posyandu_saya()))
    else false
  end
$$;

-- Tabel kamus yang boleh DIISI/DIUBAH tiap peran (salinan BOLEH_ISI di src/lib/akses.ts).
create or replace function public.boleh_isi(p_tabel text) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_tabel = any (case public.peran_saya()
    when 'ibu' then array['pemantauan_hamil', 'pemantauan_nifas', 'pemantauan_bayi', 'persiapan', 'kb', 'ttd', 'tinja', 'kelas_hamil']
    when 'kader' then array['ibu', 'keluarga', 'anc', 'kf', 'kn', 'tindak_lanjut', 'kelas_hamil', 'persiapan']
    when 'bidan' then array['ibu', 'keluarga', 'riwayat', 'anc', 'lab_t1', 'preeklamsia', 'dm', 'persalinan', 'bayi_lahir',
                            'kf', 'kn', 'imunisasi', 'amanat', 'riwayat_persalinan', 'tindak_lanjut', 'persiapan', 'kelas_hamil']
    when 'dokter' then array['dokter_t1', 'dokter_t3', 'dm', 'rujukan', 'preeklamsia', 'tindak_lanjut']
    else array[]::text[]
  end)
$$;

-- ───────────────────────── Row Level Security ─────────────────────────

alter table public.ibu enable row level security;
alter table public.pengguna enable row level security;
alter table public.catatan enable row level security;
alter table public.status_peringatan enable row level security;
alter table public.pengingat enable row level security;

drop policy if exists "ibu: lihat" on public.ibu;
create policy "ibu: lihat" on public.ibu for select to authenticated using (public.boleh_lihat_ibu(id));
drop policy if exists "ibu: daftarkan" on public.ibu;
create policy "ibu: daftarkan" on public.ibu for insert to authenticated
  with check (public.boleh_isi('ibu') and profil ->> 'wilayah_posyandu' = any (public.posyandu_saya()));
drop policy if exists "ibu: ubah" on public.ibu;
create policy "ibu: ubah" on public.ibu for update to authenticated
  using (public.boleh_isi('ibu') and public.boleh_lihat_ibu(id))
  with check (public.boleh_isi('ibu') and profil ->> 'wilayah_posyandu' = any (public.posyandu_saya()));

-- Nama petugas terlihat oleh semua akun (untuk "diisi oleh …"). Akun ibu hanya terlihat oleh dirinya
-- dan petugas yang boleh melihat ibu tersebut. Baris pengguna hanya dibuat oleh trigger pendaftaran.
drop policy if exists "pengguna: lihat" on public.pengguna;
create policy "pengguna: lihat" on public.pengguna for select to authenticated using (
  id = auth.uid()
  or peran <> 'ibu'
  or (ibu_id is not null and public.peran_saya() <> 'ibu' and public.boleh_lihat_ibu(ibu_id))
);

drop policy if exists "catatan: lihat" on public.catatan;
create policy "catatan: lihat" on public.catatan for select to authenticated using (public.boleh_lihat_ibu(ibu_id));
drop policy if exists "catatan: isi" on public.catatan;
create policy "catatan: isi" on public.catatan for insert to authenticated with check (
  (
    public.boleh_isi(tabel)
    -- Kader menyalin data kehamilan dari Buku KIA saat mendaftarkan ibu (store.daftarIbu); mengubahnya tetap bidan.
    or (tabel = 'riwayat' and public.peran_saya() = 'kader')
  )
  and public.boleh_lihat_ibu(ibu_id)
  and meta ->> 'dibuat_oleh' = auth.uid()::text
  -- Hasil foto Buku KIA hanya boleh dikonfirmasi kader/nakes.
  and (meta ->> 'sumber' is distinct from 'foto (OCR)' or public.peran_saya() <> 'ibu')
);
drop policy if exists "catatan: ubah" on public.catatan;
create policy "catatan: ubah" on public.catatan for update to authenticated
  using (public.boleh_isi(tabel) and public.boleh_lihat_ibu(ibu_id))
  with check (public.boleh_isi(tabel) and public.boleh_lihat_ibu(ibu_id));

drop policy if exists "status: lihat" on public.status_peringatan;
create policy "status: lihat" on public.status_peringatan for select to authenticated using (public.boleh_lihat_ibu(ibu_id));
drop policy if exists "status: tutup" on public.status_peringatan;
create policy "status: tutup" on public.status_peringatan for insert to authenticated
  with check (public.peran_saya() in ('bidan', 'dokter') and public.boleh_lihat_ibu(ibu_id) and oleh = auth.uid());
drop policy if exists "status: buka lagi" on public.status_peringatan;
create policy "status: buka lagi" on public.status_peringatan for delete to authenticated
  using (public.peran_saya() in ('bidan', 'dokter') and public.boleh_lihat_ibu(ibu_id));

drop policy if exists "pengingat: lihat" on public.pengingat;
create policy "pengingat: lihat" on public.pengingat for select to authenticated
  using (public.peran_saya() <> 'ibu' and public.boleh_lihat_ibu(ibu_id));
drop policy if exists "pengingat: catat" on public.pengingat;
create policy "pengingat: catat" on public.pengingat for insert to authenticated
  with check (public.peran_saya() <> 'ibu' and public.boleh_lihat_ibu(ibu_id) and oleh = auth.uid());

-- Hanya akun yang sudah masuk yang bisa menyentuh data; anon tidak sama sekali.
revoke all on public.ibu, public.pengguna, public.catatan, public.status_peringatan, public.pengingat from anon;
grant select, insert, update on public.ibu to authenticated;
grant select on public.pengguna to authenticated;
grant select, insert, update on public.catatan to authenticated;
grant select, insert, delete on public.status_peringatan to authenticated;
grant select, insert on public.pengingat to authenticated;
grant execute on function public.peran_saya, public.posyandu_saya, public.ibu_saya, public.boleh_lihat_ibu, public.boleh_isi to authenticated;

-- ───────────────────────── Pendaftaran akun ─────────────────────────
-- Aplikasi memanggil supabase.auth.signUp dengan data diri di user_metadata. Trigger di bawah
-- membuat baris pengguna (dan baris ibu) dalam transaksi yang sama, jadi tidak ada akun setengah jadi.

-- 1) Sebelum disimpan: NIK mentah diganti hash SHA-256 + samaran, sehingga tidak pernah tersimpan.
create or replace function public.saring_nik_pendaftar() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_nik text := regexp_replace(coalesce(new.raw_user_meta_data ->> 'nik', ''), '\D', '', 'g');
begin
  if new.raw_user_meta_data ? 'nik' then
    new.raw_user_meta_data := (new.raw_user_meta_data - 'nik') || case when v_nik = '' then '{}'::jsonb else jsonb_build_object(
      'nik_hash', encode(extensions.digest(v_nik, 'sha256'), 'hex'),
      'nik_samaran', repeat('•', greatest(length(v_nik) - 4, 0)) || right(v_nik, 4)
    ) end;
  end if;
  return new;
end
$$;

-- 2) Setelah akun dibuat: buat profil pengguna. Ibu ditautkan ke data yang sudah didaftarkan
--    kader/bidan bila NIK dan tanggal lahirnya sama; bila belum ada, dibuatkan data ibu baru.
create or replace function public.buat_pengguna_baru() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}');
  v_peran text := coalesce(m ->> 'peran', '');
  v_nama text := nullif(btrim(m ->> 'nama'), '');
  v_ibu text;
  v_pos text[];
begin
  -- Akun tanpa peran (mis. dibuat manual di dasbor) dilewati; profilnya bisa diisi belakangan.
  if v_peran = '' then
    return new;
  end if;
  if v_nama is null then
    raise exception 'MOMCARE: nama wajib diisi';
  end if;

  if v_peran = 'ibu' then
    if coalesce(m ->> 'nik_hash', '') = '' then
      raise exception 'MOMCARE: NIK wajib diisi';
    end if;
    select i.id into v_ibu from public.ibu i
      where i.nik_hash = m ->> 'nik_hash'
        and i.profil ->> 'tanggal_lahir' = m ->> 'tanggal_lahir'
        and not exists (select 1 from public.pengguna p where p.ibu_id = i.id);
    if v_ibu is null then
      if exists (select 1 from public.ibu i where i.nik_hash = m ->> 'nik_hash') then
        raise exception 'MOMCARE: NIK sudah terdaftar';
      end if;
      v_ibu := 'i_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
      insert into public.ibu (id, profil, keluarga, nik_hash, nik_samaran, persetujuan) values (
        v_ibu,
        jsonb_strip_nulls(jsonb_build_object(
          'ibu_id', v_ibu,
          'nama', v_nama,
          'tanggal_lahir', m ->> 'tanggal_lahir',
          'telepon', m ->> 'telepon',
          'wilayah_posyandu', m ->> 'posyandu',
          'puskesmas_domisili', m ->> 'puskesmas',
          'faskes_tk1', m ->> 'puskesmas',
          'persetujuan_tanggal', current_date::text
        )),
        '{}',
        m ->> 'nik_hash',
        coalesce(m ->> 'nik_samaran', '–'),
        jsonb_build_object('tanggal', current_date::text, 'versi', coalesce(m ->> 'versi_persetujuan', '-'), 'saksi', new.id::text)
      );
    end if;
    insert into public.pengguna (id, nama, peran, ibu_id, telepon)
      values (new.id, v_nama, 'ibu', v_ibu, m ->> 'telepon');

  elsif v_peran in ('kader', 'bidan', 'dokter') then
    if v_peran <> 'dokter' then
      v_pos := array(select jsonb_array_elements_text(coalesce(m -> 'posyandu', '[]')));
      if coalesce(array_length(v_pos, 1), 0) = 0 then
        raise exception 'MOMCARE: pilih posyandu';
      end if;
      if v_peran = 'kader' and array_length(v_pos, 1) > 1 then
        raise exception 'MOMCARE: kader hanya untuk satu posyandu';
      end if;
    end if;
    insert into public.pengguna (id, nama, peran, posyandu, telepon, keterangan)
      values (new.id, v_nama, v_peran, v_pos, m ->> 'telepon', nullif(btrim(m ->> 'keterangan'), ''));
  else
    raise exception 'MOMCARE: peran tidak dikenal';
  end if;
  return new;
end
$$;

drop trigger if exists momcare_saring_nik on auth.users;
create trigger momcare_saring_nik before insert on auth.users
  for each row execute function public.saring_nik_pendaftar();

drop trigger if exists momcare_pengguna_baru on auth.users;
create trigger momcare_pengguna_baru after insert on auth.users
  for each row execute function public.buat_pengguna_baru();

-- Fungsi trigger tidak perlu dipanggil langsung oleh klien.
revoke execute on function public.saring_nik_pendaftar, public.buat_pengguna_baru from public, anon, authenticated;

-- ───────────────────────── Realtime ─────────────────────────
-- Isian ibu di HP langsung muncul di web petugas (dan sebaliknya). RLS tetap berlaku.
do $$
declare t text;
begin
  foreach t in array array['ibu', 'catatan', 'status_peringatan', 'pengguna'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end
$$;
