# Dữ liệu bài học (CSV) — hướng dẫn cho người biên soạn

Thư mục này chứa **toàn bộ từ vựng, câu, ngữ pháp** của app dưới dạng file CSV
(mở được bằng **Excel** hoặc **Google Sheets**). Đây là **nguồn dữ liệu gốc** —
bạn chỉ cần sửa ở đây, không cần đụng tới file code.

## Cấu trúc thư mục

Dữ liệu được gom theo **trình độ** (N5, N4, N3, N2, N1), mỗi trình độ chứa nhiều
**bài**, mỗi bài là **một thư mục riêng** gồm 3 file:

```
csv/
  N5/                      ← trình độ
    lesson-01/             ← một bài (thư mục riêng)
      words.csv            ← từ vựng
      sentences.csv        ← câu ví dụ
      grammar.csv          ← ngữ pháp
    lesson-02/
      ...
  N4/                      ← thêm trình độ mới = tạo thư mục N4, N3...
    lesson-01/
      ...
  _TEMPLATE/               ← thư mục mẫu để chép khi tạo bài mới
```

## Cột (dòng tiêu đề đầu tiên — ĐỪNG xoá)

| File | Cột | Ý nghĩa |
|------|-----|---------|
| `words.csv`     | `tiengNhat, romaji, nghia, kana`                | Chữ hiển thị, romaji, nghĩa tiếng Việt, hiragana/katakana |
| `sentences.csv` | `cau, romaji, nghia`                            | Câu Nhật, romaji, nghĩa tiếng Việt |
| `grammar.csv`   | `mau_cau, giai_thich, vi_du, vi_du_romaji, nghia` | Tiêu đề mẫu câu, giải thích, ví dụ Nhật, ví dụ romaji, nghĩa |

> Cột `kana` để trống cũng được — khi đó app sẽ dùng luôn phần `tiengNhat`.

## Cách thêm / sửa

1. **Sửa bài có sẵn:** mở file CSV trong thư mục bài tương ứng (vd
   `N5/lesson-06/words.csv`), thêm/sửa dòng, **Lưu** (định dạng `.csv`, mã **UTF-8**).
2. **Thêm bài mới (vd Bài 8 của N5):** chép cả thư mục `_TEMPLATE/` → đổi tên thành
   `N5/lesson-08/`, rồi điền vào 3 file bên trong (xoá dòng ví dụ mẫu).
3. **Thêm trình độ mới (vd N4):** tạo thư mục `N4/`, rồi bỏ các thư mục `lesson-01/`,
   `lesson-02/`… (chép từ `_TEMPLATE/`) vào trong.
4. **Chạy build:** ở thư mục gốc dự án, chuột phải `tools/build-lessons.ps1` →
   **Run with PowerShell** (hoặc `./tools/build-lessons.ps1`).
5. **Xong.** Mở lại app — bài/trình độ mới tự hiện ra. Không phải sửa file HTML nào.

## Lưu ý

- **Excel:** nếu tiếng Nhật bị lỗi ô vuông, dùng *Data → From Text/CSV* và chọn mã
  **UTF-8**. Các file mẫu đã có sẵn "BOM" nên Excel thường tự nhận đúng.
- **Google Sheets:** File → Import → Upload; khi tải về chọn *Comma-separated values (.csv)*.
- Nếu ô có dấu phẩy hoặc dấu ngoặc kép, Excel/Sheets tự bọc ngoặc kép — cứ để nguyên.
- Các file trong `data/lessons/<TRÌNH_ĐỘ>/*.js` và `manifest.js` là **tự động sinh ra**
  từ CSV; đừng sửa tay (sẽ bị ghi đè ở lần build sau).
