# Authentication & Row Level Security

## 1. Authentication

Dùng Supabase Auth:

- `signInWithPassword`
- `signUp`
- `resetPasswordForEmail`
- `updateUser`
- `getSession`
- `onAuthStateChange`

Frontend không tự lưu password vào localStorage.

## 2. Role

Profile role:

- `ADMIN`
- `USER`

Helper function:

```sql
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'ADMIN'
  );
$$;
```

## 3. Enable RLS

```sql
alter table public.profiles enable row level security;
alter table public.video_categories enable row level security;
alter table public.videos enable row level security;
alter table public.video_views enable row level security;
alter table public.video_tags enable row level security;
alter table public.video_tag_map enable row level security;
alter table public.storage_assets enable row level security;
```

## 4. Example policies

Profiles: user chỉ xem/sửa chính mình; admin xem toàn bộ.

```sql
create policy "profiles_select_self_or_admin"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

create policy "profiles_update_self"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);
```

Categories:

```sql
create policy "categories_read_authenticated"
on public.video_categories
for select
to authenticated
using (true);

create policy "categories_admin_insert"
on public.video_categories
for insert
to authenticated
with check (public.is_admin());

create policy "categories_admin_update"
on public.video_categories
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "categories_admin_delete"
on public.video_categories
for delete
 to authenticated
using (public.is_admin());
```

Videos:

```sql
create policy "videos_read_authenticated"
on public.videos
for select
 to authenticated
using (true);

create policy "videos_admin_insert"
on public.videos
for insert
 to authenticated
with check (public.is_admin());

create policy "videos_admin_update"
on public.videos
for update
 to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "videos_admin_delete"
on public.videos
for delete
 to authenticated
using (public.is_admin());
```

Views:

```sql
create policy "video_views_insert_authenticated"
on public.video_views
for insert
 to authenticated
with check (viewer_id = auth.uid());

create policy "video_views_admin_read"
on public.video_views
for select
 to authenticated
using (public.is_admin());
```

## 5. Important security rules

- Tuyệt đối không đưa `SUPABASE_SERVICE_ROLE_KEY` vào frontend.
- Không tin role được gửi từ browser.
- Không cho public register tự gửi role `ADMIN`.
- RLS phải là lớp bảo vệ thực tế.
- Delete video cần xét cả database row và file trong Storage.
