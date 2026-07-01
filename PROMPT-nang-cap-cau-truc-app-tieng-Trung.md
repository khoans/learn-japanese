# PROMPT — Tái cấu trúc app học tiếng Trung (HSK) để người không rành kỹ thuật dễ mở rộng

> Dán toàn bộ file này vào một session AI mới, trong **repository riêng của app tiếng Trung**.
> Prompt tự chứa: mọi thông tin cần thiết đều nằm ở đây, không tham chiếu tới bất kỳ dự án nào khác.

---

## 0. Vai trò & nhiệm vụ

Bạn là kỹ sư đang làm việc trong repo của một **app học tiếng Trung (HSK)**. App hiện là **một
file HTML tĩnh duy nhất**, toàn bộ dữ liệu từ vựng/hội thoại nhúng thẳng trong `<script>`.
Nhiệm vụ của bạn: **tái cấu trúc để người biên soạn KHÔNG rành lập trình có thể tự thêm/sửa
từ vựng, hội thoại và cả cấp độ HSK mới** — chỉ bằng **bảng tính (Excel/Google Sheets)** và
**chạy một script**, KHÔNG phải đụng vào HTML/JavaScript, và app **tự phát hiện** dữ liệu mới.

Giữ nguyên 100% tính năng và giao diện hiện có. Đây là việc cấu trúc lại cách *lưu & nạp dữ
liệu*, không phải viết lại app.

---

## 1. App hiện tại là gì

- **Thuần client-side**, vanilla JS, **không framework, không backend, không bước build cho
  lúc chạy**. Nạp bằng thẻ `<script>` thường (không phải ES module).
- **Chạy được khi mở trực tiếp bằng `file://`** (double-click file HTML), không cần web server.
  Đây là ràng buộc BẮT BUỘC phải giữ.
- Có thể deploy tĩnh (ví dụ GitHub Pages). Mọi tiến độ lưu ở `localStorage`.
- Tính năng hiện có (PHẢI giữ nguyên): thẻ ghi nhớ, tập viết chữ Hán (thư viện `hanzi-writer`),
  trắc nghiệm, ghép cặp, gõ pinyin, luyện nghe, luyện nói (mic), hội thoại; đọc phát âm bằng
  Web Speech API giọng `zh-CN`; lọc theo **cấp HSK** và **chủ đề**.

---

## 2. Cấu trúc dữ liệu hiện tại (điểm xuất phát)

Trong `<script>` của file HTML hiện có các biến toàn cục sau (tên có thể khác chút, hãy tự dò):

**`WORDS`** — mảng từ vựng, mỗi phần tử là object:
```js
{
  "w":    "爱",                 // chữ Hán (hiển thị)
  "p":    "ài",                 // pinyin
  "m":    "yêu",                // nghĩa tiếng Việt
  "ex":   "我爱你。",            // câu ví dụ (chữ Hán)
  "exp":  "wǒ ài nǐ 。",        // pinyin của câu ví dụ
  "exm":  "Anh yêu em.",        // nghĩa câu ví dụ (tiếng Việt)
  "lv":   "HSK1",               // cấp độ
  "topic":"Động từ thường dùng" // chủ đề
}
```

**`CONVS`** — mảng hội thoại, mỗi phần tử:
```js
{
  "title": "Chào hỏi & Làm quen",
  "icon":  "你",                 // 1 chữ Hán làm biểu tượng
  "lines": [
    { "who":"A", "zh":"你好！", "py":"nǐ hǎo ！", "vi":"Xin chào!" },
    { "who":"B", "zh":"...",   "py":"...",       "vi":"..." }
  ]
}
```

**`TOPICS`** — mảng chuỗi tên chủ đề (dùng đổ vào ô chọn chủ đề).

**Cấp độ**: hiện chỉ có `HSK1`, `HSK2`, và **các nút cấp được viết cứng** trong HTML.

App lọc bằng `w.lv` và `w.topic`; hiển thị dùng `w.w / w.p / w.m / w.ex / w.exp / w.exm`.
Hãy tự đọc code để xác nhận mọi chỗ tiêu thụ các trường này.

---

## 3. Kiến trúc đích (hãy hiện thực hoá)

Ý tưởng: **CSV là nguồn dữ liệu gốc** (người biên soạn sửa), một **script sinh ra file `.js`**
mà app nạp, và một **manifest** để app **tự phát hiện** cấp/dữ liệu mới mà không phải sửa HTML.

### 3.1 Cây thư mục mục tiêu
```
<app>.html                      # app (giữ nguyên phần lớn; chỉ đổi cách nạp dữ liệu)
data/
  registry.js                   # định nghĩa registerLevel() + bộ gom HSKData. NẠP ĐẦU TIÊN.
  manifest.js                   # TỰ SINH: đặt biến LEVELS = ["HSK1","HSK2",...]
  <LEVEL>/<level>.js            # TỰ SINH từ CSV, ví dụ data/HSK1/hsk1.js — ĐỪNG sửa tay
  csv/                          # NGUỒN DỮ LIỆU GỐC — soạn bằng Excel/Sheets
    HSK1/
      words.csv                 # từ vựng của cấp
      conversations.csv         # hội thoại của cấp (không bắt buộc)
    HSK2/
      words.csv
      conversations.csv
    _TEMPLATE/                  # thư mục mẫu để chép khi thêm cấp mới
      words.csv
      conversations.csv
    README.md                   # hướng dẫn cho người biên soạn (tiếng Việt)
tools/
  build.ps1                     # đọc CSV -> sinh <level>.js + manifest.js
```

### 3.2 Cơ chế nạp (QUAN TRỌNG — phải chạy trên `file://`)
Trên `file://`, trình duyệt **không thể liệt kê thư mục** và `fetch()` bị chặn. Vì vậy:
1. `data/registry.js` định nghĩa `registerLevel(level, { words, conversations })` gom vào một
   bộ sưu tập toàn cục `HSKData` với các hàm `HSKData.words()`, `HSKData.conversations()`,
   `HSKData.levels()`, `HSKData.topics()`.
2. `data/manifest.js` đặt `LEVELS = [...]` (ghi ra **cả `window` và `self`** để trang lẫn
   service worker nếu có đều đọc được).
3. Một **bộ nạp inline nhỏ** trong HTML, đặt **sau** `manifest.js` và **trước** phần JS chính,
   duyệt `LEVELS` và dùng `document.write` để chèn thẻ `<script src="data/<LEVEL>/<level>.js">`
   cho từng cấp — **đồng bộ, đúng thứ tự** (document.write lúc trang đang parse thì chạy tuần
   tự; ĐỪNG để các script này `async`/`defer` kẻo xoá trắng trang).
4. Phần JS chính của app chạy **cuối cùng**, đọc dữ liệu từ `HSKData.*` thay cho các biến
   `WORDS/CONVS/TOPICS` nhúng cũ.

Thứ tự nạp bắt buộc: `registry.js` → `manifest.js` → (bộ nạp document.write các `<level>.js`)
→ JS chính của app.

### 3.3 File cấp tự sinh trông như thế nào
Mỗi `data/<LEVEL>/<level>.js` chỉ gọi một hàm, ví dụ:
```js
// TỰ ĐỘNG SINH từ data/csv/HSK1/*.csv — ĐỪNG SỬA TAY.
registerLevel("HSK1", {
  words: [
    { w:"爱", p:"ài", m:"yêu", ex:"我爱你。", exp:"wǒ ài nǐ 。", exm:"Anh yêu em.", topic:"Động từ thường dùng" },
    // ...
  ],
  conversations: [
    { title:"Chào hỏi & Làm quen", icon:"你", lines:[ { who:"A", zh:"你好！", py:"nǐ hǎo ！", vi:"Xin chào!" } /* ... */ ] }
    // ...
  ]
});
```
`registry.js` gắn `lv: "<LEVEL>"` vào từng từ khi gom, để app lọc theo cấp như cũ.
`HSKData.topics()` **tự suy ra** danh sách chủ đề từ các `topic` xuất hiện trong từ vựng
(giữ thứ tự xuất hiện lần đầu) — người biên soạn chỉ cần gõ tên chủ đề vào cột, không phải
khai báo danh sách ở đâu khác.

---

## 4. Định dạng CSV (tiêu đề cột tiếng Việt cho người biên soạn dễ hiểu)

Lưu **UTF-8 có BOM** để Excel đọc đúng chữ Hán. Dòng đầu là tiêu đề cột — KHÔNG được xoá.

**`words.csv`** (mỗi cấp một file):
| Cột | Ý nghĩa |
|-----|---------|
| `chuHan`       | chữ Hán hiển thị (bắt buộc) |
| `pinyin`       | pinyin |
| `nghia`        | nghĩa tiếng Việt |
| `viDu`         | câu ví dụ (chữ Hán) |
| `viDuPinyin`   | pinyin của câu ví dụ |
| `viDuNghia`    | nghĩa câu ví dụ (tiếng Việt) |
| `chuDe`        | chủ đề (chuỗi tự do; giống nhau sẽ gộp thành một nhóm) |

**`conversations.csv`** (không bắt buộc; mỗi cấp một file). **Mỗi dòng là một câu thoại**,
các dòng cùng `hoiThoai` gộp thành một hội thoại theo đúng thứ tự dòng:
| Cột | Ý nghĩa |
|-----|---------|
| `hoiThoai` | tên hội thoại (khoá gộp nhóm) |
| `icon`     | 1 chữ Hán biểu tượng (chỉ cần điền ở dòng đầu mỗi hội thoại) |
| `nguoi`    | người nói: `A` hoặc `B` |
| `cau`      | câu (chữ Hán) |
| `pinyin`   | pinyin |
| `nghia`    | nghĩa tiếng Việt |

Ánh xạ CSV → khoá nội bộ (build tự làm, để KHÔNG phải sửa app):
`chuHan→w, pinyin→p, nghia→m, viDu→ex, viDuPinyin→exp, viDuNghia→exm, chuDe→topic`;
hội thoại: `cau→zh, pinyin→py, nghia→vi, nguoi→who`.

---

## 5. Script build (`tools/build.ps1`, PowerShell 7 — không cần cài gì trên Windows)

Yêu cầu:
1. Quét `data/csv/` tìm các **thư mục cấp** (mọi thư mục trừ `_TEMPLATE`), ví dụ `HSK1`, `HSK2`.
   Thứ tự cấp: theo số trong tên (HSK1 trước HSK6), tên khác đẩy xuống cuối.
2. Với mỗi cấp, đọc `words.csv` (và `conversations.csv` nếu có) bằng `Import-Csv -Encoding utf8`.
3. Sinh `data/<LEVEL>/<level>.js` gọi `registerLevel("<LEVEL>", { words:[...], conversations:[...] })`,
   ánh xạ cột như mục 4. Escape chuỗi an toàn cho JS (nháy kép, backslash, xuống dòng).
4. Sinh `data/manifest.js` đặt `LEVELS` (đúng thứ tự) — ghi ra cả `window` và `self`.
5. **Dọn rác**: xoá file/thư mục `.js` cấp đã sinh nhưng CSV không còn (CSV là nguồn duy nhất).
6. Ghi file **UTF-8 KHÔNG BOM** cho các `.js` sinh ra.
7. (Nếu app có service worker) tự tăng số phiên bản cache.
8. In tóm tắt: mỗi cấp bao nhiêu từ / hội thoại.

> **Bẫy PowerShell:** tên biến **không phân biệt hoa/thường** — biến vòng lặp (vd `$dir`)
> có thể vô tình đè biến gốc (vd `$Dir`) và làm ghi sai đường dẫn. Đặt tên biến khác hẳn nhau.

*(Có thể dùng Node thay PowerShell nếu muốn, nhưng ưu tiên PowerShell để người biên soạn trên
Windows chạy được ngay bằng chuột phải → "Run with PowerShell".)*

---

## 6. Quy trình của người biên soạn (mục tiêu trải nghiệm)

- **Sửa/thêm từ:** mở `data/csv/HSK1/words.csv` bằng Excel, thêm dòng, lưu → chạy `tools/build.ps1`.
- **Thêm cấp mới (vd HSK3):** chép thư mục `data/csv/_TEMPLATE/` → `data/csv/HSK3/`, điền CSV,
  chạy build. **Nút cấp "HSK3" phải tự xuất hiện** (đọc từ `LEVELS`) — KHÔNG sửa HTML.
- Không phải chạm vào HTML/JS trong mọi thao tác trên.

Vì vậy: **các nút chọn cấp trong HTML phải được sinh động từ `HSKData.levels()`/`LEVELS`**,
không còn viết cứng `HSK1/HSK2`.

---

## 7. Cạm bẫy kỹ thuật cần tuân thủ

- **Giữ chạy trên `file://`**: không dùng `fetch`/ES module cho việc nạp dữ liệu; chỉ thẻ
  `<script>` + `document.write` đồng bộ theo manifest.
- **`document.write` phải chạy lúc parse** (script inline thường), không `async`/`defer`.
- **UTF-8**: CSV lưu **có BOM** (cho Excel đọc chữ Hán); file `.js` sinh ra **không BOM**.
- **CRLF**: nếu build trên Windows sinh CRLF, git có thể chuẩn hoá về LF — vô hại.
- **`hanzi-writer`** (tập viết/thứ tự nét) tải từ CDN nên **cần internet**; phải **giữ nguyên
  đường lùi (fallback) offline** hiện có, đừng làm hỏng.
- **Không đổi tên** các thứ ảnh hưởng dữ liệu đã lưu: id phần tử DOM đang dùng, khoá
  `localStorage`, và tên trường nội bộ (`w/p/m/ex/exp/exm/lv/topic`, `title/icon/lines/who/zh/py/vi`).
- Dữ liệu sau tái cấu trúc phải **giống hệt** dữ liệu nhúng ban đầu (không mất chữ, không đổi nghĩa).

---

## 8. Cách kiểm chứng (không có trình duyệt vẫn làm được)

1. **Trung thực dữ liệu:** trước khi bỏ dữ liệu nhúng, trích nó ra; sau khi sinh từ CSV, so sánh
   sâu hai bên phải **khớp 100%** (số lượng từ, hội thoại, và từng trường).
2. **Cú pháp:** `node --check` mọi file `.js` sinh ra + `registry.js` + `manifest.js`.
3. **Mô phỏng chuỗi nạp bằng Node:** đặt `global.window = global`, nạp `registry.js` rồi
   `manifest.js`, duyệt `LEVELS` nạp từng `data/<LEVEL>/<level>.js`, kiểm
   `HSKData.words().length`, `HSKData.conversations().length`, `HSKData.topics()`.
4. **Thử vòng thêm cấp:** tạo thử `data/csv/HSK3/words.csv` vài dòng → build → xác nhận
   `manifest.js` có `HSK3` và `data/HSK3/hsk3.js` xuất hiện → xoá đi build lại → biến mất.
5. **Người dùng tự mở** file HTML (double-click) xác nhận nút cấp + dữ liệu hiển thị đúng.

---

## 9. Tiêu chí hoàn thành (Definition of Done)

- [ ] Toàn bộ `WORDS`/`CONVS` nhúng đã chuyển sang CSV trong `data/csv/<LEVEL>/`, và app đọc
      qua `HSKData.*` (không còn mảng dữ liệu lớn nhúng trong HTML).
- [ ] `tools/build.ps1` sinh lại `<level>.js` + `manifest.js` từ CSV, có dọn rác.
- [ ] Thêm từ = sửa CSV + chạy build. Thêm cấp = chép `_TEMPLATE/` + build. **Không sửa HTML.**
- [ ] Nút chọn cấp sinh động từ manifest; ô chủ đề suy ra tự động từ dữ liệu.
- [ ] Mọi tính năng cũ chạy y như trước; mở bằng `file://` vẫn được.
- [ ] Dữ liệu khớp 100% với bản gốc (đã kiểm chứng).
- [ ] Có `data/csv/README.md` hướng dẫn người biên soạn (tiếng Việt) + `_TEMPLATE/`.
- [ ] Tài liệu ngắn (README/CLAUDE.md) mô tả kiến trúc mới & quy trình thêm cấp/từ.

---

## 10. KHÔNG làm những việc sau

- Không thêm framework, bundler, hay bước build cho lúc chạy; không biến thành ES module.
- Không dùng `fetch`/HTTP để nạp dữ liệu (sẽ hỏng `file://`).
- Không đổi giao diện, luồng chơi, hay tên trường dữ liệu/id/khoá localStorage.
- Không xoá/không làm hỏng đường lùi offline của `hanzi-writer`.
- Không tự ý commit/push nếu chưa được yêu cầu; giải thích thay đổi trước khi làm việc lớn.

---

### Gợi ý các bước triển khai (thứ tự đề xuất)
1. Đọc file HTML, xác định chính xác nơi khai báo `WORDS/CONVS/TOPICS` và mọi nơi tiêu thụ.
2. Viết script trích dữ liệu nhúng → sinh CSV theo cấu trúc mục 3–4 (một lần).
3. Viết `data/registry.js` (`registerLevel` + `HSKData`).
4. Viết `tools/build.ps1`; chạy để sinh `<level>.js` + `manifest.js`; kiểm chứng trung thực.
5. Sửa HTML: bỏ dữ liệu nhúng; thêm thẻ nạp `registry.js` + `manifest.js` + bộ nạp
   `document.write`; đổi app để đọc `HSKData.*`; sinh nút cấp từ `LEVELS`.
6. Thêm `_TEMPLATE/`, `README.md`, tài liệu kiến trúc; chạy các bước kiểm chứng mục 8.
```
