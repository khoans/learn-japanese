# Cấu trúc sau khi tách & cách bảo trì

## Cây thư mục

```
index.html                     ← chuyển hướng nhanh sang bản v2.
kana_speed_trainer_v2.html     ← GIAO DIỆN app (xanh dương). Markup + CSS + nạp dữ liệu.
app.js                         ← TOÀN BỘ logic của app. Sửa logic CHỈ sửa ở đây.
data/
  registry.js                  ← bộ gom dữ liệu các bài. PHẢI nạp đầu tiên.
  core-data.js                 ← dữ liệu KHÔNG theo bài: bảng kana, từ N5 (WORDS),
                                 kanji (KANJIV, KANJI130), số đếm (NUMSET),
                                 đơn vị đếm (COUNTSET), bộ thủ (RADICALS)...
  lessons/
    manifest.js                  ← DANH SÁCH trình độ + số bài (TỰ ĐỘNG SINH). Trang + sw.js đều đọc.
    N5/lesson-01.js … lesson-07.js ← mỗi bài 1 file (TỰ ĐỘNG SINH từ CSV) — ĐỪNG sửa tay.
    csv/                         ← NGUỒN DỮ LIỆU GỐC — soạn ở đây bằng Excel/Sheets:
      N5/                          · một thư mục cho mỗi TRÌNH ĐỘ (N5, N4, N3…)
        lesson-01/                 · một thư mục cho mỗi BÀI, gồm 3 file:
          words.csv                  – từ vựng (cột: tiengNhat, romaji, nghia, kana)
          sentences.csv              – câu     (cột: cau, romaji, nghia)
          grammar.csv                – ngữ pháp (cột: mau_cau, giai_thich, vi_du, vi_du_romaji, nghia)
      _TEMPLATE/                   · thư mục mẫu để chép khi tạo bài mới
      README.md                    · hướng dẫn chi tiết cho người biên soạn
tools/
  build-lessons.ps1              ← chạy để sinh lesson-*.js + manifest.js từ CSV
```

> Double-click `kana_speed_trainer_v2.html` để mở app (hoặc mở `index.html` sẽ tự
> chuyển sang). App dùng `app.js` + thư mục `data/`, lưu tiến độ ở `localStorage`.
> Phải giữ `app.js` và thư mục `data/` nằm cạnh file HTML (nạp bằng đường dẫn tương đối).

## Trình độ (N5 → N1)

Các bài được gom theo **trình độ**. Hiện tại mới có **N5**. Thêm trình độ mới (N4,
N3…) chỉ là tạo thư mục `csv/N4/` rồi bỏ các bài vào (xem dưới) — app tự hiện thêm
nhóm nút "Trình độ N4". *(Chức năng học trộn nhiều trình độ sẽ làm sau.)*

## Mỗi bài được soạn thế nào (CSV)

Mỗi bài là **một thư mục** trong `data/lessons/csv/<TRÌNH_ĐỘ>/lesson-NN/`, gồm 3 file
CSV mở bằng Excel/Google Sheets. Dòng đầu mỗi file là **tiêu đề cột — ĐỪNG xoá**:

- `words.csv` — cột `tiengNhat, romaji, nghia, kana`
- `sentences.csv` — cột `cau, romaji, nghia`
- `grammar.csv` — cột `mau_cau, giai_thich, vi_du, vi_du_romaji, nghia`

> Cột `kana` để trống thì app dùng luôn phần `tiengNhat`. Bạn KHÔNG cần viết code —
> `tools/build-lessons.ps1` sẽ tự chuyển CSV thành file `.js` cho app.

## Thêm bài mới (Bài 8, 9…) — soạn bằng CSV, KHÔNG đụng code

1. Vào `data/lessons/csv/`, chép **cả thư mục** `_TEMPLATE/` → đổi tên thành
   `N5/lesson-08/` (đúng trình độ + số bài).
2. Mở 3 file CSV bên trong bằng Excel/Sheets, điền dữ liệu (giữ dòng tiêu đề), **Lưu**
   ở định dạng CSV (UTF-8). Xoá dòng ví dụ mẫu.
3. Chạy build: chuột phải `tools/build-lessons.ps1` → **Run with PowerShell**
   (hoặc `./tools/build-lessons.ps1` trong PowerShell ở thư mục gốc).
4. Xong. Script tự sinh `data/lessons/N5/lesson-08.js` và cập nhật `manifest.js`; nút
   **"Bài 8"** tự xuất hiện trong app (không sửa file HTML nào), phần ngữ pháp cũng
   tự hiện. Xem thêm `data/lessons/csv/README.md`.

## Thêm/sửa từ vựng cho bài đã có

Mở file CSV tương ứng trong thư mục bài (ví dụ `data/lessons/csv/N5/lesson-06/words.csv`),
thêm/sửa dòng, lưu lại, rồi chạy `tools/build-lessons.ps1`. Không đụng HTML/`app.js`.

> **Lưu ý:** các file `data/lessons/<TRÌNH_ĐỘ>/lesson-*.js` và `manifest.js` là **tự
> động sinh** từ CSV — đừng sửa trực tiếp, mọi thay đổi sẽ bị ghi đè ở lần build sau.
> Xoá thư mục bài trong CSV rồi build lại thì file `.js` tương ứng cũng tự bị xoá.

## Sửa logic / giao diện

- **Sửa logic** (cách luyện, thống kê, phím tắt, chấm điểm…): sửa trong `app.js`.
- **Sửa giao diện:** sửa `<style>` + markup trong `kana_speed_trainer_v2.html`.
- Phím tắt mặc định nằm trong `app.js` (biến `keys`); lưu cấu hình ở localStorage
  khóa `jp_reader_keys_v2`.

## Lưu ý kỹ thuật

- Các file được nạp bằng thẻ `<script>` thường (không phải ES module) nên app vẫn
  chạy khi mở trực tiếp bằng `file://`, không cần web server.
- Thứ tự nạp bắt buộc: `registry.js` → `core-data.js` → `manifest.js` → (bộ nạp
  tự sinh các thẻ `<TRÌNH_ĐỘ>/lesson-*.js` theo `manifest.js`) → `app.js`. `app.js`
  PHẢI nạp cuối (nó đọc các `const` toàn cục mà các file dữ liệu khai báo).
- `manifest.js` đặt biến `LEVELS` (danh sách trình độ) và `LESSON_MANIFEST` (số bài
  theo từng trình độ). Bộ nạp trong mỗi file HTML dùng `document.write` để chèn thẻ
  `<script>` cho từng bài **theo đúng thứ tự, đồng bộ** — chạy được cả trên `file://`
  (không thể quét thư mục ở `file://`, nên `manifest.js` đóng vai danh sách bài).
  `sw.js` cũng `importScripts('./data/lessons/manifest.js')` để dùng chung danh sách
  này, nên thêm bài/trình độ không phải sửa `sw.js`.
- App gom dữ liệu qua `JPLessons.words()` / `.sentences()` / `.grammar()` /
  `.nums()` và dựng thành `LWORDS` / `LSENT` / `GRAM` / `ALL_LESSONS`, nên mọi
  logic luyện tập, thống kê, localStorage giữ nguyên không đổi.
- Giao diện mới dùng Google Fonts (Be Vietnam Pro, Noto Serif JP); nếu offline sẽ
  tự lùi về font hệ thống, vẫn chạy bình thường.
- Thẻ **kanji** và **bộ thủ** có 2 nút: **✍ Thứ tự nét** (xem animation) và
  **✏️ Luyện viết** (tự vẽ từng nét, máy chấm; có nút Đúng/Sai để ghi nhận rồi qua
  thẻ sau). Dùng thư viện `hanzi-writer` tải từ CDN nên **cần internet**; offline sẽ
  hiện thông báo dự phòng. Phủ toàn bộ kanji + bộ thủ N5.
