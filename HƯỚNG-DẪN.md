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
    lesson-01.js … lesson-07.js  ← mỗi bài 1 file: từ vựng + câu + ngữ pháp
    _TEMPLATE.js                 ← mẫu để tạo bài mới (không được nạp)
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

## Thêm bài mới (Bài 8, 9…)

1. Copy `data/lessons/_TEMPLATE.js` → `data/lessons/lesson-08.js`, đổi số trong
   `registerLesson(8, {…})` và điền dữ liệu.
2. Tìm khối **"THÊM BÀI Ở ĐÂY"** và thêm 1 dòng (đặt theo thứ tự tăng dần):
   ```html
   <script src="data/lessons/lesson-08.js"></script>
   ```
   ⚠️ Phải thêm vào **CẢ HAI** file: `kana_speed_trainer.html` **và**
   `kana_speed_trainer_v2.html` (danh sách include là thứ duy nhất bị lặp giữa
   hai giao diện).
3. Xong. Nút **"Bài 8"** tự xuất hiện trong phần chọn bài ở cả hai giao diện;
   nếu bài đó có `grammar`, nó cũng tự hiện trong mục "Ngữ pháp theo bài".

## Thêm từ vựng cho bài đã có

Mở `data/lessons/lesson-0X.js` và thêm dòng vào mảng `words` (hoặc `sentences`).
Không cần đụng tới file HTML hay `app.js`.

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
- Thứ tự nạp bắt buộc: `registry.js` → `core-data.js` → các `lesson-*.js` →
  `app.js`. `app.js` PHẢI nạp cuối (nó đọc các `const` toàn cục mà các file dữ
  liệu khai báo — chỉ chạy đúng theo đúng thứ tự này).
- App gom dữ liệu qua `JPLessons.words()` / `.sentences()` / `.grammar()` /
  `.nums()` và dựng thành `LWORDS` / `LSENT` / `GRAM` / `ALL_LESSONS`, nên mọi
  logic luyện tập, thống kê, localStorage giữ nguyên không đổi.
- Giao diện mới dùng Google Fonts (Be Vietnam Pro, Noto Serif JP); nếu offline sẽ
  tự lùi về font hệ thống, vẫn chạy bình thường.
