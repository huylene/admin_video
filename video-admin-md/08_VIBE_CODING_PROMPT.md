# Master Prompt — Vibe Coding

Bạn là senior frontend engineer + Supabase engineer. Hãy build một website admin quản lý video với **HTML + CSS + Vanilla JavaScript only**, kết nối Supabase.

## Hard constraints

- Không dùng React.
- Không dùng Vue.
- Không dùng Angular.
- Không dùng Next.js/Nuxt.
- Không dùng TypeScript.
- Frontend thuần HTML/CSS/JavaScript.
- Có thể dùng thư viện CDN nhỏ khi cần, ví dụ Chart.js cho chart.
- Dùng Supabase JS client v2 từ CDN.
- Không dùng service role key ở frontend.

## Theme

- Light mode.
- Nền trắng.
- Modern admin dashboard.
- Clean, professional, minimal.
- Responsive.

## Pages

- Login
- Register
- Forgot Password
- Reset Password
- Dashboard
- Videos
- Video Create/Edit
- Users
- Categories
- Account

## Dashboard requirements

KPI:

- Total videos.
- Total views.
- Storage used.

Charts:

- Top 10 videos by views — bar chart.
- Views over time — line chart, filter day/month.

## Videos requirements

Table:

- ID
- Title
- Thumbnail
- Views
- Category
- Status
- Created At
- Edit
- Delete

Functions:

- Search.
- Category filter.
- Pagination.
- CRUD.
- Delete confirmation.
- Loading/error/empty states.

## Users

Admin-only page.

- List users.
- Show username/email/role/status/created_at.
- Search/filter.
- RLS-based authorization.

## Supabase data model

Use:

- `profiles`
- `video_categories`
- `videos`
- `video_views`
- `video_tags`
- `video_tag_map`
- `storage_assets`

Authentication uses Supabase Auth. Profile is linked to `auth.users.id`.

Roles:

- ADMIN
- USER

Public registration must always create USER. ADMIN is provisioned separately.

## Security

- Enable RLS for all public tables.
- Frontend must never trust a role sent by the browser.
- `is_admin()` SQL helper should be used in policies.
- Never expose `service_role` key.
- Validate all form inputs.
- Handle auth/session changes.

## Storage

Buckets:

- `videos`
- `thumbnails`

Persist file metadata to `storage_assets` so dashboard can calculate storage usage.

## Initial accounts for demo

- admin1 / admin1@gmail.com / 123456 / ADMIN
- user1 / user1@gmail.com / 123456 / USER

Treat these credentials as demo-only and do not hard-code them into client code.

## Coding style

- Use ES modules where practical.
- Small reusable functions.
- Separate UI, auth, data-access, upload, and page logic.
- Prefer semantic HTML.
- Use CSS variables for design tokens.
- Avoid duplicated SQL/query logic.
- Use async/await + try/catch.
- Add user-friendly error messages.

## Delivery order

Implement in this order:

1. Project scaffold.
2. Supabase client/config.
3. Auth + route guards.
4. Database schema/RLS.
5. Shared admin layout.
6. Video CRUD.
7. Upload/storage.
8. Dashboard metrics/charts.
9. Users/categories.
10. Account.
11. Responsive polish.
12. QA against acceptance checklist.

## Expected output from the coding agent

For each step:

- Tell me which files are created/changed.
- Output complete file contents for changed files when requested.
- Do not silently invent unsupported Supabase APIs.
- When a SQL RPC/view is needed, provide the exact SQL migration.
