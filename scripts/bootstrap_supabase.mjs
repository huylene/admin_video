/**
 * Automated Supabase Provisioning Script
 * Uses Supabase Auth Admin API & PostgREST API with service_role key
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://droplgierneghjqdxgcx.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`
};

async function main() {
  console.log('--- BẮT ĐẦU TỰ ĐỘNG THIẾT LẬP SUPABASE CHO ADMIN & USER ---');

  // 1. Check & Create Accounts via Auth Admin API
  console.log('\n[1/4] Kiểm tra tài khoản Auth...');
  const usersRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, { headers });
  if (!usersRes.ok) {
    const txt = await usersRes.text();
    throw new Error(`Failed to list users: ${usersRes.status} ${txt}`);
  }
  const usersData = await usersRes.json();
  const existingUsers = usersData.users || [];

  const targetAccounts = [
    { email: 'admin1@gmail.com', password: '123456', username: 'admin1', role: 'ADMIN' },
    { email: 'user1@gmail.com', password: '123456', username: 'user1', role: 'USER' }
  ];

  for (const acc of targetAccounts) {
    const existing = existingUsers.find(u => u.email === acc.email);
    if (!existing) {
      console.log(`> Đang tạo mới tài khoản: ${acc.email} (${acc.role})...`);
      const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: acc.email,
          password: acc.password,
          email_confirm: true,
          user_metadata: { username: acc.username }
        })
      });
      if (!createRes.ok) {
        console.warn(`! Không thể tạo ${acc.email}:`, await createRes.text());
      } else {
        const created = await createRes.json();
        console.log(`✓ Đã tạo thành công user: ${acc.email} (ID: ${created.id})`);
      }
    } else {
      console.log(`> Tài khoản ${acc.email} đã tồn tại. Đang cập nhật mật khẩu và xác nhận email...`);
      const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${existing.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          password: acc.password,
          email_confirm: true,
          user_metadata: { username: acc.username }
        })
      });
      if (updateRes.ok) {
        console.log(`✓ Đã cập nhật thành công user ${acc.email}`);
      }
    }
  }

  // Allow trigger a moment to process
  await new Promise(r => setTimeout(r, 1000));

  // 2. Set Profile Roles in Database
  console.log('\n[2/4] Cập nhật vai trò (Role) trong bảng profiles...');
  for (const acc of targetAccounts) {
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(acc.email)}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        role: acc.role,
        username: acc.username
      })
    });

    if (patchRes.ok) {
      const data = await patchRes.json();
      console.log(`✓ Đã gán role [${acc.role}] cho ${acc.email}:`, data);
    } else {
      console.warn(`! Không thể cập nhật role cho ${acc.email}:`, await patchRes.text());
    }
  }

  // 3. Check & Seed Categories
  console.log('\n[3/4] Kiểm tra danh mục video...');
  const catRes = await fetch(`${SUPABASE_URL}/rest/v1/video_categories?select=*`, { headers });
  if (catRes.ok) {
    const cats = await catRes.json();
    console.log(`> Hiện có ${cats.length} danh mục trong database.`);
    if (cats.length === 0) {
      console.log('> Đang thêm các danh mục mẫu...');
      await fetch(`${SUPABASE_URL}/rest/v1/video_categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify([
          { name: 'Entertainment', slug: 'entertainment', description: 'Video giải trí & hài hước' },
          { name: 'Education', slug: 'education', description: 'Video giáo dục & hướng dẫn học tập' },
          { name: 'Gaming', slug: 'gaming', description: 'Gameplay, review game và stream' },
          { name: 'Music', slug: 'music', description: 'Âm nhạc, MV ca nhạc và acoustic' }
        ])
      });
      console.log('✓ Đã nạp thành công các danh mục mẫu.');
    }
  }

  // 4. Check & Create Storage Buckets
  console.log('\n[4/4] Kiểm tra Storage Buckets...');
  const bucketsRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, { headers });
  if (bucketsRes.ok) {
    const buckets = await bucketsRes.json();
    const bucketNames = buckets.map(b => b.name);
    console.log('> Các bucket hiện có:', bucketNames);

    for (const bName of ['videos', 'thumbnails', 'avatars']) {
      if (!bucketNames.includes(bName)) {
        console.log(`> Đang tạo bucket: ${bName}...`);
        await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ id: bName, name: bName, public: true })
        });
        console.log(`✓ Đã tạo bucket ${bName}`);
      }
    }
  }

  console.log('\n=== HOÀN TẤT THIẾT LẬP TOÀN BỘ HỆ THỐNG TRÊN SUPABASE ===');
}

main().catch(err => {
  console.error('Lỗi khi chạy script:', err);
  process.exit(1);
});
