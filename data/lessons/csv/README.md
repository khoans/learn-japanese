# Dữ liệu bài học (CSV) — hướng dẫn cho người biên soạn

Thư mục này chứa **toàn bộ từ vựng, câu, ngữ pháp** của app dưới dạng file CSV
(mở được bằng **Excel** hoặc **Google Sheets**). Đây là **nguồn dữ liệu gốc** —
bạn chỉ cần sửa ở đây, không cần đụng tới file code.

## Cấu trúc file

Mỗi bài có 3 file (thay `NN` bằng số bài 2 chữ số, ví dụ `07`):

| File | Cột (dòng đầu tiên — ĐỪNG xoá) | Ý nghĩa |
|------|-------------------------------|---------|
| `lesson-NN-words.csv`     | `jp, romaji, vi, kana`       | Từ vựng: chữ hiển thị, romaji, nghĩa tiếng Việt, hiragana/katakana |
| `lesson-NN-sentences.csv` | `jp, romaji, vi`             | Câu ví dụ: câu Nhật, romaji, nghĩa tiếng Việt |
| `lesson-NN-grammar.csv`   | `p, g, ex, exr, m`           | Ngữ pháp: tiêu đề, giải thích, ví dụ Nhật, ví dụ romaji, nghĩa |

> Cột `kana` để trống cũng được — khi đó app sẽ dùng luôn phần `jp`.

## Cách thêm / sửa bài

1. **Sửa bài có sẵn:** mở file CSV tương ứng, thêm/sửa dòng, **Lưu** (giữ định dạng `.csv`, mã **UTF-8**).
2. **Thêm bài mới (ví dụ Bài 8):** chép 3 file mẫu `_TEMPLATE-words.csv`, `_TEMPLATE-sentences.csv`,
   `_TEMPLATE-grammar.csv` → đổi tên thành `lesson-08-words.csv`, `lesson-08-sentences.csv`,
   `lesson-08-grammar.csv`, rồi điền dữ liệu (xoá dòng ví dụ mẫu).
3. **Chạy build:** ở thư mục gốc dự án, chuột phải `tools/build-lessons.ps1` → **Run with PowerShell**
   (hoặc mở PowerShell và gõ `./tools/build-lessons.ps1`).
4. **Xong.** Mở lại app — bài/từ mới tự hiện ra. Không phải sửa file HTML nào cả.

## Lưu ý

- **Excel:** khi mở, nếu tiếng Nhật bị lỗi ô vuông, hãy dùng *Data → From Text/CSV* và chọn mã **UTF-8**.
  Các file mẫu ở đây đã có sẵn "BOM" nên Excel thường tự nhận đúng.
- **Google Sheets:** File → Import → Upload, chọn *Replace current sheet*; khi tải về chọn *Comma-separated values (.csv)*.
- Nếu ô có dấu phẩy hoặc dấu ngoặc kép, Excel/Sheets sẽ tự bọc ngoặc kép cho bạn — cứ để nguyên.
- File `.js` trong `data/lessons/` là **tự động sinh ra** từ các CSV này; đừng sửa tay (sẽ bị ghi đè).
