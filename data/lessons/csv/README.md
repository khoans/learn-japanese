# Dữ liệu bài học (CSV) — hướng dẫn cho người biên soạn

Thư mục này chứa **toàn bộ từ vựng, câu, ngữ pháp** của app dưới dạng file CSV
(mở được bằng **Excel** hoặc **Google Sheets**). Đây là **nguồn dữ liệu gốc** —
bạn chỉ cần sửa ở đây, không cần đụng tới file code.

## Cấu trúc thư mục

Dữ liệu được gom theo **trình độ** (N5, N4, N3, N2, N1), mỗi trình độ chứa nhiều
**bài**, mỗi bài là **một thư mục riêng** gồm 5 file:

```
csv/
  N5/                      ← trình độ
    lesson-01/             ← một bài (thư mục riêng)
      words.csv            ← từ vựng
      sentences.csv        ← câu ví dụ
      grammar.csv          ← ngữ pháp
      reading.csv          ← bài đọc hiểu
      conversation.csv     ← đoạn hội thoại
    lesson-02/
      ...
  N4/                      ← thêm trình độ mới = tạo thư mục N4, N3...
    lesson-01/
      ...
  _TEMPLATE/               ← thư mục mẫu để chép khi tạo bài mới
```

## Cột (dòng tiêu đề đầu tiên — ĐỪNG xoá)

| File | Cột | Ý nghĩa |
|------|-----|---------|
| `words.csv`     | `tiengNhat, romaji, nghia, kana`                | Chữ hiển thị, romaji, nghĩa tiếng Việt, hiragana/katakana |
| `sentences.csv` | `cau, romaji, nghia`                            | Câu Nhật, romaji, nghĩa tiếng Việt |
| `grammar.csv`   | `mau_cau, giai_thich, vi_du, vi_du_romaji, nghia` | Tiêu đề mẫu câu, giải thích, ví dụ Nhật, ví dụ romaji, nghĩa |
| `reading.csv`   | `tieu_de, doan_van, nghia, cau_hoi1, dap_an1, cau_hoi2, dap_an2, cau_hoi3, dap_an3` | Tiêu đề bài đọc, đoạn văn, bản dịch, tối đa 3 câu hỏi + đáp án |
| `conversation.csv` | `tieu_de, boi_canh, hoi_thoai, nghia`        | Tiêu đề, mô tả tình huống (tiếng Việt), các lượt nói, bản dịch |

> Cột `kana` để trống cũng được — khi đó app sẽ dùng luôn phần `tiengNhat`.

> **Dấu `|` tách dòng** trong `reading.csv` và `conversation.csv`:
> - `doan_van` — mỗi câu cách nhau bằng `|`; `nghia` là bản dịch **cùng số dòng, đúng thứ tự**.
> - `hoi_thoai` — mỗi lượt nói viết `TênNgười：câu nói`, cách nhau bằng `|`; `nghia` cũng
>   phải **cùng số dòng**.
> - Các cặp `cau_hoiN` / `dap_anN` không bắt buộc; để trống thì bài đọc không có câu hỏi.
> - **Furigana:** viết cách đọc trong ngoặc vuông ngay sau kanji — `私[わたし]は 学生[がくせい]です。`
>   App hiện cách đọc nhỏ phía trên kanji **khi rê chuột vào** (hoặc chạm trên điện thoại),
>   và có nút `ふ Luôn hiện furigana` để ghim cho hiện hết. Câu viết toàn kana thì cứ để
>   nguyên, không cần ngoặc. Phần trong ngoặc được bỏ đi khi đọc thành tiếng.
> - Hai file này để trống (chỉ có dòng tiêu đề) cũng được — app chỉ ẩn phần đó đi.

## `kanji-parts.csv` — bộ thủ cấu tạo nên từng chữ kanji

File `csv/kanji-parts.csv` (nằm ngay trong `csv/`, dùng chung mọi bài) cho biết mỗi chữ
kanji gồm những bộ thủ nào. App dùng nó để hiện **tooltip khi rê chuột vào chữ kanji**
ở tab 🔍 Tra từ, 👁 Xem trước, trên thẻ luyện tập (chỉ sau khi lật bài) và ở `report.html`.

| Cột | Ý nghĩa |
|-----|---------|
| `kanji` | một chữ kanji |
| `am_han_viet` | âm Hán Việt (vd `Tư`) |
| `nghia` | nghĩa tiếng Việt |
| `bo_thu` | các bộ phận cấu tạo, cách nhau bằng `\|` |
| `am_on` | âm On (katakana), nhiều âm cách nhau bằng `・` — có thể để trống |
| `am_kun` | âm Kun (hiragana), okurigana để trong ngoặc: `おお(きい)` — có thể để trống |

Quy ước trong cột `bo_thu`:
- Dấu `*` đứng trước = **bộ thủ chính** (bộ Khang Hy của chữ đó) — vd `*禾|厶`.
- Chỉ ghi chữ (vd `禾`) thì app tự tra nghĩa trong 214 bộ thủ (`radicals.csv`).
- Bộ phận **không** nằm trong 214 bộ thủ thì tự ghi nghĩa sau dấu `=` — vd `可=có thể`.
- Dạng viết tắt (亻 刂 攵 礻 艹 氵 阝 耂…) app tự quy về dạng gốc để tra nghĩa.

> File này còn là nguồn của **chế độ luyện "Kanji theo bài"**: mỗi chữ được gắn với **bài
> đầu tiên** nó xuất hiện trong từ vựng, mặt sau thẻ hiện âm On/Kun + nghĩa, dòng phụ hiện
> âm Hán Việt + bộ thủ + các từ trong bài chứa chữ đó. Chữ nào chưa có trong file này thì
> chưa xuất hiện trong chế độ đó.

> Danh sách này **soạn dần theo từng bài**: hiện đã đủ kanji của **Bài 1–5** (148 chữ). Chữ nào chưa có
> trong file thì app hiện bình thường, không có tooltip — thêm dòng vào file rồi chạy
> build là chữ đó có tooltip ngay.

## ⛔ Quy tắc: thêm từ vựng là thêm ĐỦ BỘ

Mỗi khi thêm/sửa từ vựng (bài mới, chủ đề mới, hay chỉ vài từ lẻ), hãy điền **đủ mọi mục**
của từ đó ngay trong lần sửa ấy:

1. Trong `words.csv`: cột `tiengNhat` để **dạng kanji chuẩn** (đừng ghi kana thay cho từ có
   kanji), đủ `romaji`, `nghia`, và `kana` đúng — **katakana cho từ ngoại lai**
   (`アメリカ` chứ không phải `あめりか`); điền `phuluc` nếu là từ tham khảo.
2. Trong `kanji-parts.csv`: thêm **một dòng cho mỗi chữ kanji mới** mà từ đó mang vào
   (bộ thủ + `*` bộ chính + âm Hán Việt + nghĩa + `am_on` + `am_kun`). Thiếu dòng này thì
   chữ đó **không có tooltip bộ thủ** và **không lên thẻ** ở chế độ "Kanji theo bài".
3. Chạy build rồi kiểm lại: không còn chữ kanji nào của bài bị thiếu trong `kanji-parts.csv`.

## Cách thêm / sửa

1. **Sửa bài có sẵn:** mở file CSV trong thư mục bài tương ứng (vd
   `N5/lesson-06/words.csv`), thêm/sửa dòng, **Lưu** (định dạng `.csv`, mã **UTF-8**).
2. **Thêm bài mới (vd Bài 8 của N5):** chép cả thư mục `_TEMPLATE/` → đổi tên thành
   `N5/lesson-08/`, rồi điền vào 3 file bên trong (xoá dòng ví dụ mẫu).
3. **Thêm trình độ mới (vd N4):** tạo thư mục `N4/`, rồi bỏ các thư mục `lesson-01/`,
   `lesson-02/`… (chép từ `_TEMPLATE/`) vào trong.
4. **Chạy build:** ở thư mục gốc dự án, chuột phải `tools/build-lessons.ps1` →
   **Run with PowerShell** (hoặc `./tools/build-lessons.ps1`).
5. **Xong.** Mở lại app — bài/trình độ mới tự hiện ra. Không phải sửa file HTML nào.

## Lưu ý

- **Excel:** nếu tiếng Nhật bị lỗi ô vuông, dùng *Data → From Text/CSV* và chọn mã
  **UTF-8**. Các file mẫu đã có sẵn "BOM" nên Excel thường tự nhận đúng.
- **Google Sheets:** File → Import → Upload; khi tải về chọn *Comma-separated values (.csv)*.
- Nếu ô có dấu phẩy hoặc dấu ngoặc kép, Excel/Sheets tự bọc ngoặc kép — cứ để nguyên.
- Các file trong `data/lessons/<TRÌNH_ĐỘ>/*.js` và `manifest.js` là **tự động sinh ra**
  từ CSV; đừng sửa tay (sẽ bị ghi đè ở lần build sau).
