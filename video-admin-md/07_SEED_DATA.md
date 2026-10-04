# Seed Data / Initial Accounts

## Important

Các password bên dưới là thông tin mẫu theo yêu cầu. Chỉ dùng cho môi trường local/demo. Không hard-code password thật vào source code frontend hoặc commit vào Git.

## Requested accounts

| username | email | password | role |
|---|---|---|---|
| admin1 | admin1@gmail.com | 123456 | ADMIN |
| user1 | user1@gmail.com | 123456 | USER |

## Recommended bootstrap process

1. Tạo 2 user trong Supabase Auth bằng Dashboard hoặc admin provisioning script.
2. Trigger `handle_new_user()` sẽ tạo `profiles`.
3. Đổi `admin1` role thành `ADMIN` bằng SQL có quyền quản trị.

Ví dụ sau khi hai Auth users đã tồn tại:

```sql
update public.profiles
set role = 'ADMIN'
where email = 'admin1@gmail.com';

update public.profiles
set role = 'USER'
where email = 'user1@gmail.com';
```

## Sample categories

```sql
insert into public.video_categories (name, slug, description)
values
  ('Entertainment', 'entertainment', 'Entertainment videos'),
  ('Education', 'education', 'Educational videos'),
  ('Gaming', 'gaming', 'Gaming videos'),
  ('Music', 'music', 'Music videos')
on conflict (slug) do nothing;
```

## Sample tags

```sql
insert into public.video_tags (name, slug)
values
  ('Featured', 'featured'),
  ('Trending', 'trending'),
  ('New', 'new')
on conflict (slug) do nothing;
```
