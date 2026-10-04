# Supabase Storage & Video Flow

## Buckets đề xuất

- `videos`
- `thumbnails`

Có thể dùng public bucket cho thumbnail nếu cần render trực tiếp; video nên cân nhắc private bucket + signed URL tùy yêu cầu bảo vệ nội dung.

## Upload flow

1. User chọn video file.
2. Validate extension/MIME/type/size ở frontend.
3. Tạo path ổn định, ví dụ:
   - `videos/{userId}/{timestamp}-{safeName}.mp4`
   - `thumbnails/{userId}/{timestamp}-{safeName}.webp`
4. Upload Supabase Storage.
5. Insert `videos` row.
6. Insert `storage_assets` rows với `size_bytes`.
7. Nếu insert DB thất bại sau upload, thực hiện cleanup file đã upload.

## Edit flow

Nếu không thay file:

- Chỉ update metadata.

Nếu thay file:

- Upload file mới trước.
- Update DB sang path mới.
- Xóa file cũ sau khi DB update thành công.

## Delete flow

- Lấy paths liên quan.
- Xóa row `videos`.
- Xóa asset files.
- Có thể dùng Edge Function/Database job cho cleanup phức tạp nếu hệ thống lớn.

## Storage usage

Dashboard có thể tính:

```text
SUM(storage_assets.size_bytes)
```

Sau đó format:

- Bytes
- KB
- MB
- GB

## Thumbnail

Ưu tiên thumbnail được tạo sẵn từ uploader hoặc xử lý ở backend/edge runtime. Không cố decode/convert video nặng trong browser nếu không cần thiết.
