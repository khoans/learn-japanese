# Cấu trúc sau khi tách & cách bảo trì

## Cây thư mục

```
kana_speed_trainer.html        ← app (logic + giao diện). KHÔNG còn chứa dữ liệu.
data/
  registry.js                  ← bộ gom dữ liệu các bài. PHẢI nạp đầu tiên.
  core-data.js                 ← dữ liệu KHÔNG theo bài: bảng kana, từ N5 (WORDS),
                                 kanji (KANJIV, KANJI130), số đếm (NUMSET),
                                 đơn vị đếm (COUNTSET), bộ thủ (RADICALS)...
  lessons/
    lesson-01.js … lesson-06.js  ← mỗi bài 1 file: từ vựng + câu + ngữ pháp
    _TEMPLATE.js                 ← mẫu để tạo bài mới (không được nạp)
```

> Mở app bằng cách double-click `kana_speed_trainer.html` như cũ. Phải giữ
> nguyên thư mục `data/` nằm cạnh file HTML (các file `.js` được nạp bằng đường
> dẫn tương đối). Toàn bộ tiến độ học vẫn lưu trên máy như trước.

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

## Thêm bài mới (Bài 7, 8, 9…)

1. Copy `data/lessons/_TEMPLATE.js` → `data/lessons/lesson-07.js`, đổi số trong
   `registerLesson(7, {…})` và điền dữ liệu.
2. Mở `kana_speed_trainer.html`, tìm khối **"THÊM BÀI Ở ĐÂY"** và thêm 1 dòng:
   ```html
   <script src="data/lessons/lesson-07.js"></script>
   ```
   (đặt theo thứ tự tăng dần cho gọn).
3. Xong. Nút **"Bài 7"** tự xuất hiện trong phần chọn bài; nếu bài đó có `grammar`,
   nó cũng tự hiện trong mục "Ngữ pháp theo bài".

## Thêm từ vựng cho bài đã có

Mở `data/lessons/lesson-0X.js` và thêm dòng vào mảng `words` (hoặc `sentences`).
Không cần đụng tới file HTML.

## Lưu ý kỹ thuật

- Các file được nạp bằng thẻ `<script>` thường (không phải ES module) nên app vẫn
  chạy khi mở trực tiếp bằng `file://`, không cần web server.
- Thứ tự nạp bắt buộc: `registry.js` → `core-data.js` → các `lesson-*.js` → app.
  Khối include trong HTML đã đặt sẵn đúng thứ tự này.
- App gom dữ liệu qua `JPLessons.words()` / `.sentences()` / `.grammar()` /
  `.nums()` và dựng thành `LWORDS` / `LSENT` / `GRAM` / `ALL_LESSONS` y như trước,
  nên mọi logic luyện tập, thống kê, localStorage giữ nguyên không đổi.
