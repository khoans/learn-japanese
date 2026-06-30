# Prompt: Tạo web app luyện tiếng Trung (tự chứa toàn bộ context)

> Dán **toàn bộ** nội dung dưới đây (mọi thứ bên trong khối) vào một phiên Claude Code mới
> trong một thư mục trống. Prompt này tự chứa mọi thông tin cần thiết — không cần đính kèm
> hay tham chiếu tới bất kỳ file nào khác.

---

Tôi muốn bạn xây một **WEB APP TĨNH luyện học tiếng Trung (Quan Thoại) cho người Việt**.
App phải chạy hoàn toàn ở phía client bằng **JavaScript thuần (vanilla JS)** — KHÔNG framework,
KHÔNG build step, KHÔNG backend, KHÔNG package manager. App phải mở được bằng cách **double-click
file HTML** (giao thức `file://`), nên BẮT BUỘC dùng thẻ `<script>` thường (KHÔNG dùng ES
module / `import`). Toàn bộ tiến độ học lưu bằng `localStorage`. App phải host miễn phí được
trên **GitHub Pages**.

Dưới đây là TOÀN BỘ đặc tả. Hãy tạo đầy đủ tất cả file, code chạy được ngay, rồi giải thích
ngắn gọn từng file.

## 0. Bối cảnh & triết lý thiết kế

Đây là bản phỏng theo một app luyện tiếng Nhật đã có thật, được tách dữ liệu ra khỏi HTML
thành các module nạp theo thứ tự. Triết lý cốt lõi cần giữ:

- **Dữ liệu tách khỏi logic**: file HTML chỉ chứa logic + giao diện; toàn bộ dữ liệu nằm
  trong thư mục `data/` dưới dạng các file `.js` nạp bằng `<script>`.
- **Thêm bài học = thêm 1 file + 1 dòng `<script>`**, không phải sửa logic.
- **Mọi thứ tự nạp đều quan trọng** (xem mục 2).
- Giao diện **tối (dark theme)**, gọn gàng, tối ưu cho luyện tốc độ; mọi nhãn và giải thích
  bằng **tiếng Việt**.

## 1. Cây thư mục (BẮT BUỘC đúng cấu trúc này)

```
index.html                     ← redirect (meta-refresh) sang file app
hanzi_trainer.html             ← APP: toàn bộ logic + giao diện inline. KHÔNG chứa dữ liệu.
data/
  registry.js                  ← bộ gom dữ liệu các bài. PHẢI nạp ĐẦU TIÊN.
  core-data.js                 ← dữ liệu KHÔNG theo bài (pinyin, bộ thủ, HSK, số, lượng từ…)
  lessons/
    lesson-01.js               ← mỗi bài 1 file: words + sentences + grammar
    lesson-02.js
    lesson-03.js
    _TEMPLATE.js               ← mẫu tạo bài mới (KHÔNG được nạp bởi thẻ <script> nào)
HƯỚNG-DẪN.md                   ← hướng dẫn bảo trì (tiếng Việt)
CLAUDE.md                      ← tài liệu kiến trúc cho Claude Code phiên sau
.gitignore                     ← bỏ qua .idea/ .DS_Store Thumbs.db
```

## 2. Thứ tự nạp `<script>` (BẮT BUỘC — không được đổi)

Trong `hanzi_trainer.html`, ngay trước phần `<script>` inline của app, nạp đúng thứ tự sau
(file sau phụ thuộc file trước):

```html
<!-- 1. registry: định nghĩa registerLesson() và object ZHLessons -->
<script src="data/registry.js"></script>
<!-- 2. dữ liệu lõi không theo bài -->
<script src="data/core-data.js"></script>
<!-- ====== THÊM BÀI Ở ĐÂY (theo thứ tự tăng dần) ====== -->
<script src="data/lessons/lesson-01.js"></script>
<script src="data/lessons/lesson-02.js"></script>
<script src="data/lessons/lesson-03.js"></script>
<!-- ====== HẾT KHỐI THÊM BÀI ====== -->
<!-- 3. (ngay sau đó là <script> inline của app) -->
```

Đặt comment `THÊM BÀI Ở ĐÂY` rõ ràng để sau này thêm bài chỉ cần chèn 1 dòng.

## 3. `data/registry.js` — cơ chế đăng ký & gom dữ liệu

Mỗi file bài gọi `registerLesson(số_bài, { words, sentences, grammar })`. Số bài chỉ ghi
MỘT lần ở `registerLesson(...)`, KHÔNG lặp lại trên từng dòng dữ liệu. `registry.js` gom tất
cả bài, chuẩn hoá, và phơi ra API cho app. Hãy viết file này theo đúng khuôn dưới đây (đặt
tên global là `registerLesson` và `ZHLessons`):

```js
// ============================================================
//  Lesson registry — NẠP FILE NÀY TRƯỚC tất cả file bài.
//  Mỗi file bài gọi: registerLesson(so_bai, { words, sentences, grammar })
//  App gọi:          ZHLessons.words() / .sentences() / .grammar() / .nums()
// ============================================================
(function (global) {
  var LESSONS = {};  // so_bai -> { words, sentences, grammar }

  function registerLesson(num, data) {
    data = data || {};
    LESSONS[num] = {
      words:     data.words     || [],
      sentences: data.sentences || [],
      grammar:   data.grammar   || []
    };
  }

  function nums() {
    return Object.keys(LESSONS).map(Number).sort(function (a, b) { return a - b; });
  }

  // -> [[hanzi, pinyin, lesson, nghia, hanzi_phonthe], ...]
  function words() {
    var out = [];
    nums().forEach(function (n) {
      LESSONS[n].words.forEach(function (w) {
        out.push([w[0], w[1], n, (w[2] != null ? w[2] : ''), (w[3] != null ? w[3] : w[0])]);
      });
    });
    return out;
  }

  // -> [[cau, pinyin, lesson, nghia], ...]
  function sentences() {
    var out = [];
    nums().forEach(function (n) {
      LESSONS[n].sentences.forEach(function (s) {
        out.push([s[0], s[1], n, (s[2] != null ? s[2] : '')]);
      });
    });
    return out;
  }

  // -> { "1": [ {p,g,ex,exr,m}, ... ], ... }
  function grammar() {
    var out = {};
    nums().forEach(function (n) {
      if (LESSONS[n].grammar && LESSONS[n].grammar.length) out[String(n)] = LESSONS[n].grammar;
    });
    return out;
  }

  global.registerLesson = registerLesson;
  global.ZHLessons = {
    register: registerLesson,
    nums: nums, words: words, sentences: sentences, grammar: grammar,
    _raw: LESSONS
  };
})(window);
```

App nạp dữ liệu ra biến toàn cục ngay đầu `<script>` inline:

```js
const LWORDS = ZHLessons.words();
const LSENT  = ZHLessons.sentences();
const GRAM   = ZHLessons.grammar();
const ALL_LESSONS = ZHLessons.nums();
```

## 4. Định dạng dữ liệu mỗi bài (mảng theo VỊ TRÍ — thứ tự cột quan trọng)

```
words:     [ chu_han, pinyin_co_dau_thanh, nghia_tiengviet, chu_han_phon_the_neu_khac ]
sentences: [ cau_chu_han, pinyin_co_dau_thanh, nghia_tiengviet ]
grammar:   { p: tieu_de, g: giai_thich, ex: vi_du_chu_han, exr: pinyin, m: nghia }
```

Quy tắc dữ liệu tiếng Trung:
- **Pinyin BẮT BUỘC có dấu thanh điệu**: ā á ǎ à a / ō ó ǒ ò o / ē é ě è e / ī í ǐ ì i /
  ū ú ǔ ù u / ǖ ǘ ǚ ǜ ü. Ví dụ `nǐ hǎo`, `xièxie`, `Zhōngguó`.
- Mặc định dùng **chữ Hán giản thể**; cột thứ 4 của `words` để chứa **phồn thể** nếu khác
  (nếu giống thì để trùng giản thể hoặc bỏ trống — registry tự điền lại bằng cột 1).

Ví dụ một file bài mẫu `data/lessons/lesson-01.js`:

```js
// ===== HSK1 - Bài 1: Chào hỏi =====
// words:     [ chu_han, pinyin, nghia, phon_the ]
// sentences: [ cau, pinyin, nghia ]
// grammar:   { p, g, ex, exr, m }
registerLesson(1, {
  words: [
    ["你",   "nǐ",      "bạn, mày",        "你"],
    ["好",   "hǎo",     "tốt, khỏe",       "好"],
    ["你好", "nǐ hǎo",  "xin chào",        "你好"],
    ["我",   "wǒ",      "tôi",             "我"],
    ["是",   "shì",     "là",              "是"],
    ["谢谢", "xièxie",  "cảm ơn",          "謝謝"],
    ["再见", "zàijiàn", "tạm biệt",        "再見"]
  ],
  sentences: [
    ["你好！",       "Nǐ hǎo!",        "Xin chào!"],
    ["你好吗？",     "Nǐ hǎo ma?",     "Bạn khỏe không?"],
    ["我很好，谢谢。","Wǒ hěn hǎo, xièxie.", "Tôi khỏe, cảm ơn."]
  ],
  grammar: [
    { p:"① 是 (là)", g:"Mẫu cơ bản A 是 B = 'A là B'. 是 nối hai danh từ.",
      ex:"我是学生。", exr:"Wǒ shì xuéshēng.", m:"Tôi là học sinh." },
    { p:"② 吗 (câu hỏi)", g:"Thêm 吗 cuối câu khẳng định để biến thành câu hỏi có/không.",
      ex:"你好吗？", exr:"Nǐ hǎo ma?", m:"Bạn khỏe không?" }
  ]
});
```

Và `data/lessons/_TEMPLATE.js` (file mẫu, có comment, KHÔNG nạp):

```js
// ===== MẪU TẠO BÀI MỚI — copy file này, đổi số trong registerLesson(...) =====
// KHÔNG thêm file này vào <script> trong HTML. Chỉ copy ra lesson-NN.js.
registerLesson(0, {
  words: [
    // [ chu_han, pinyin_co_dau, nghia_tiengviet, phon_the ]
  ],
  sentences: [
    // [ cau_chu_han, pinyin_co_dau, nghia_tiengviet ]
  ],
  grammar: [
    // { p: tieu_de, g: giai_thich, ex: vi_du, exr: pinyin, m: nghia }
  ]
});
```

## 5. `data/core-data.js` — dữ liệu KHÔNG theo bài

Khai báo các dataset dưới dạng global `const`. Mỗi dataset có một cột "nhóm" (số) để bộ lọc
theo nhóm hoạt động. Tối thiểu cần:

- **Bảng PINYIN & thanh điệu**: thanh mẫu (initials: b p m f d t n l g k h j q x zh ch sh r
  z c s …), vận mẫu (finals: a o e i u ü ai ei ao ou an en ang eng …), và **5 thanh điệu**
  (1 = cao bằng, 2 = lên, 3 = xuống-lên, 4 = xuống, 5/0 = nhẹ/neutral). Dùng cho luyện đọc
  âm và nhận diện thanh điệu.
- **RADICALS** (bộ thủ): `[ bo, pinyin, nghia ]` — khoảng 20 bộ thông dụng (人 口 日 月 木
  水 火 心 手 言 …).
- **WORDS** (từ vựng HSK ngoài bài): `[ chu_han, pinyin, nghia, cap_HSK ]` — ít nhất HSK1,
  có thể tới HSK3; `cap_HSK` là số để lọc.
- **HANZI** (chữ Hán đơn): `[ chu_han, pinyin, nghia, nhom ]` theo nhóm tần suất/độ khó.
- **NUMSET** (số đếm): 一二三四五六七八九十 百 千 万; phân biệt 二 (èr) và 两 (liǎng); mỗi
  dòng `[ chu_han, pinyin, nghia, gia_tri, nhom ]`.
- **COUNTSET** (lượng từ 量词): 个 本 张 只 杯 位 件 双 块 条 … kèm danh từ ví dụ; mỗi dòng
  `[ luong_tu, pinyin, nghia_va_vi_du, nhom ]`.

## 6. HỆ THỐNG DECK LUYỆN TẬP — `poolForKey(key)` (phần quan trọng nhất)

Mọi chế độ luyện được chọn bằng một **chuỗi "key"**. Hàm `poolForKey(key)` phân tích key,
lọc dataset tương ứng, và map MỖI mục về một **tuple đồng nhất 6 phần tử** mà engine luyện
tập dùng chung. Nhờ vậy mọi loại luyện (từ, câu, chữ Hán, pinyin, số…) chạy qua cùng một
engine.

**Format key:** `[prefix]type|arg1|arg2`

- `prefix` tuỳ chọn: `W:` = chế độ **gõ đáp án** (tự nhập), `M:` = chế độ **trắc nghiệm**
  nhiều lựa chọn. Không prefix = mặc định một chế độ.
- `type` là một trong: `lword`, `sent`, `hanzi`, `radical`, `number`, `counter`, `pinyin`,
  `tone`. Ví dụ:
  - `W:lword|1,2,3|P` — gõ, luyện từ vựng bài 1–3, hỏi **P**inyin (đáp án là pinyin).
  - `M:lword|1,2|H` — trắc nghiệm, hỏi **H**án tự (đáp án là chữ Hán).
  - `sent|1,2,3` — luyện câu của bài 1–3.
  - `hanzi|1,2` — luyện chữ Hán đơn nhóm 1–2.
  - `number|1,2` , `counter|1` , `radical` , `pinyin` , `tone` — tương ứng dataset lõi.

**Tuple đồng nhất 6 phần tử** mỗi mục được map về:

```
[ prompt, answer, extra, pinyinAnswer, compareKey, hanziForm ]
//  0: prompt        — nội dung hiển thị để hỏi
//  1: answer        — đáp án hiển thị đầy đủ (vd "pinyin · nghĩa")
//  2: extra          — thông tin phụ (vd cấu tạo, ví dụ)
//  3: pinyinAnswer   — riêng phần pinyin để chấm điểm khi gõ
//  4: compareKey     — chuỗi dùng để so khớp/khử trùng
//  5: hanziForm      — dạng chữ Hán (rỗng nếu mục không có Hán tự)
```

**Khung hàm cần viết** (thêm loại luyện mới = thêm một nhánh `if (p[0]==='...')`):

```js
function parseLessons(seg){
  if(!seg) return ALL_LESSONS.slice();
  const a = seg.split(',').map(x=>parseInt(x,10)).filter(x=>ALL_LESSONS.indexOf(x)>=0);
  return a.length ? a : ALL_LESSONS.slice();
}

function poolForKey(key){
  // tách prefix W:/M:
  if(key.indexOf('W:')===0 || key.indexOf('M:')===0) key = key.slice(2);
  const p = key.split('|');

  if(p[0]==='lword'){
    const ls = parseLessons(p[1]);
    const askHanzi = (p[2]==='H');   // H = hỏi chữ Hán, P = hỏi pinyin
    return LWORDS.filter(x=>ls.indexOf(x[2])>=0).map(function(x){
      const hanzi=x[0], pinyin=x[1], nghia=x[3]||'';
      if(askHanzi) return [ pinyin+'  ·  '+nghia, hanzi, '', pinyin, hanzi, hanzi ];
      return [ hanzi, pinyin+'  ·  '+nghia, '', pinyin, pinyin, hanzi ];
    });
  }
  if(p[0]==='sent'){
    const ls = parseLessons(p[1]);
    return LSENT.filter(x=>ls.indexOf(x[2])>=0)
                .map(x=>[ x[0], x[1]+'  ·  '+(x[3]||''), '', x[1], x[0], x[0] ]);
  }
  // ... các nhánh hanzi / radical / number / counter / pinyin / tone tương tự,
  //     đều trả về tuple 6 phần tử như trên.
}
```

**Quy tắc chấm điểm pinyin (BẮT BUỘC):** khi so sánh đáp án người dùng gõ với `pinyinAnswer`,
phải chuẩn hoá để **chấp nhận cả 3 cách gõ**:
1. pinyin có dấu thanh: `hǎo`
2. pinyin kiểu số: `hao3`
3. pinyin không dấu: `hao`

Viết hàm `normPinyin(s)` chuyển mọi dạng về cùng một chuẩn (bỏ dấu → chữ thường → bỏ khoảng
trắng thừa) để so khớp. Thêm **tuỳ chọn "đúng cả thanh điệu" (strict tone)** bật/tắt được:
khi bật thì so cả thanh (giữ thanh khi chuẩn hoá), khi tắt thì bỏ qua thanh.

## 7. STATE / `localStorage`

- Mọi truy cập qua wrapper bọc try/catch (để chạy được trên `file://` và chế độ ẩn danh):

```js
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function lsDel(k){ try{ localStorage.removeItem(k); }catch(e){} }
```

- Khoá đặt tiền tố `zh_`, có **hậu tố phiên bản schema** `_v1`/`_v2`. Khi đổi shape dữ liệu
  lưu thì **bump hậu tố** thay vì âm thầm đổi nghĩa. Tối thiểu cần lưu:
  - `zh_trainer_cur_v1` — deck hiện tại + tiến độ đang luyện.
  - `zh_trainer_history_v1` — lịch sử các phiên.
  - `zh_trainer_keys_v1` — các deck (key) người dùng đã lưu.
  - `zh_trainer_limit_v1` — giới hạn số thẻ mỗi phiên.
  - `zh_trainer_stricttone_v1` — bật/tắt chấm đúng thanh điệu.
  - tuỳ chọn UI: `zh_trainer_appw` (độ rộng), `zh_trainer_csize` (cỡ chữ).

## 8. Giao diện & tính năng

- **Dark theme**, gọn, tối ưu luyện tốc độ; mọi nhãn/giải thích bằng tiếng Việt.
- **Trang chính:** chọn loại luyện (từ vựng / câu / chữ Hán / pinyin / thanh điệu / số /
  lượng từ / bộ thủ); chọn bài hoặc nhóm bằng các nút bật/tắt nhiều lựa chọn (dùng thuộc
  tính `data-...` + class `active`, có hàm đọc các nút đang active); chọn chế độ `W`/`M`;
  bật/tắt strict-tone; đặt giới hạn số thẻ.
- **Màn luyện:** hiện prompt → người dùng nhập (W) hoặc chọn (M) → phản hồi đúng/sai → đếm
  đúng/sai + tốc độ → đảo thứ tự ngẫu nhiên → **lặp lại các thẻ sai** ở cuối.
- **Mục "Ngữ pháp theo bài":** một dropdown chọn bài; chọn xong render danh sách
  `{p, g, ex, exr, m}` của bài đó (chữ Hán + pinyin + nghĩa).
- **Nút "Bài N" và danh sách bài trong dropdown ngữ pháp phải TỰ SINH** từ `ALL_LESSONS` và
  `GRAM` — KHÔNG hardcode. Thêm bài là tự xuất hiện.
- **Font chữ Hán:** dùng `font-family` gồm `"Noto Sans SC", "PingFang SC", "Microsoft YaHei",
  sans-serif`. Nếu dữ liệu có phồn thể, cho **nút chuyển giản thể ⇄ phồn thể**.

## 9. `index.html` — redirect cho GitHub Pages

GitHub Pages mở `index.html` ở URL gốc; file app tên `hanzi_trainer.html`. Tạo `index.html`
là một redirect:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=hanzi_trainer.html">
  <title>Chinese App</title>
  <link rel="canonical" href="hanzi_trainer.html">
</head>
<body>
  Đang mở app… Nếu không tự chuyển, bấm:
  <a href="hanzi_trainer.html">hanzi_trainer.html</a>
</body>
</html>
```

## 10. Nội dung khởi tạo cần tạo sẵn

- **3 bài mẫu** `lesson-01.js → lesson-03.js` theo giáo trình **HSK1**, mỗi bài có đủ
  `words` + `sentences` + `grammar` THẬT, pinyin có dấu thanh chính xác.
- `core-data.js` điền sẵn: bảng pinyin + 5 thanh, ~20 bộ thủ, số đếm cơ bản, ~15 lượng từ,
  một ít chữ Hán HSK1.
- `_TEMPLATE.js` như mục 4 (không nạp).

## 11. Tài liệu kèm theo

- **`HƯỚNG-DẪN.md`** (tiếng Việt): cây thư mục, định dạng mỗi bài, **cách thêm bài mới**
  (copy `_TEMPLATE.js` → `lesson-NN.js`, đổi số trong `registerLesson(N, …)`, thêm 1 dòng
  `<script>` vào khối "THÊM BÀI Ở ĐÂY"), cách thêm từ vào bài có sẵn, và lưu ý thứ tự nạp.
- **`CLAUDE.md`** bắt đầu bằng đúng đoạn:

  ```
  # CLAUDE.md

  This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
  ```

  rồi tóm tắt: app là web tĩnh vanilla JS không build/test; thứ tự nạp bắt buộc; luồng
  registry → `ZHLessons.*` → biến toàn cục; định dạng row theo vị trí; hệ thống `poolForKey`
  và tuple 6 phần tử; quy tắc chuẩn hoá pinyin + strict tone; các khoá `localStorage` tiền
  tố `zh_` và ý nghĩa hậu tố `_v1`; cách thêm bài.
- **`.gitignore`**: `.idea/`, `.DS_Store`, `Thumbs.db`.

## 12. Hướng dẫn deploy (ghi vào cuối HƯỚNG-DẪN.md)

Host miễn phí bằng GitHub Pages:
1. Tạo repo public trên GitHub (không thêm README).
2. `git init && git add -A && git commit -m "initial"` rồi
   `git remote add origin <URL>` và `git push -u origin main`.
3. Trên repo: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)`
   → Save**. Sau ~1 phút app có ở `https://<user>.github.io/<repo>/`.
4. Mỗi lần sửa: `git add -A && git commit -m "..." && git push` → Pages tự cập nhật.

---

**Yêu cầu cuối:** Tạo TOÀN BỘ các file trên với code chạy được ngay khi double-click
`hanzi_trainer.html` (kể cả khi mở bằng `file://`). Giữ đúng kiến trúc tách dữ liệu, đúng
thứ tự nạp, và đúng cơ chế `registerLesson` / `ZHLessons` / `poolForKey` đã mô tả. Sau khi
tạo xong, liệt kê các file đã tạo và giải thích ngắn gọn vai trò từng file.
