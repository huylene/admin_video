# UI Page Specification

## Global Layout

### Sidebar

Menu:

- Dashboard
- Videos
- Categories
- Users (ADMIN only)
- Account
- Logout

### Topbar

- Page title.
- Search nếu cần.
- Current username/avatar.
- Responsive menu toggle trên mobile.

### Visual language

- Background: white / very light gray.
- Surface/card: white.
- Border: subtle gray.
- Text: dark charcoal.
- Primary: blue/indigo hoặc màu brand có contrast tốt.
- Success/warning/danger dùng cho trạng thái.
- Border radius khoảng 10–14px.
- Shadow rất nhẹ.

## Dashboard

### KPI cards

Mỗi card:

- Label.
- Big number.
- Supporting metric nếu có.
- Icon.

### Top 10 videos

Bar chart:

- X-axis: video title, rút gọn title khi quá dài.
- Y-axis: views.
- Tooltip hiển thị title đầy đủ và views.

### Views trend

Line chart:

- Có selector: Day / Month.
- X-axis: date/month.
- Y-axis: views.

## Videos

### Table

Columns:

| Column | Behavior |
|---|---|
| ID | Hiển thị ID ngắn; click có thể mở detail |
| Title | Text + truncate |
| Thumbnail | 48–72px preview |
| Views | Number formatted |
| Category | Badge/text |
| Status | Badge |
| Created At | Localized date |
| Action | Edit + Delete |

### Empty state

Text: `No videos found.`
CTA: `Create video` nếu user có quyền.

### Delete

Modal:

- Title: Delete video?
- Description: Hành động này không thể hoàn tác.
- Cancel
- Delete

## Login

Fields:

- Email
- Password

Actions:

- Sign in
- Forgot password
- Go to register

## Register

Fields:

- Username
- Email
- Password
- Confirm password

Role mặc định: `USER`.

> Không cho client tự chọn `ADMIN` khi register.

## Forgot password

Field:

- Email

Action:

- Send reset link

## Reset password

Fields:

- New password
- Confirm password

## Users

ADMIN only.

Columns:

- ID
- Username
- Email
- Role
- Status
- Created At
- Action

ADMIN có thể:

- Search.
- Filter role.
- Disable/enable user nếu project có yêu cầu.

## Categories

Columns:

- ID
- Name
- Slug
- Description
- Video count
- Created At
- Action

CRUD:

- Create.
- Edit.
- Delete nếu không có video liên quan.
