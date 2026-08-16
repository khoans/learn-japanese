---
name: add-vocab
description: Thêm từ vựng (+ câu, ngữ pháp) cho MỘT bài vào app tiếng Nhật — CHỌN GIÁO TRÌNH trước: Minna no Nihongo (bài 1..N, có phụ lục 参考語彙) hay Gungun (chương chia phần A/B/C, nội dung do người dùng cung cấp). Dùng khi người dùng gõ "/add-vocab <số bài>" (vd /add-vocab 10 = Minna bài 10, /add-vocab gungun 1A = Gungun chương 1 phần A) hoặc khi thêm/sửa vài từ lẻ vào bài đã có. Với Minna: lấy danh sách từ vựng từ vnjpclub (hay bị chặn → tự soạn theo giáo trình) + tự soạn phụ lục/câu/ngữ pháp. Với Gungun: KHÔNG có nguồn web, phải lấy nội dung người dùng dán vào. Sinh CSV rồi chạy build. KHÔNG dùng cho ngôn ngữ khác hay việc khác.
---

# /add-vocab [giáo trình] <số bài / chương+phần>

Thêm một **đơn vị học** vào app theo đúng kiến trúc CSV → build.

## 0. XÁC ĐỊNH GIÁO TRÌNH TRƯỚC (bắt buộc)

App có **2 giáo trình**, dữ liệu tách rời hoàn toàn — sai giáo trình là hỏng cả bài:

| Giáo trình | Mã | Đơn vị | Thư mục CSV | Nguồn nội dung |
| --- | --- | --- | --- | --- |
| Minna no Nihongo | `MINNA` | **Bài** 1…N | `csv/MINNA/N5/lesson-NN/` | web (vnjpclub) + tự soạn |
| Gungun | `GUNGUN` | **Chương** chia **Phần A/B/C** | `csv/GUNGUN/N5/lesson-NN<PHẦN>/` | **người dùng dán vào** |

Cách suy ra tham số:
- `/add-vocab 10` → Minna, Bài 10 → `csv/MINNA/N5/lesson-10/`.
- `/add-vocab gungun 1A` (hoặc "gungun chương 1 phần A") → `csv/GUNGUN/N5/lesson-01A/`.
- Người dùng đang dán sẵn danh sách từ + ngữ pháp và nói "chương/phần" → Gungun.
- **Không rõ giáo trình HOẶC không rõ số bài/phần → HỎI, đừng đoán.**

Ký hiệu dùng trong tài liệu này: `X` = số bài/chương, `NN` = X dạng 2 chữ số,
`<DIR>` = thư mục CSV của đơn vị đó (theo bảng trên), `<JS>` = file sinh ra tương ứng
(`data/lessons/<GIÁO_TRÌNH>/N5/lesson-<NN>[PHẦN].js`).

Các bước 2b (phụ lục), 4 (reading/conversation 5+5) và mục "Phong cách" ở dưới viết cho
**Minna**; phần **Gungun** xem mục riêng ở cuối file.

## ⛔ LUẬT BẤT DI BẤT DỊCH — thêm từ vựng là thêm ĐỦ BỘ

Người dùng đã chốt: **hễ thêm từ vựng thì phải thêm đầy đủ mọi mục của từ đó**, không được
để trống rồi tính bổ sung sau. "Đủ bộ" nghĩa là:

1. **Trong `words.csv`** — đủ **cả 4 cột**: `tiengNhat` để **dạng kanji chuẩn** của từ (đừng
   ghi kana nếu từ đó có kanji), `romaji`, `nghia` tiếng Việt, `kana` là cách đọc
   (**katakana cho từ ngoại lai**: `アメリカ` chứ không phải `あめりか`), + `phuluc` nếu là 参考語彙.
2. **Trong `data/lessons/csv/kanji-parts.csv`** — **MỌI chữ kanji mới** xuất hiện trong các từ
   vừa thêm phải có một dòng: bộ thủ cấu tạo (`*` = bộ chính), âm Hán Việt, nghĩa, `am_on`,
   `am_kun`. Đây là thứ nuôi **tooltip rê chuột vào kanji** và **chế độ luyện "Kanji theo bài"**
   — thiếu là chữ đó câm lặng, không tooltip và không lên thẻ.
3. Chạy build rồi **rà lại**: mọi chữ kanji trong từ vựng của bài đều có trong `KANJI_PARTS`,
   mỗi dòng có đúng một `*`, có `am_on` hoặc `am_kun`, và mọi thành phần đều tra được nghĩa.

Áp dụng cho **mọi lần chạm vào từ vựng**, kể cả khi chỉ bổ sung vài từ lẻ vào bài đã có,
không riêng lúc tạo bài mới.

## Quy trình (mặc định = Minna; Gungun xem mục cuối file)

### 1. Kiểm tra trùng
Nếu `<DIR>` đã tồn tại → báo bài đã có, HỎI có ghi đè không; dừng nếu không.

### 2. Lấy từ vựng — 2 phần: **本冊語彙** (chính) + **参考語彙** (phụ lục)

**2a. Từ vựng chính — thử WebFetch:**
`https://jls.vnjpclub.com/tu-vung-minna-no-nihongo-bai-X.html`

Prompt trích: *"Mỗi từ 4 trường ngăn bằng `|`: (1) chữ Nhật hiển thị, (2) romaji, (3) nghĩa tiếng Việt, (4) kana. Mỗi từ một dòng, không thêm gì khác."*

> Trang này **hay bị Cloudflare chặn** (trả về "One moment, please… verifying"). Thử **tối đa 2
> lần**, nếu vẫn chặn thì **tự soạn danh sách theo giáo trình Minna no Nihongo I** và NÓI RÕ
> điều đó trong báo cáo cuối. Đừng lãng phí lượt tra nhiều nguồn khác: các trang tiếng Việt
> (riki, mcbooks, trungtamnhatngu…) và cả trang giáo viên Nhật (langoal) **đều chỉ đăng từ
> vựng chính**, không trang nào có phụ lục.

**2b. Phụ lục (参考語彙) — KHÔNG có nguồn web, phải tự soạn + hỏi người dùng:**
Mỗi bài Minna thường có 1 bảng 参考語彙 ở trang riêng (không nằm trong danh sách từ mới):
vd bài 3 quầy bách hoá · 4 tổ hợp thời gian · 6 rau củ quả–thịt–cá · 7 xưng hô gia đình ·
8 màu sắc–vị · 9 thể loại nhạc/phim/thể thao · 10 các phòng trong nhà · 11 thực đơn ·
13 địa điểm trong thành phố · 14 nhà ga–loại tàu · 15 nghề nghiệp · 16 màn hình ATM ·
17 triệu chứng bệnh–bộ phận cơ thể.
→ **Tự soạn bảng phụ lục của Bài X** theo giáo trình, đưa vào cùng `words.csv` với `phuluc=1`.
→ Ở bước 7 **CHỦ ĐỘNG mời người dùng dán danh sách từ vựng + phụ lục trong sách** để đối chiếu
bổ sung (thực tế bảng tự soạn thường thiếu 20–60 từ so với sách).

**Bản quyền:** chỉ lấy **danh sách từ vựng** (dữ liệu factual). **KHÔNG sao chép** câu ví dụ,
giải thích ngữ pháp hay đoạn văn của trang — phần câu + ngữ pháp phải **tự soạn** (bước 4).

### 3. Làm sạch từ vựng
- Bỏ ký hiệu `[な]` / `[na]` ở tính từ đuôi な (`好き[な]` → `好き`).
- Chuẩn hoá romaji: `ｰ`/dấu kéo dài lạ → viết thường (`supootsu`, `konsaato`, `roomaji`); bỏ ký tự rác.
- Trường dạng "A/B" (`夫/主人`, `妻/家内`) → chọn 1 dạng thông dụng.
- Bỏ trợ từ/ngữ pháp thuần khỏi cột từ vựng nếu đã đưa vào grammar (vd `～から`).

### 4. Tạo 5 CSV — UTF-8 **CÓ BOM** (bắt đầu bằng ký tự ﻿), header **tiếng Việt**
Thư mục `<DIR>` (Minna: `csv/MINNA/N5/lesson-NN/`). Ô nào chứa dấu phẩy `,` phải bọc nháy kép `"..."`.

- **`words.csv`** — header `tiengNhat,romaji,nghia,kana,phuluc`. Mỗi từ 1 dòng (từ bước 2–3).
  Cột `phuluc`: để TRỐNG với **từ chính** (本冊語彙, gồm cả từ phần 会話); điền `1` với các từ
  thuộc **bảng phụ lục** (参考語彙 ở bước 2b) → app hiện badge 📎 phụ lục, người học biết đó là
  từ tham khảo, không bắt buộc thuộc. **Xếp toàn bộ khối phụ lục xuống CUỐI file**, sau các từ
  chính (giữ nhất quán với bài 3–17 hiện có, dễ rà lại sau này).
- **`sentences.csv`** — header `cau,romaji,nghia`. **TỰ SOẠN ~25–30 câu** dùng đúng
  **từ vựng + mẫu ngữ pháp của Bài X**. Câu hỏi–đáp: dòng đáp án bắt đầu bằng `…`.
- **`grammar.csv`** — header `mau_cau,giai_thich,vi_du,vi_du_romaji,nghia`. **TỰ SOẠN ~5–7 điểm
  ngữ pháp CHUẨN của Bài X** (theo giáo trình Minna no Nihongo). Cột `giai_thich` thường có
  dấu phẩy → nhớ bọc nháy.

- **`reading.csv`** — header `tieu_de,doan_van,nghia,cau_hoi1,dap_an1,cau_hoi2,dap_an2,cau_hoi3,dap_an3`.
  **TỰ SOẠN ĐÚNG 5 bài đọc**, mỗi bài 4–5 câu, chỉ dùng từ vựng + ngữ pháp **đến Bài X**
  (được dùng lại bài trước, KHÔNG dùng mẫu của bài sau). `tieu_de` viết **tiếng Việt**.
  `doan_van` tách từng câu bằng `|`; `nghia` là bản dịch **cùng số dòng, cùng thứ tự**.
  Mỗi bài đọc kèm **3 câu hỏi** tiếng Nhật + đáp án tiếng Nhật (trả lời được từ đoạn văn).
- **`conversation.csv`** — header `tieu_de,boi_canh,hoi_thoai,nghia`. **TỰ SOẠN ĐÚNG 5 đoạn
  hội thoại**, mỗi đoạn 6–7 lượt nói, tình huống đời thường đúng phạm vi Bài X.
  `tieu_de` + `boi_canh` viết **tiếng Việt**. `hoi_thoai` tách từng lượt bằng `|`, mỗi lượt
  dạng `TênNgười：câu nói` (dùng nhân vật Minna: ミラー・やまだ・サントス・キム・ワット…);
  `nghia` cũng **cùng số dòng, cùng thứ tự**.

> ⚠️ Số dòng `|` của `nghia` phải **bằng đúng** số dòng của `doan_van`/`hoi_thoai` — build
> KHÔNG kiểm tra, lệch là bản dịch ghép sai câu.

> **Furigana:** nếu viết kanji trong bài đọc/hội thoại thì **bắt buộc** kèm cách đọc trong
> ngoặc vuông ngay sau: `私[わたし]は 学生[がくせい]です。` (app hiện furigana khi rê chuột).
> Mặc định các bài đọc/hội thoại ngắn vẫn viết **toàn kana** theo quy ước N5; chỉ dùng
> kanji+furigana cho các bài đọc dài, và khi dùng thì **mọi kanji** đều phải có ngoặc.

Ánh xạ nội bộ (build tự làm, đừng lo): grammar `mau_cau/giai_thich/vi_du/vi_du_romaji/nghia`
→ `p/g/ex/exr/m`.

### 4b. BẮT BUỘC — bổ sung `kanji-parts.csv` cho mọi kanji mới

Không được bỏ bước này (xem luật ở đầu file). File dùng chung mọi bài:
`data/lessons/csv/kanji-parts.csv`, header `kanji,am_han_viet,nghia,bo_thu,am_on,am_kun`.

1. Liệt kê kanji của Bài X **chưa có** trong `KANJI_PARTS`:
   ```
   node -e "const fs=require('fs'),vm=require('vm');const sb={console};vm.createContext(sb);
   vm.runInContext(fs.readFileSync('data/kanji-parts.js','utf8'),sb);
   const KP=vm.runInContext('KANJI_PARTS',sb);global.window=global;require('./data/registry.js');
   require('./<JS>');const s=new Set();   // vd ./data/lessons/GUNGUN/N5/lesson-01A.js
   JPLessons.words().forEach(w=>(String(w[0]).match(/[一-鿿々]/g)||[]).forEach(c=>s.add(c)));
   console.log([...s].filter(c=>!KP[c]).join(' '))"
   ```
2. Thêm một dòng cho **từng chữ**: `bo_thu` tách bằng `|`, `*` trước **bộ chính** (bộ Khang Hy),
   `chữ=nghĩa` cho thành phần không nằm trong 214 bộ thủ; `am_on` katakana, `am_kun` hiragana
   với okurigana trong ngoặc (`おお(きい)`). Dạng viết tắt / shinjitai (亻刂攵礻糹戸…) app tự quy
   về dạng gốc qua bảng `VARIANT` trong `js/kanji-tip.js` — nếu gặp dạng chưa có thì thêm vào đó
   chứ đừng bịa dòng bộ thủ mới.
3. Chạy build rồi **rà**: mỗi dòng có đúng một `*`, có `am_on` hoặc `am_kun`, mọi thành phần
   tra được nghĩa, và không còn chữ nào của bài thiếu dữ liệu.

### 5. Build
Chạy: `pwsh -ExecutionPolicy Bypass -File tools/build-lessons.ps1`
Nó sinh `<JS>`, cập nhật `data/lessons/manifest.js`, bump cache `sw.js`. Không cần sửa HTML.
Dòng tổng kết in ra **theo từng giáo trình** — kiểm tra bài mới nằm đúng giáo trình mong muốn.

### 6. Verify
- `node --check <JS>`.
- Spot-check vài dòng có dấu phẩy (câu `から`, giải thích ngữ pháp) đã bọc nháy đúng.
- (Nếu có `scratchpad/boot-sim.js` hoặc tự dựng) chạy boot-sim để chắc app nạp được và tổng
  số từ/câu tăng đúng.
- **Checklist "đủ bộ" — phải xanh hết trước khi báo cáo:**
  - [ ] Mọi từ có kanji đều để **dạng kanji** ở `tiengNhat` (không ghi kana thay thế).
  - [ ] Cột `kana` đúng: **katakana** cho từ ngoại lai, hiragana cho từ thuần.
  - [ ] Mọi chữ kanji của bài đều có dòng trong `kanji-parts.csv` (bộ thủ + On + Kun).
  - [ ] `reading.csv` + `conversation.csv` đủ 5 + 5, số dòng `|` khớp giữa Nhật và Việt.
  - [ ] Kanji trong bài đọc dài (nếu có) đều kèm furigana `[...]`.

### 7. Báo cáo & hỏi commit
- Tóm tắt: “Bài X — A từ (trong đó P từ phụ lục) · B câu · C ngữ pháp · 5 bài đọc · 5 hội thoại
  · K chữ kanji có bộ thủ”, liệt kê nhanh các mẫu ngữ pháp và tên khối phụ lục đã thêm.
- Nói rõ nguồn: **câu + ngữ pháp luôn do tự soạn**; danh sách từ chính lấy từ web hay tự soạn
  (nếu vnjpclub bị chặn); **bảng phụ lục luôn là tự soạn** vì không có nguồn web.
- **MỜI người dùng dán danh sách từ vựng + phụ lục trong sách** để đối chiếu bổ sung.
- **HỎI người dùng trước khi commit** (đừng tự commit/push trừ khi được yêu cầu).

## GUNGUN — chương chia phần A/B/C

Khác Minna ở **nguồn nội dung** và **đơn vị**; luật "thêm từ vựng là thêm ĐỦ BỘ" ở đầu file
vẫn áp dụng y nguyên (kanji form, kana/katakana, romaji, nghĩa, + `kanji-parts.csv`).

1. **Mỗi PHẦN là một thư mục riêng**: `csv/GUNGUN/N5/lesson-01A/`, `lesson-01B/`, `lesson-01C/`
   (tên = `lesson-` + số chương 2 chữ số + chữ phần in hoa). Chương không chia phần thì
   `lesson-02/`. Chép từ `csv/_TEMPLATE/`. Mỗi phần có **từ vựng + ngữ pháp riêng** và trở
   thành **một nút "Phần A" riêng** trong app (khoá `GUNGUN:1A`).
2. **KHÔNG có nguồn web** cho Gungun — đừng đi tra vnjpclub/langoal. Nội dung phải do
   **người dùng cung cấp**. Nếu người dùng chưa dán → **HỎI và chờ**, đừng tự bịa danh sách
   từ vựng "theo giáo trình" như bên Minna (ta không có bản quyền lẫn bản sao giáo trình này).
3. **Không có khái niệm 参考語彙** → cột `phuluc` để trống hết, trừ khi người dùng nói rõ
   khối nào là phụ lục/tham khảo.
4. **Chỉ tạo file nào có nội dung.** Tối thiểu là `words.csv` + `grammar.csv` (đúng thứ
   người dùng đưa). `sentences.csv` thì **tự soạn** câu dùng đúng từ + mẫu ngữ pháp của
   *phần đó* (khoảng 10–20 câu, hoặc theo yêu cầu). `reading.csv` / `conversation.csv`
   **không bắt buộc** — chỉ làm khi người dùng yêu cầu (đừng mặc định 5+5 như Minna).
   File nào không có nội dung thì để **chỉ dòng tiêu đề** (build chấp nhận file rỗng).
5. Ngữ pháp: `grammar.csv` cùng header `mau_cau,giai_thich,vi_du,vi_du_romaji,nghia`. Nếu
   người dùng chỉ đưa mẫu câu + giải thích thì **tự soạn ví dụ** bằng từ vựng của chính
   phần đó, và nói rõ trong báo cáo phần nào là tự soạn.
6. Build + verify + checklist "đủ bộ" giống hệt Minna, chỉ đổi đường dẫn (`<DIR>`, `<JS>`).
7. Báo cáo: “Gungun · Chương X phần P — A từ · B câu · C ngữ pháp · K kanji có bộ thủ”,
   nêu rõ mục nào lấy nguyên từ nội dung người dùng dán, mục nào tự soạn.

## Phong cách (giữ nhất quán với các bài đã có: xem `data/lessons/csv/MINNA/N5/lesson-08`, `lesson-09`)
- Câu viết **chủ yếu hiragana**, katakana cho từ ngoại lai, **cách khoảng giữa các bunsetsu**.
- Ngữ pháp đánh số ①②③…; giải thích ngắn gọn **tiếng Việt** + 1 ví dụ Nhật/romaji/nghĩa.
- Chỉ dùng từ vựng/ngữ pháp thuộc **Bài X hoặc các bài trước** (tránh mẫu của bài sau).
- Mỗi câu bao trọn ít nhất 1 mẫu ngữ pháp của bài; trải đều các mẫu.
