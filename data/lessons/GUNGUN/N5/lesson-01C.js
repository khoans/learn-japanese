// ===== GUNGUN - N5 - Bai 1 - Phan C =====
// TU DONG SINH tu  data/lessons/csv/GUNGUN/N5/lesson-01C/*.csv  boi  tools/build-lessons.ps1
// DUNG SUA TRUC TIEP FILE NAY -- moi thay doi se bi ghi de. Hay sua CSV roi chay lai script.
// words: [ chu_hien_thi, romaji, nghia_tiengviet, kana, (1 = tu phu luc) ]
// sentences: [ cau_nhat, romaji, nghia_tiengviet ]
// grammar: { p: mau_cau, g: giai_thich, ex: vi_du, exr: vi_du_romaji, m: nghia }
// readings: { t: tieu_de, jp: cau|cau|..., vi: nghia|nghia|..., q: [[cau_hoi, dap_an], ...] }
// conversations: { t: tieu_de, s: boi_canh, jp: luot|luot|..., vi: nghia|nghia|... }
// Tham so cuoi (neu co) = PHAN cua chuong, vd "A".
registerLesson("GUNGUN", "N5", 1, {
  words: [
    ["辞書", "jisho", "từ điển", "じしょ"],
    ["かばん", "kaban", "cặp, túi", "かばん"],
    ["手帳", "techou", "sổ tay", "てちょう"],
    ["電子辞書", "denshijisho", "kim từ điển", "でんしじしょ"],
    ["市役所", "shiyakusho", "toà thị chính", "しやくしょ"],
    ["交番", "kouban", "đồn cảnh sát", "こうばん"],
    ["大使館", "taishikan", "đại sứ quán", "たいしかん"],
    ["電話番号", "denwabangou", "số điện thoại", "でんわばんごう"],
    ["月曜日", "getsuyoubi", "thứ Hai", "げつようび"],
    ["火曜日", "kayoubi", "thứ Ba", "かようび"],
    ["水曜日", "suiyoubi", "thứ Tư", "すいようび"],
    ["木曜日", "mokuyoubi", "thứ Năm", "もくようび"],
    ["金曜日", "kin'youbi", "thứ Sáu", "きんようび"],
    ["土曜日", "doyoubi", "thứ Bảy", "どようび"],
    ["日曜日", "nichiyoubi", "Chủ nhật", "にちようび"],
    ["何曜日", "nan'youbi", "thứ mấy", "なんようび"],
    ["何", "nan", "cái gì", "なん"],
    ["いくら", "ikura", "bao nhiêu tiền", "いくら"],
    ["～円", "~en", "yên (đơn vị tiền tệ của Nhật)", "～えん"],
    ["～ドン", "~don", "đồng (đơn vị tiền tệ của Việt Nam)", "～ドン"],
    ["本当だ", "hontou da", "Đúng thật! / Thật này! (khi nhận ra lời đối phương đúng với sự thật)", "ほんとうだ"],
    ["じゃ", "ja", "vậy thì, thế thì…", "じゃ"],
    ["えっ", "e", "Ô! (tiếng ngạc nhiên)", "えっ"],
    ["ああ", "aa", "à… (thán từ thể hiện sự ngại ngùng, bối rối, xấu hổ…)", "ああ"]
  ],
  sentences: [
    ["これは いくらですか。", "Kore wa ikura desu ka.", "Cái này bao nhiêu tiền?"],
    ["…ごひゃくえんです。", "…Gohyaku en desu.", "…500 yên."],
    ["それは いくらですか。", "Sore wa ikura desu ka.", "Cái đó bao nhiêu tiền?"],
    ["…せんえんです。", "…Sen en desu.", "…1000 yên."],
    ["でんしじしょは いくらですか。", "Denshijisho wa ikura desu ka.", "Kim từ điển bao nhiêu tiền?"],
    ["…にまんえんです。", "…Niman en desu.", "…20.000 yên."],
    ["かばんは いくらですか。", "Kaban wa ikura desu ka.", "Chiếc cặp bao nhiêu tiền?"],
    ["…ごじゅうまんドンです。", "…Gojuuman don desu.", "…50.000 đồng."],
    ["これは なんですか。", "Kore wa nan desu ka.", "Cái này là cái gì?"],
    ["…じしょです。", "…Jisho desu.", "…Là quyển từ điển."],
    ["それは なんですか。", "Sore wa nan desu ka.", "Cái đó là cái gì?"],
    ["…てちょうです。", "…Techou desu.", "…Là quyển sổ tay."],
    ["あれは なんですか。", "Are wa nan desu ka.", "Cái kia là cái gì?"],
    ["…でんしじしょです。", "…Denshijisho desu.", "…Là kim từ điển."],
    ["きょうは なんようびですか。", "Kyou wa nan'youbi desu ka.", "Hôm nay là thứ mấy?"],
    ["…もくようびです。", "…Mokuyoubi desu.", "…Thứ Năm."],
    ["あしたは なんようびですか。", "Ashita wa nan'youbi desu ka.", "Ngày mai là thứ mấy?"],
    ["…きんようびです。", "…Kin'youbi desu.", "…Thứ Sáu."],
    ["きょうは かようびですね。", "Kyou wa kayoubi desu ne.", "Hôm nay là thứ Ba nhỉ."],
    ["…はい、そうですね。", "…Hai, sou desu ne.", "…Vâng, đúng vậy nhỉ."],
    ["これは たいしかんですね。", "Kore wa taishikan desu ne.", "Đây là đại sứ quán nhỉ."],
    ["…はい、たいしかんです。", "…Hai, taishikan desu.", "…Vâng, đây là đại sứ quán."],
    ["じしょは せんえんですね。", "Jisho wa sen en desu ne.", "Quyển từ điển 1000 yên nhỉ."],
    ["あれは こうばんですね。", "Are wa kouban desu ne.", "Cái kia là đồn cảnh sát nhỉ."],
    ["しやくしょは ごじまでですよ。", "Shiyakusho wa goji made desu yo.", "Toà thị chính chỉ mở đến 5 giờ đấy."],
    ["あしたは やすみですよ。", "Ashita wa yasumi desu yo.", "Ngày mai được nghỉ đấy."],
    ["きょうは どようびですよね。", "Kyou wa doyoubi desu yo ne.", "Hôm nay là thứ Bảy đúng không nhỉ?"],
    ["…はい、どようびです。", "…Hai, doyoubi desu.", "…Vâng, thứ Bảy."],
    ["にちようび ぎんこうは やすみですよね。", "Nichiyoubi ginkou wa yasumi desu yo ne.", "Chủ nhật ngân hàng nghỉ đúng không nhỉ?"],
    ["…はい、やすみです。", "…Hai, yasumi desu.", "…Vâng, nghỉ."],
    ["リンさんは タイじんですよね。", "Rin-san wa taijin desu yo ne.", "Chị Linh là người Thái đúng không nhỉ?"],
    ["…いいえ、ベトナムじんですよ。", "…Iie, betonamujin desu yo.", "…Không, chị ấy là người Việt Nam đấy."],
    ["これは かんじじゃないですよ。ひらがなですよ。", "Kore wa kanji ja nai desu yo. Hiragana desu yo.", "Cái này không phải chữ Hán đâu. Là chữ hiragana đấy."],
    ["えっ、ほんとうだ。", "E, hontou da.", "Ơ, đúng thật."],
    ["じゃ、あしたは やすみですね。", "Ja, ashita wa yasumi desu ne.", "Vậy thì ngày mai nghỉ nhỉ."],
    ["ああ、そうですか。", "Aa, sou desu ka.", "À, vậy à."]
  ],
  grammar: [
    {"p": "① N は いくらですか。…～えんです。／～ドンです。", "g": "いくら = BAO NHIÊU TIỀN, dùng để hỏi giá. Câu hỏi: N は いくらですか。 Trả lời: số tiền + えん (yên Nhật) hoặc ドン (đồng Việt Nam) + です. Hỏi đồ vật ngay trước mặt thì dùng これ／それ／あれ + は いくらですか。 Ví dụ: これは いくらですか。…ごひゃくえんです。／でんしじしょは にまんえんです。／あれは ごまんドンです。", "ex": "これは いくらですか。…ごひゃくえんです。", "exr": "Kore wa ikura desu ka. …Gohyaku en desu.", "m": "Cái này bao nhiêu tiền? …500 yên."},
    {"p": "② N は 何ですか。…N です。", "g": "何 = CÁI GÌ, dùng hỏi vật đó là gì. LƯU Ý cách đọc: đứng trước です／ですか thì 何 đọc là なん (không phải なに). Trả lời bằng chính tên đồ vật + です. Cùng nhóm này còn có なんじ (mấy giờ), なんぷん (mấy phút), なんようび (thứ mấy). Ví dụ: これは なんですか。…じしょです。／きょうは なんようびですか。…げつようびです。", "ex": "それは なんですか。…てちょうです。", "exr": "Sore wa nan desu ka. …Techou desu.", "m": "Cái đó là cái gì? …Là quyển sổ tay."},
    {"p": "③ ～ね。", "g": "ね đặt CUỐI CÂU để xác nhận lại thông tin vừa nghe từ đối phương, hoặc để rủ đối phương cùng đồng tình — tương đương \"… nhỉ / … nhé\" trong tiếng Việt, giọng đi xuống nhẹ. Người nói mong đối phương gật đầu, nên câu đáp thường là はい、そうですね。 Ví dụ: きょうは かようびですね。…はい、そうですね。／じしょは せんえんですね。", "ex": "これは たいしかんですね。…はい、そうですね。", "exr": "Kore wa taishikan desu ne. …Hai, sou desu ne.", "m": "Đây là đại sứ quán nhỉ? …Vâng, đúng vậy nhỉ."},
    {"p": "④ ～よ。／～よね。", "g": "Cùng đứng cuối câu nhưng khác vai trò. よ = \"đấy / cơ\": dùng khi CUNG CẤP cho đối phương một thông tin mà họ CHƯA BIẾT (báo cho biết, nhấn mạnh). よね = \"đúng không nhỉ\": người nói khá chắc nhưng vẫn muốn XÁC NHẬN lại hoặc tìm sự đồng tình — mạnh hơn ね một chút. So sánh: あしたは やすみですよ。(báo tin đối phương chưa biết) ／ あしたは やすみですよね。(mình nghĩ vậy, xác nhận lại). Ví dụ: しやくしょは ごじまでですよ。／きょうは どようびですよね。…はい、どようびです。", "ex": "しやくしょは ごじまでですよ。", "exr": "Shiyakusho wa goji made desu yo.", "m": "Toà thị chính chỉ mở đến 5 giờ đấy."}
  ],
  readings: [

  ],
  conversations: [

  ]
}, "C");