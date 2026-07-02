---
name: add-theme
description: Thêm MỘT chủ đề từ vựng (theo chủ đề, tách rời hệ thống trình độ N5/N4) vào app. Dùng khi người dùng gõ "/add-theme <tên chủ đề>" (vd /add-theme đồ ăn, /add-theme thời tiết). TỰ SOẠN ~25–30 từ đúng chủ đề (chữ Nhật + romaji + nghĩa + kana), sinh CSV, cập nhật themes.csv rồi chạy build. CHỈ dùng cho tiếng Nhật, chỉ TỪ VỰNG (không câu, không ngữ pháp).
---

# /add-theme <tên chủ đề>

Thêm **một chủ đề từ vựng** vào chế độ **"Từ theo chủ đề"** của app — danh mục **tách rời
hoàn toàn** hệ thống trình độ/bài (N5, N4…). Chủ đề = **chỉ từ vựng** (không câu, không ngữ pháp).

Kiến trúc: mỗi chủ đề là 1 thư mục `data/lessons/csv/themes/<id>/words.csv` + 1 dòng trong
`data/lessons/csv/themes/themes.csv`. Chạy `tools/build-lessons.ps1` → tự sinh `data/themes.js`.
**Không cần sửa HTML hay code.**

Nếu người dùng KHÔNG đưa tên chủ đề → hỏi lại rồi mới làm.
Nếu đưa NHIỀU chủ đề → làm **lần lượt từng chủ đề** (lặp toàn bộ quy trình cho mỗi cái).

## Quy trình

### 1. Xác định `id` (slug) + `ten` (tên hiển thị)
- **`ten`** = tên tiếng Việt để hiển thị trên nút chọn, GIỮ dấu (vd `Đồ ăn & thức uống`,
  `Thời gian & thời tiết`). Viết hoa chữ đầu, ngắn gọn, rõ nghĩa.
- **`id`** = slug ASCII kebab-case, **bỏ dấu tiếng Việt**, thường 1–2 từ khoá:
  `Đồ ăn & thức uống` → `do-an`; `Thời gian & thời tiết` → `thoi-tiet`; `Gia đình` → `gia-dinh`;
  `Giao thông` → `giao-thong`; `Nghề nghiệp` → `nghe-nghiep`.
  Chỉ dùng `[a-z0-9-]`, không dấu, không khoảng trắng.

### 2. Kiểm tra trùng
- Nếu `data/lessons/csv/themes/<id>/` đã tồn tại **hoặc** `id` đã có trong `themes.csv`
  → báo chủ đề đã có, HỎI có ghi đè/bổ sung không; dừng nếu không.

### 3. Soạn từ vựng (TỰ SOẠN — dữ liệu factual)
- **TỰ SOẠN ~25–30 từ** thuộc đúng chủ đề. Từ vựng là dữ liệu factual nên tự biên soạn từ
  kiến thức chuẩn; **không** cần và **không** sao chép nguyên văn đoạn/định nghĩa của trang web nào.
  (Có thể WebFetch để tham khảo ý tưởng, nhưng chỉ lấy **danh sách từ**, không copy văn bản.)
- Ưu tiên từ **thông dụng, đời thường**, phủ đủ các khía cạnh của chủ đề.
- Chuẩn hoá romaji Hepburn thường: trường âm ghi lặp nguyên âm (`reizouko`, `senpuuki`,
  `eakon`), không ký tự lạ `ｰ`. Bỏ ký hiệu thừa.

### 4. Tạo/cập nhật CSV — UTF-8 **CÓ BOM** (bắt đầu bằng ký tự ﻿)
Ô nào chứa dấu phẩy `,` phải bọc nháy kép `"..."` (vd nghĩa "chăn, nệm").

- **`data/lessons/csv/themes/<id>/words.csv`** — header `tiengNhat,romaji,nghia,kana`.
  Mỗi từ 1 dòng: `chữ hiển thị, romaji, nghĩa tiếng Việt, kana (cách đọc)`.
  - Cột `tiengNhat` = **dạng kanji** của từ **nếu có** (vd `机`, `冷蔵庫`, `病院`). App có toggle
    "Dạng chữ" (Hiragana ↔ Kanji mặt trước) nên **PHẢI điền kanji vào đây khi từ có kanji**,
    nếu không chế độ Kanji sẽ chỉ hiện kana. Từ ngoại lai → **katakana**. Từ thuần kana / kanji
    hiếm-không thông dụng → để **kana** (khi đó mặt Kanji cũng hiện kana, chấp nhận được).
  - Cột `kana` = **cách đọc** (luôn là hiragana/katakana). Nếu `tiengNhat` đã là kana thì lặp y hệt.
- **`data/lessons/csv/themes/themes.csv`** — header `id,ten`.
  **THÊM 1 dòng** `<id>,<ten>` (nếu `ten` có dấu phẩy thì bọc nháy). **GIỮ nguyên các dòng cũ**
  và **giữ BOM** của file. Thứ tự dòng = thứ tự nút hiển thị trong app.

Cách đảm bảo BOM (sau khi ghi bằng Write): dùng PowerShell re-encode
`Get-Content -Raw -Encoding utf8 $p | Set-Content -Encoding utf8BOM -NoNewline $p`
cho **cả** `words.csv` **và** `themes.csv`.

### 5. Build
Chạy: `pwsh -ExecutionPolicy Bypass -File tools/build-lessons.ps1`
Nó đọc `csv/themes/`, sinh `data/themes.js` (`THEME_LIST` + `THEMEWORDS`), bump cache `sw.js`.
Dòng log `themes/<id>: N tu` và `themes.js: K chu de, M tu` xác nhận đã nhận.

### 6. Verify
- `node --check data/themes.js`.
- Spot-check vài dòng có dấu phẩy trong nghĩa đã bọc nháy đúng.
- (Tuỳ chọn) boot-sim: dựng lại thứ tự nạp như `index.html` rồi gọi
  `poolForKey('theme|<id>')` để chắc số thẻ đúng và **không hồi quy** (`poolForKey('lword|1')`
  vẫn ra như cũ). Xem mẫu `scratchpad/theme-boot.js` nếu còn.

### 7. Báo cáo & hỏi commit
- Tóm tắt: “Chủ đề <ten> (`<id>`) — N từ”, tổng số chủ đề/từ sau khi thêm.
- Nói rõ: **từ vựng tự biên soạn (dữ liệu factual), chỉ là danh sách từ.**
- **HỎI người dùng trước khi commit** (đừng tự commit/push trừ khi được yêu cầu).

## Phong cách (giữ nhất quán với các chủ đề đã có: xem `data/lessons/csv/themes/do-vat`, `suc-khoe`)
- ~25–30 từ, thông dụng, đúng chủ đề, không trùng lặp vô ích.
- Mặt trước chủ yếu **hiragana/katakana**; kanji chỉ khi thật thông dụng.
- Nghĩa **tiếng Việt** ngắn gọn; nghĩa nhiều ý ngăn bằng dấu phẩy (nhớ bọc nháy).
- Chủ đề là **words-only** — KHÔNG tạo `sentences.csv`/`grammar.csv` cho chủ đề.
