---
name: add-grammar
description: Đối chiếu danh sách ngữ pháp người dùng dán vào với ngữ pháp HIỆN TẠI của một bài trong app tiếng Nhật (Minna no Nihongo "Bài N", hoặc Gungun "Chương N phần A/B/C"), tìm điểm còn THIẾU, bổ sung vào grammar.csv và thêm câu ví dụ tương ứng vào sentences.csv. XÁC ĐỊNH GIÁO TRÌNH trước khi sửa file. Dùng khi người dùng dán các điểm ngữ pháp của một bài (thường mở đầu "Ngữ pháp ... Bài N") và muốn kiểm tra bài đó có thiếu ngữ pháp không. CHỈ cho app tiếng Nhật này, chỉ NGỮ PHÁP + câu ví dụ (không thêm từ vựng trừ khi cần cho ví dụ).
---

# /add-grammar — đối chiếu & bổ sung ngữ pháp cho một bài

Người dùng dán vào **danh sách các điểm ngữ pháp** của một bài (thường có "Bài N" trong nội
dung). Nhiệm vụ: **so sánh với ngữ pháp hiện tại của bài đó, tìm điểm còn thiếu, bổ sung vào
`grammar.csv`, và thêm câu ví dụ cho các cấu trúc mới/chưa có vào `sentences.csv`.**

## 0. XÁC ĐỊNH GIÁO TRÌNH + ĐƠN VỊ BÀI (bắt buộc)

App có **2 giáo trình**, mỗi giáo trình có `grammar.csv` riêng cho từng đơn vị:

| Giáo trình | Đơn vị | Thư mục |
| --- | --- | --- |
| **Minna no Nihongo** | Bài N | `data/lessons/csv/MINNA/N5/lesson-NN/` |
| **Gungun** | Chương N **phần A/B/C** (mỗi phần có ngữ pháp riêng) | `data/lessons/csv/GUNGUN/N5/lesson-NN<PHẦN>/` |

- "Bài 8" / không nói gì thêm → **Minna**, `N = 8`, `NN = 08`.
- "Chương 1 phần B" / "gungun 1B" → **Gungun**, thư mục `lesson-01B`.
- **Không rõ giáo trình hoặc số bài/phần → HỎI, đừng đoán.** Đặt nhầm giáo trình là ngữ pháp
  chui vào sai sách và hiện sai chỗ trong app.

Gọi `<DIR>` = thư mục ở trên, `<JS>` = `data/lessons/<GIÁO_TRÌNH>/N5/lesson-<NN>[PHẦN].js`.
Trình độ mặc định **N5**.

## Quy trình

### 1. Đọc trạng thái hiện tại của bài
Đọc cả 3 file của bài:
- `<DIR>/grammar.csv` — danh sách ngữ pháp HIỆN TẠI (cột `mau_cau`).
- `<DIR>/sentences.csv` — câu ví dụ đã có (để biết cấu trúc nào đã được minh hoạ, tránh trùng).
- `<DIR>/words.csv` — từ vựng của bài (để viết ví dụ đúng phạm vi).

Nếu thư mục bài chưa tồn tại → báo bài chưa có, gợi ý dùng `/add-vocab` trước
(`/add-vocab N` cho Minna, `/add-vocab gungun NP` cho Gungun); dừng.

### 2. Đối chiếu & tìm điểm thiếu
Lập bảng đối chiếu **từng điểm** người dùng dán ↔ ngữ pháp hiện có. Một điểm coi là "ĐÃ CÓ" nếu
grammar.csv đã có mục dạy đúng mẫu đó (dù tên gọi khác). Coi là "THIẾU" nếu:
- Hoàn toàn chưa có mục nào dạy mẫu đó, **hoặc**
- Mẫu đó đang bị **gộp chung** trong một mục khác và đáng tách riêng (vd まだです đang nằm lẫn trong もう～ました), **hoặc**
- Có mục nhưng **thiếu lưu ý/cảnh báo quan trọng** người dùng nêu (vd ⚠️ không dùng ～ませんでした; nguồn là tổ chức thì chỉ dùng から).

Trình bày bảng đối chiếu ngắn gọn cho người dùng thấy trước khi sửa (điểm nào ✓ đã có, điểm nào ✗ thiếu).
**Nếu không thiếu gì → báo "bài N đã đủ ngữ pháp", nêu rõ đã đối chiếu; không sửa file.**

### 3. Bổ sung grammar.csv
Với mỗi điểm thiếu, thêm 1 dòng vào `grammar.csv` (header `mau_cau,giai_thich,vi_du,vi_du_romaji,nghia`):
- `mau_cau`: tên mẫu, mở đầu bằng số khoanh tròn ①②③… **nối tiếp / đánh số lại cho liền mạch**
  (nếu chèn vào giữa làm lệch số, đánh số lại toàn bộ cho gọn — chỉ vài dòng).
- `giai_thich`: giải thích ngắn **tiếng Việt**, kèm 2–3 mẫu ví dụ ngắn; đưa vào cả **lưu ý/cảnh báo ⚠️**
  người dùng nêu. Ô này gần như luôn có dấu phẩy → **bọc nháy kép** `"..."`.
- `vi_du` / `vi_du_romaji` / `nghia`: một câu ví dụ tiêu biểu (Nhật / romaji / nghĩa Việt).

Giữ nguyên các dòng cũ; chỉ thêm dòng mới (và đánh số lại nếu cần).

### 4. Thêm câu ví dụ vào sentences.csv
Với **mỗi cấu trúc mới thêm** (và cả cấu trúc cũ mà sentences.csv chưa minh hoạ), thêm **2–4 câu**
vào `<DIR>/sentences.csv` (header `cau,romaji,nghia`):
- Dùng đúng **từ vựng + ngữ pháp của bài đó hoặc bài/phần trước trong CÙNG giáo trình**
  (đọc `<DIR>/words.csv` để đúng phạm vi). Đừng mượn từ vựng của giáo trình kia — hai lộ
  trình học tách rời, người học có thể chưa gặp từ đó ở sách này.
- Câu hỏi–đáp: tách 2 dòng, dòng đáp án bắt đầu bằng `…`.
- Nếu câu minh hoạ một lưu ý đọc (vd 何 = なん) hay quy tắc, thêm chú thích ngắn trong cột `nghia` (vd "(何 đọc là なん)").
- Nếu ví dụ cần một từ chưa có trong `words.csv` nhưng là **từ vựng chuẩn của bài đó** (vd パーティー ở Bài 6),
  thêm từ đó vào `words.csv` luôn cho nhất quán. Đừng thêm từ ngoài phạm vi bài chỉ để có ví dụ.

### 5. QUY TẮC KANA (bắt buộc cho N5)
Người dùng học **N5, chưa đọc được kanji**. Trong **grammar.csv** (`vi_du`/`giai_thich`) **và**
**sentences.csv**, viết tiếng Nhật **bằng kana** (hiragana; katakana cho từ ngoại lai), **KHÔNG dùng
kanji trần** — vd `ごはんを たべます`, KHÔNG phải `ご飯を食べます`; nếu buộc phải có kanji thì kèm cách đọc.
**Ngoại lệ:** `words.csv` vẫn giữ kanji ở cột `tiengNhat` và cách đọc ở cột `kana`. (Quy tắc này cũng
ghi trong `CLAUDE.md` và `HANDOFF.md`.)

### 6. Build
Chạy: `pwsh -ExecutionPolicy Bypass -File tools/build-lessons.ps1`
Nó sinh lại `<JS>`, cập nhật `manifest.js`, bump cache `sw.js`. Không sửa HTML.

### 7. Verify
- `node --check <JS>` — cú pháp hợp lệ.
- Xác nhận output build **cho đúng dòng của giáo trình đó** tăng đúng số câu / số ngữ pháp.
- Spot-check vài dòng có dấu phẩy đã bọc nháy đúng.

### 8. Báo cáo & hỏi commit
- Bảng đối chiếu: điểm nào đã có, điểm nào vừa thêm.
- Tóm tắt kèm **tên giáo trình**: "Minna · Bài N" / "Gungun · Chương N phần P —
  trước C1 ngữ pháp/S1 câu → nay C2 ngữ pháp/S2 câu".
- **HỎI người dùng trước khi commit/push** (đừng tự commit trừ khi được yêu cầu). Khi commit,
  add cả CSV nguồn lẫn `.js` sinh ra + `sw.js`.

## Phong cách (nhất quán với các bài đã có — xem `lesson-06`, `lesson-07`)
- Câu **chủ yếu hiragana**, katakana cho từ ngoại lai, **cách khoảng giữa các bunsetsu**.
- Ngữ pháp đánh số ①②③…, giải thích **tiếng Việt** ngắn gọn + 1 ví dụ Nhật/romaji/nghĩa.
- Chỉ dùng từ vựng/ngữ pháp thuộc **bài đó hoặc bài trước, trong cùng giáo trình**
  (tránh mẫu của bài sau, và tránh mượn từ giáo trình kia).
- Không đối chiếu từ trí nhớ máy móc: đọc kỹ grammar.csv hiện tại để tránh báo "thiếu" một mẫu
  thực ra đã có dưới tên khác.
