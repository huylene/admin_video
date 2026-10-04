/**
 * Seed Demo Videos, Storage Assets & View Logs into Supabase
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://droplgierneghjqdxgcx.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Prefer': 'return=representation'
};

async function seed() {
  console.log('--- ĐANG TỰ ĐỘNG NẠP DỮ LIỆU MẪU VIDEO & THỐNG KÊ LÊN SUPABASE ---');

  // 1. Get Categories
  const catRes = await fetch(`${SUPABASE_URL}/rest/v1/video_categories?select=*`, { headers });
  const cats = await catRes.json();
  const catMap = {};
  cats.forEach(c => { catMap[c.slug] = c.id; });

  // 2. Get Admin Profile ID
  const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.admin1@gmail.com&select=id`, { headers });
  const profs = await profRes.json();
  const adminId = profs && profs[0] ? profs[0].id : null;

  console.log(`> Admin ID: ${adminId}`);

  // Sample Videos Data
  const sampleVideos = [
    {
      title: 'Hướng dẫn xây dựng Website Admin với Vanilla JavaScript',
      slug: 'huong-dan-xay-dung-website-admin-voi-vanilla-javascript',
      description: 'Khóa học thực chiến xây dựng ứng dụng quản trị hoàn chỉnh không dùng framework cồng kềnh.',
      category_id: catMap['education'] || cats[0]?.id,
      duration_seconds: 1420,
      views: 28450,
      status: 'published',
      created_by: adminId,
      thumbnail_path: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=80',
      video_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      size_mb: 85.4
    },
    {
      title: 'Kỹ thuật tối ưu hóa PostgreSQL & Supabase RLS nâng cao',
      slug: 'ky-thuat-toi-uu-hoa-postgresql-supabase-rls-nang-cao',
      description: 'Bí quyết tăng tốc truy vấn database và thiết lập bảo mật Row Level Security an toàn tuyệt đối.',
      category_id: catMap['education'] || cats[0]?.id,
      duration_seconds: 960,
      views: 19820,
      status: 'published',
      created_by: adminId,
      thumbnail_path: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
      video_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      size_mb: 64.2
    },
    {
      title: 'Highlights Chung Kết Thế Giới Gaming Championship 2026',
      slug: 'highlights-chung-ket-the-gioi-gaming-championship-2026',
      description: 'Những pha xử lý xuất thần và những khoảnh khắc kịch tính nhất trận chung kết.',
      category_id: catMap['gaming'] || cats[0]?.id,
      duration_seconds: 680,
      views: 45200,
      status: 'published',
      created_by: adminId,
      thumbnail_path: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      video_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      size_mb: 112.5
    },
    {
      title: 'Top 10 Khoảnh Khắc Hài Hước Nhất Tuần',
      slug: 'top-10-khoanh-khac-hai-huoc-nhat-tuan',
      description: 'Tuyển tập những video giải trí cười vỡ bụng được cộng đồng mạng chia sẻ nhiều nhất.',
      category_id: catMap['entertainment'] || cats[0]?.id,
      duration_seconds: 450,
      views: 34100,
      status: 'published',
      created_by: adminId,
      thumbnail_path: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
      video_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      size_mb: 48.0
    },
    {
      title: 'Acoustic Chill Lofi Beat — Giai Điệu Thư Giãn Cuối Tuần',
      slug: 'acoustic-chill-lofi-beat-giai-dieu-thu-gian-cuoi-tuan',
      description: 'Âm nhạc nhẹ nhàng giúp bạn tập trung làm việc, học tập và thư giãn tâm trí.',
      category_id: catMap['music'] || cats[0]?.id,
      duration_seconds: 1850,
      views: 52100,
      status: 'published',
      created_by: adminId,
      thumbnail_path: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      video_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      size_mb: 145.8
    },
    {
      title: 'Review Chi Tiết Tựa Game Nhập Vai Thế Giới Mở Mới Nhất',
      slug: 'review-chi-tiet-tua-game-nhap-vai-the-gioi-mo-moi-nhat',
      description: 'Đánh giá đồ họa, cốt truyện, gameplay và hiệu năng trên các dòng máy cấu hình cao.',
      category_id: catMap['gaming'] || cats[0]?.id,
      duration_seconds: 840,
      views: 16750,
      status: 'published',
      created_by: adminId,
      thumbnail_path: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
      video_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      size_mb: 72.0
    },
    {
      title: 'Tổng Hợp Nhạc EDM Sôi Động Cho Buổi Tập Luyện',
      slug: 'tong-hop-nhac-edm-soi-dong-cho-buoi-tap-luyen',
      description: 'Nạp đầy năng lượng cho buổi gym và chạy bộ với những bản remix sôi động đỉnh cao.',
      category_id: catMap['music'] || cats[0]?.id,
      duration_seconds: 1200,
      views: 22900,
      status: 'published',
      created_by: adminId,
      thumbnail_path: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      video_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      size_mb: 98.6
    },
    {
      title: 'Bản Nháp: Kịch Bản Chương Trình Đổi Mới Công Nghệ 2026',
      slug: 'ban-nhap-kich-ban-chuong-trinh-doi-moi-cong-nghe-2026',
      description: 'Video nội bộ đang trong quá trình biên tập và chờ phê duyệt xuất bản.',
      category_id: catMap['education'] || cats[0]?.id,
      duration_seconds: 320,
      views: 120,
      status: 'draft',
      created_by: adminId,
      thumbnail_path: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      video_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      size_mb: 32.5
    }
  ];

  console.log(`\n[1/3] Đang thêm ${sampleVideos.length} video mẫu...`);
  const insertedVideos = [];

  for (const v of sampleVideos) {
    const { size_mb, ...videoPayload } = v;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/videos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(videoPayload)
    });

    if (res.ok) {
      const data = await res.json();
      const video = data[0];
      insertedVideos.push({ ...video, size_mb });
      console.log(`✓ Đã thêm video: "${video.title}" (Views: ${video.views})`);
    } else {
      console.warn(`! Thêm video "${v.title}" thất bại:`, await res.text());
    }
  }

  // 2. Insert Storage Assets for size tracking
  console.log('\n[2/3] Ghi nhận dung lượng Storage (storage_assets)...');
  for (const v of insertedVideos) {
    const sizeBytes = Math.round(v.size_mb * 1024 * 1024);
    await fetch(`${SUPABASE_URL}/rest/v1/storage_assets`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        video_id: v.id,
        bucket: 'videos',
        path: `videos/sample/${v.slug}.mp4`,
        asset_type: 'video',
        size_bytes: sizeBytes,
        mime_type: 'video/mp4'
      })
    });

    // Also record thumbnail asset (approx 150KB)
    await fetch(`${SUPABASE_URL}/rest/v1/storage_assets`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        video_id: v.id,
        bucket: 'thumbnails',
        path: `thumbnails/sample/${v.slug}.webp`,
        asset_type: 'thumbnail',
        size_bytes: 154200,
        mime_type: 'image/webp'
      })
    });
  }
  console.log('✓ Đã ghi nhận thông tin dung lượng cho toàn bộ video.');

  // 3. Insert Views Log for Trend Chart
  console.log('\n[3/3] Tạo nhật ký lượt xem (video_views) theo ngày...');
  const viewLogs = [];
  const now = new Date();

  // Create realistic distributed views across past 30 days
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const viewDate = new Date();
    viewDate.setDate(now.getDate() - dayOffset);

    // Random count of views on that day (between 5 and 25 per day)
    const dailyViews = Math.floor(Math.random() * 20) + 8;
    for (let i = 0; i < dailyViews; i++) {
      const randomVideo = insertedVideos[Math.floor(Math.random() * insertedVideos.length)];
      if (randomVideo) {
        viewLogs.push({
          video_id: randomVideo.id,
          viewer_id: adminId,
          viewed_at: viewDate.toISOString()
        });
      }
    }
  }

  // Batch insert view logs
  const chunkSize = 100;
  for (let i = 0; i < viewLogs.length; i += chunkSize) {
    const chunk = viewLogs.slice(i, i + chunkSize);
    await fetch(`${SUPABASE_URL}/rest/v1/video_views`, {
      method: 'POST',
      headers,
      body: JSON.stringify(chunk)
    });
  }
  console.log(`✓ Đã nạp thành công ${viewLogs.length} lượt xem vào nhật ký xu hướng.`);

  console.log('\n=== HOÀN TẤT NẠP DỮ LIỆU! DASHBOARD & VIDEO SẼ HIỂN THỊ ĐẦY ĐỦ ===');
}

seed().catch(err => {
  console.error('Lỗi khi nạp dữ liệu:', err);
});
