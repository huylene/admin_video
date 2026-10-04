# Acceptance Checklist

## Authentication

- [ ] Login works with valid Supabase Auth credentials.
- [ ] Wrong password shows a useful error.
- [ ] Register creates a USER profile.
- [ ] Client cannot register as ADMIN.
- [ ] Forgot password sends recovery email.
- [ ] Reset password updates Auth password.
- [ ] Auth session persists after refresh.
- [ ] Logout clears session.

## Authorization

- [ ] USER cannot open admin-only Users page.
- [ ] USER cannot CRUD videos through direct Supabase calls.
- [ ] USER cannot mutate categories.
- [ ] ADMIN can perform all intended management actions.
- [ ] RLS policies are tested independently of UI.

## Dashboard

- [ ] Total video count is correct.
- [ ] Total views is correct.
- [ ] Storage value is based on tracked asset sizes.
- [ ] Top 10 chart matches DB ordering.
- [ ] Views trend changes between day/month modes.
- [ ] Loading/empty/error states exist.

## Videos

- [ ] List renders thumbnail correctly.
- [ ] Search works.
- [ ] Category filter works.
- [ ] Pagination works.
- [ ] Create video works.
- [ ] Edit video works.
- [ ] Delete asks for confirmation.
- [ ] Delete cleans up associated files.
- [ ] Invalid uploads are rejected.

## Users

- [ ] User list loads only for authorized users.
- [ ] Role is displayed clearly.
- [ ] Search/filter works.

## UI/UX

- [ ] Light theme only.
- [ ] Responsive on desktop/tablet/mobile.
- [ ] Buttons have hover/focus states.
- [ ] Forms have labels and validation messages.
- [ ] Tables remain usable on narrow screens.
- [ ] No JavaScript errors in browser console during normal flows.
