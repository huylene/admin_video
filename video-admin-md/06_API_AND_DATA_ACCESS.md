# Data Access / JavaScript Architecture

## Recommended frontend structure

```text
video-admin/
├── index.html
├── login.html
├── register.html
├── forgot-password.html
├── reset-password.html
├── dashboard.html
├── videos.html
├── video-edit.html
├── users.html
├── categories.html
├── account.html
├── assets/
│   ├── css/
│   │   ├── reset.css
│   │   ├── variables.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   └── pages.css
│   ├── js/
│   │   ├── config.js
│   │   ├── supabase.js
│   │   ├── auth.js
│   │   ├── guards.js
│   │   ├── api.js
│   │   ├── dashboard.js
│   │   ├── videos.js
│   │   ├── users.js
│   │   ├── categories.js
│   │   ├── account.js
│   │   ├── upload.js
│   │   └── ui.js
│   └── img/
└── README.md
```

## Supabase initialization

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="assets/js/config.js"></script>
<script src="assets/js/supabase.js"></script>
```

`config.js`:

```js
window.APP_CONFIG = {
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY'
};
```

`supabase.js`:

```js
const { createClient } = supabase;
window.sb = createClient(
  window.APP_CONFIG.supabaseUrl,
  window.APP_CONFIG.supabaseAnonKey
);
```

## Data layer

Tạo các function reusable:

```js
async function getVideos({ search = '', categoryId = null, page = 1, pageSize = 20 } = {}) {}
async function getVideoById(id) {}
async function createVideo(payload) {}
async function updateVideo(id, payload) {}
async function deleteVideo(id) {}
async function getDashboardMetrics() {}
async function getTopVideos(limit = 10) {}
async function getViewsTrend({ groupBy = 'day' } = {}) {}
```

## Dashboard query ideas

Total videos:

```js
const { count, error } = await sb
  .from('videos')
  .select('*', { count: 'exact', head: true });
```

Total views:

```js
const { data, error } = await sb
  .from('videos')
  .select('views');

const totalViews = (data ?? []).reduce((sum, item) => sum + Number(item.views || 0), 0);
```

Top 10:

```js
const { data, error } = await sb
  .from('videos')
  .select('id,title,views')
  .order('views', { ascending: false })
  .limit(10);
```

Views trend: nên dùng SQL View/RPC để group by ngày/tháng khi dataset lớn.

## Delete safety

Luôn confirm trước delete và handle:

- Permission denied.
- Foreign key constraints.
- Storage cleanup errors.
- Network errors.
