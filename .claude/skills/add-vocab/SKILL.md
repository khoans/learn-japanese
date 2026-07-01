---
name: add-vocab
description: Thêm tự động MỘT bài Minna no Nihongo (N5) vào app — từ vựng + câu + ngữ pháp. Dùng khi người dùng gõ "/add-vocab <số bài>" (vd /add-vocab 10). Lấy DANH SÁCH TỪ VỰNG từ vnjpclub theo số bài, TỰ SOẠN câu + ngữ pháp theo mẫu chuẩn, sinh CSV rồi chạy build. KHÔNG dùng cho ngôn ngữ khác hay việc khác.
---

# /add-vocab <số bài>

Thêm **Bài X** (N5) vào app theo đúng kiến trúc CSV → build. `X` = số bài người dùng đưa
(ví dụ `/add-vocab 10` ⇒ X = 10). `NN` = X dạng 2 chữ số (`10`, `09`, …).

Nếu người dùng KHÔNG đưa số bài → hỏi lại số bài rồi mới làm.

## Quy trình

### 1. Kiểm tra trùng
Nếu `data/lessons/csv/N5/lesson-NN/` đã tồn tại → báo bài đã có, HỎI có ghi đè không; dừng nếu không.

### 2. Lấy từ vựng (WebFetch — CHỈ danh sách từ)
Fetch URL (thay X):
`https://jls.vnjpclub.com/tu-vung-minna-no-nihongo-bai-X.html`

Prompt trích: *"Mỗi từ 4 trường ngăn bằng `|`: (1) chữ Nhật hiển thị, (2) romaji, (3) nghĩa tiếng Việt, (4) kana. Mỗi từ một dòng, không thêm gì khác."*

**Bản quyền:** chỉ lấy **danh sách từ vựng** (dữ liệu factual). **KHÔNG sao chép** câu ví dụ,
giải thích ngữ pháp hay đoạn văn của trang — phần câu + ngữ pháp phải **tự soạn** (bước 4).

### 3. Làm sạch từ vựng
- Bỏ ký hiệu `[な]` / `[na]` ở tính từ đuôi な (`好き[な]` → `好き`).
- Chuẩn hoá romaji: `ｰ`/dấu kéo dài lạ → viết thường (`supootsu`, `konsaato`, `roomaji`); bỏ ký tự rác.
- Trường dạng "A/B" (`夫/主人`, `妻/家内`) → chọn 1 dạng thông dụng.
- Bỏ trợ từ/ngữ pháp thuần khỏi cột từ vựng nếu đã đưa vào grammar (vd `～から`).

### 4. Tạo 3 CSV — UTF-8 **CÓ BOM** (bắt đầu bằng ký tự ﻿), header **tiếng Việt**
Thư mục `data/lessons/csv/N5/lesson-NN/`. Ô nào chứa dấu phẩy `,` phải bọc nháy kép `"..."`.

- **`words.csv`** — header `tiengNhat,romaji,nghia,kana`. Mỗi từ 1 dòng (từ bước 2–3).
- **`sentences.csv`** — header `cau,romaji,nghia`. **TỰ SOẠN ~25–30 câu** dùng đúng
  **từ vựng + mẫu ngữ pháp của Bài X**. Câu hỏi–đáp: dòng đáp án bắt đầu bằng `…`.
- **`grammar.csv`** — header `mau_cau,giai_thich,vi_du,vi_du_romaji,nghia`. **TỰ SOẠN ~5–7 điểm
  ngữ pháp CHUẨN của Bài X** (theo giáo trình Minna no Nihongo). Cột `giai_thich` thường có
  dấu phẩy → nhớ bọc nháy.

Ánh xạ nội bộ (build tự làm, đừng lo): grammar `mau_cau/giai_thich/vi_du/vi_du_romaji/nghia`
→ `p/g/ex/exr/m`.

### 5. Build
Chạy: `pwsh -ExecutionPolicy Bypass -File tools/build-lessons.ps1`
Nó sinh `data/lessons/N5/lesson-NN.js`, cập nhật `data/lessons/manifest.js`, bump cache `sw.js`.
Không cần sửa HTML.

### 6. Verify
- `node --check data/lessons/N5/lesson-NN.js`.
- Spot-check vài dòng có dấu phẩy (câu `から`, giải thích ngữ pháp) đã bọc nháy đúng.
- (Nếu có `scratchpad/boot-sim.js` hoặc tự dựng) chạy boot-sim để chắc app nạp được và tổng
  số từ/câu tăng đúng.

### 7. Báo cáo & hỏi commit
- Tóm tắt: “Bài X — A từ · B câu · C ngữ pháp”, liệt kê nhanh các mẫu ngữ pháp.
- Nói rõ: **câu + ngữ pháp do tự soạn theo mẫu chuẩn; chỉ lấy danh sách từ vựng từ web.**
- **HỎI người dùng trước khi commit** (đừng tự commit/push trừ khi được yêu cầu).

## Phong cách (giữ nhất quán với các bài đã có: xem `data/lessons/csv/N5/lesson-08`, `lesson-09`)
- Câu viết **chủ yếu hiragana**, katakana cho từ ngoại lai, **cách khoảng giữa các bunsetsu**.
- Ngữ pháp đánh số ①②③…; giải thích ngắn gọn **tiếng Việt** + 1 ví dụ Nhật/romaji/nghĩa.
- Chỉ dùng từ vựng/ngữ pháp thuộc **Bài X hoặc các bài trước** (tránh mẫu của bài sau).
- Mỗi câu bao trọn ít nhất 1 mẫu ngữ pháp của bài; trải đều các mẫu.
