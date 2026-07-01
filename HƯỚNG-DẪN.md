# Cấu trúc sau khi tách & cách bảo trì

## Cây thư mục

```
index.html                     ← trang chọn giao diện (link tới 2 bản).
kana_speed_trainer.html        ← GIAO DIỆN gốc (xanh-xám). Chỉ markup + CSS.
kana_speed_trainer_v2.html     ← GIAO DIỆN mới (xanh dương). Chỉ markup + CSS.
app.js                         ← TOÀN BỘ logic dùng chung cho cả 2 giao diện.
                                 Sửa logic CHỈ sửa ở đây.
data/
  registry.js                  ← bộ gom dữ liệu các bài. PHẢI nạp đầu tiên.
  core-data.js                 ← dữ liệu KHÔNG theo bài: bảng kana, từ N5 (WORDS),
                                 kanji (KANJIV, KANJI130), số đếm (NUMSET),
                                 đơn vị đếm (COUNTSET), bộ thủ (RADICALS)...
  lessons/
    manifest.js                  ← DANH SÁCH số bài (TỰ ĐỘNG SINH). Trang + sw.js đều đọc.
    lesson-01.js … lesson-07.js  ← mỗi bài 1 file (TỰ ĐỘNG SINH từ CSV) — ĐỪNG sửa tay.
    _TEMPLATE.js                 ← mẫu .js cũ (không được nạp; nay ưu tiên soạn bằng CSV)
    csv/                         ← NGUỒN DỮ LIỆU GỐC — soạn ở đây bằng Excel/Sheets:
      lesson-NN-words.csv          · từ vựng   (cột: jp, romaji, vi, kana)
      lesson-NN-sentences.csv      · câu        (cột: jp, romaji, vi)
      lesson-NN-grammar.csv        · ngữ pháp   (cột: p, g, ex, exr, m)
      _TEMPLATE-*.csv              · file mẫu để tạo bài mới
      README.md                    · hướng dẫn chi tiết cho người biên soạn
tools/
  build-lessons.ps1              ← chạy để sinh lesson-*.js + manifest.js từ CSV
```

> Mở `index.html` để chọn giao diện, hoặc double-click thẳng một trong hai file
> `kana_speed_trainer*.html`. Mỗi bản có nút ở góc trên để **chuyển nhanh sang bản
> kia**. Hai giao diện **dùng chung `app.js`, chung `data/`, chung tiến độ
> (localStorage)** — đổi qua lại không mất dữ liệu. Phải giữ `app.js` và thư mục
> `data/` nằm cạnh các file HTML (nạp bằng đường dẫn tương đối).

## Mỗi file bài chứa gì

```js
registerLesson(1, {
  words: [
    // [ chữ hiển thị, romaji, nghĩa tiếng Việt, hiragana ]
    ["私", "watashi", "tôi", "わたし"],
  ],
  sentences: [
    // [ câu tiếng Nhật, romaji, nghĩa tiếng Việt ]
    ["わたしは ミラーです。", "Watashi wa Miraa desu.", "Tôi là Miller."],
  ],
  grammar: [
    // { p: tiêu đề, g: giải thích, ex: ví dụ (Nhật), exr: ví dụ (romaji), m: nghĩa }
    { p:"① ～は～です", g:"Câu khẳng định cơ bản…", ex:"わたしは ミラーです。", exr:"Watashi wa Miraa desu.", m:"Tôi là Miller." },
  ]
});
```

Số bài (ví dụ `1`) chỉ cần ghi MỘT lần ở `registerLesson(...)` — không phải lặp
lại trên từng dòng từ vựng nữa.

## Thêm bài mới (Bài 8, 9…) — soạn bằng CSV, KHÔNG đụng code

Toàn bộ từ vựng / câu / ngữ pháp nay nằm trong **file CSV** ở `data/lessons/csv/`
(mở bằng Excel hoặc Google Sheets). Bạn chỉ sửa CSV rồi chạy 1 script — không phải
sửa HTML hay viết JavaScript nữa.

1. Vào `data/lessons/csv/`, chép 3 file mẫu `_TEMPLATE-words.csv`,
   `_TEMPLATE-sentences.csv`, `_TEMPLATE-grammar.csv` → đổi tên thành
   `lesson-08-words.csv`, `lesson-08-sentences.csv`, `lesson-08-grammar.csv`.
2. Mở bằng Excel/Sheets, điền dữ liệu (giữ nguyên dòng tiêu đề đầu tiên), **Lưu**
   ở định dạng CSV (UTF-8).
3. Chạy build: chuột phải `tools/build-lessons.ps1` → **Run with PowerShell**
   (hoặc `./tools/build-lessons.ps1` trong PowerShell ở thư mục gốc).
4. Xong. Script tự sinh `lesson-08.js` và cập nhật `manifest.js`; nút **"Bài 8"**
   tự xuất hiện ở **cả hai giao diện** (không phải sửa file HTML nào), và phần
   ngữ pháp cũng tự hiện. Xem thêm `data/lessons/csv/README.md`.

## Thêm/sửa từ vựng cho bài đã có

Mở file CSV tương ứng trong `data/lessons/csv/` (ví dụ `lesson-06-words.csv`),
thêm/sửa dòng, lưu lại, rồi chạy `tools/build-lessons.ps1`. Không đụng HTML/`app.js`.

> **Lưu ý:** các file `data/lessons/lesson-*.js` và `manifest.js` là **tự động
> sinh** từ CSV — đừng sửa trực tiếp, mọi thay đổi sẽ bị ghi đè ở lần build sau.

## Sửa logic / giao diện

- **Sửa logic** (cách luyện, thống kê, phím tắt, chấm điểm…): chỉ sửa trong
  `app.js` — cả hai giao diện tự động dùng chung.
- **Sửa giao diện một bản:** sửa `<style>` + markup trong đúng file HTML đó; không
  ảnh hưởng bản kia.
- Phím tắt mặc định nằm trong `app.js` (biến `keys`); lưu cấu hình ở localStorage
  khóa `jp_reader_keys_v2`.

## Lưu ý kỹ thuật

- Các file được nạp bằng thẻ `<script>` thường (không phải ES module) nên app vẫn
  chạy khi mở trực tiếp bằng `file://`, không cần web server.
- Thứ tự nạp bắt buộc: `registry.js` → `core-data.js` → `manifest.js` → (bộ nạp
  tự sinh các thẻ `lesson-*.js` theo `manifest.js`) → `app.js`. `app.js` PHẢI nạp
  cuối (nó đọc các `const` toàn cục mà các file dữ liệu khai báo).
- Bộ nạp trong mỗi file HTML dùng `document.write` để chèn thẻ `<script>` cho từng
  bài **theo đúng thứ tự, đồng bộ** — chạy được cả trên `file://` (không thể quét
  thư mục ở `file://`, nên `manifest.js` đóng vai danh sách bài). `sw.js` cũng
  `importScripts('./data/lessons/manifest.js')` để dùng chung danh sách này, nên
  thêm bài không phải sửa `sw.js`.
- App gom dữ liệu qua `JPLessons.words()` / `.sentences()` / `.grammar()` /
  `.nums()` và dựng thành `LWORDS` / `LSENT` / `GRAM` / `ALL_LESSONS`, nên mọi
  logic luyện tập, thống kê, localStorage giữ nguyên không đổi.
- Giao diện mới dùng Google Fonts (Be Vietnam Pro, Noto Serif JP); nếu offline sẽ
  tự lùi về font hệ thống, vẫn chạy bình thường.
