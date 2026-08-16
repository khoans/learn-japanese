// ===== GUNGUN - N5 - Bai 1 - Phan A =====
// TU DONG SINH tu  data/lessons/csv/GUNGUN/N5/lesson-01A/*.csv  boi  tools/build-lessons.ps1
// DUNG SUA TRUC TIEP FILE NAY -- moi thay doi se bi ghi de. Hay sua CSV roi chay lai script.
// words: [ chu_hien_thi, romaji, nghia_tiengviet, kana, (1 = tu phu luc) ]
// sentences: [ cau_nhat, romaji, nghia_tiengviet ]
// grammar: { p: mau_cau, g: giai_thich, ex: vi_du, exr: vi_du_romaji, m: nghia }
// readings: { t: tieu_de, jp: cau|cau|..., vi: nghia|nghia|..., q: [[cau_hoi, dap_an], ...] }
// conversations: { t: tieu_de, s: boi_canh, jp: luot|luot|..., vi: nghia|nghia|... }
// Tham so cuoi (neu co) = PHAN cua chuong, vd "A".
registerLesson("GUNGUN", "N5", 1, {
  words: [
    ["ベトナム", "betonamu", "Việt Nam", "ベトナム"],
    ["日本", "nihon", "Nhật Bản", "にほん"],
    ["中国", "chuugoku", "Trung Quốc", "ちゅうごく"],
    ["韓国", "kankoku", "Hàn Quốc", "かんこく"],
    ["タイ", "tai", "Thái Lan", "タイ"],
    ["～人", "~jin", "người ～ (tên quốc gia + じん)", "～じん"],
    ["ベトナム人", "betonamujin", "người Việt Nam", "ベトナムじん"],
    ["日本人", "nihonjin", "người Nhật", "にほんじん"],
    ["中国人", "chuugokujin", "người Trung Quốc", "ちゅうごくじん"],
    ["韓国人", "kankokujin", "người Hàn Quốc", "かんこくじん"],
    ["タイ人", "taijin", "người Thái", "タイじん"],
    ["私", "watashi", "tôi", "わたし"],
    ["医者", "isha", "bác sĩ", "いしゃ"],
    ["教師", "kyoushi", "giáo viên, giảng viên", "きょうし"],
    ["先生", "sensei", "thầy/ cô giáo", "せんせい"],
    ["銀行員", "ginkouin", "nhân viên ngân hàng", "ぎんこういん"],
    ["会社員", "kaishain", "nhân viên công ty", "かいしゃいん"],
    ["学生", "gakusei", "học sinh, sinh viên", "がくせい"],
    ["（お）名前", "(o)namae", "tên, họ tên", "おなまえ"],
    ["料理", "ryouri", "món ăn, việc nấu ăn", "りょうり"],
    ["ベトナム料理", "betonamuryouri", "món ăn Việt Nam", "ベトナムりょうり"],
    ["日本料理", "nihonryouri", "món ăn Nhật Bản", "にほんりょうり"],
    ["ビール", "biiru", "bia", "ビール"],
    ["コーヒー", "koohii", "cà phê", "コーヒー"],
    ["ジュース", "juusu", "nước hoa quả", "ジュース"],
    ["これ", "kore", "cái này", "これ"],
    ["それ", "sore", "cái đó", "それ"],
    ["あれ", "are", "cái kia", "あれ"],
    ["こちら", "kochira", "đây (phía này)", "こちら"],
    ["そちら", "sochira", "đó (phía đó)", "そちら"],
    ["あちら", "achira", "kia (phía kia)", "あちら"],
    ["はい", "hai", "vâng/ có", "はい"],
    ["いいえ", "iie", "không (phủ định đơn thuần)", "いいえ"],
    ["いえいえ", "ieie", "không sao/ không có gì (lời đáp khiêm tốn khi được xin lỗi, cảm ơn hoặc khen ngợi)", "いえいえ"],
    ["おはようございます", "ohayou gozaimasu", "chào buổi sáng", "おはようございます"],
    ["こんにちは", "konnichiwa", "chào buổi trưa/ chiều", "こんにちは"],
    ["こんばんは", "konbanwa", "chào buổi tối", "こんばんは"],
    ["すみません", "sumimasen", "① xin lỗi ② cảm ơn (khi áy náy vì làm phiền người khác)", "すみません"],
    ["はじめまして", "hajimemashite", "rất vui được gặp anh/ chị (lời chào khi lần đầu gặp mặt)", "はじめまして"],
    ["よろしくお願いします", "yoroshiku onegaishimasu", "rất mong được anh/ chị giúp đỡ", "よろしくおねがいします"],
    ["そうです", "sou desu", "đúng vậy", "そうです"],
    ["そうですか", "sou desu ka", "vậy à, thế à?", "そうですか"],
    ["失礼しました", "shitsurei shimashita", "xin lỗi (khi trót nói hoặc làm điều gì thất lễ)", "しつれいしました"],
    ["大丈夫です", "daijoubu desu", "không sao đâu", "だいじょうぶです"],
    ["ええと", "eeto", "ờ, ờm... (khi đang nghĩ xem nói gì tiếp)", "ええと"],
    ["あっ", "a", "A! (khi ngạc nhiên hoặc xúc động về điều gì đó)", "あっ"]
  ],
  sentences: [
    ["わたしは ベトナムじんです。", "Watashi wa betonamujin desu.", "Tôi là người Việt Nam."],
    ["わたしは がくせいです。", "Watashi wa gakusei desu.", "Tôi là sinh viên."],
    ["わたしは かいしゃいんです。", "Watashi wa kaishain desu.", "Tôi là nhân viên công ty."],
    ["リンさんは ベトナムじんですか。", "Rin-san wa betonamujin desu ka.", "Chị Linh là người Việt Nam phải không?"],
    ["…はい、そうです。", "…Hai, sou desu.", "…Vâng, đúng vậy."],
    ["たなかさんは にほんじんですか。", "Tanaka-san wa nihonjin desu ka.", "Anh Tanaka là người Nhật phải không?"],
    ["…はい、にほんじんです。", "…Hai, nihonjin desu.", "…Vâng, anh ấy là người Nhật."],
    ["キムさんは ちゅうごくじんですか。", "Kimu-san wa chuugokujin desu ka.", "Anh Kim là người Trung Quốc phải không?"],
    ["…いいえ、かんこくじんです。", "…Iie, kankokujin desu.", "…Không, anh ấy là người Hàn Quốc."],
    ["やまださんは せんせいです。", "Yamada-san wa sensei desu.", "Cô Yamada là giáo viên."],
    ["わたしは いしゃです。", "Watashi wa isha desu.", "Tôi là bác sĩ."],
    ["そちらは ぎんこういんですか。", "Sochira wa ginkouin desu ka.", "Vị đó là nhân viên ngân hàng phải không?"],
    ["…はい、ぎんこういんです。", "…Hai, ginkouin desu.", "…Vâng, là nhân viên ngân hàng."],
    ["こちらは スーさんです。きょうしです。", "Kochira wa Suu-san desu. Kyoushi desu.", "Đây là chị Su. Chị ấy là giáo viên."],
    ["これは にほんりょうりです。", "Kore wa nihonryouri desu.", "Cái này là món ăn Nhật Bản."],
    ["それは ベトナムりょうりですか。", "Sore wa betonamuryouri desu ka.", "Cái đó là món ăn Việt Nam phải không?"],
    ["…はい、ベトナムりょうりです。", "…Hai, betonamuryouri desu.", "…Vâng, đó là món ăn Việt Nam."],
    ["あれは ビールですか。", "Are wa biiru desu ka.", "Cái kia là bia phải không?"],
    ["…いいえ、ジュースです。", "…Iie, juusu desu.", "…Không, đó là nước hoa quả."],
    ["これは コーヒーです。", "Kore wa koohii desu.", "Cái này là cà phê."],
    ["おはようございます。", "Ohayou gozaimasu.", "Chào buổi sáng."],
    ["こんにちは。はじめまして。", "Konnichiwa. Hajimemashite.", "Xin chào. Rất vui được gặp anh/ chị."],
    ["はじめまして。タンです。よろしく おねがいします。", "Hajimemashite. Tan desu. Yoroshiku onegaishimasu.", "Rất vui được gặp anh/ chị. Tôi là Tân. Rất mong được anh/ chị giúp đỡ."],
    ["おなまえは。", "Onamae wa.", "Anh/ chị tên là gì?"],
    ["…リンです。ベトナムじんです。", "…Rin desu. Betonamujin desu.", "…Tôi là Linh. Tôi là người Việt Nam."],
    ["すみません。せんせいですか。", "Sumimasen. Sensei desu ka.", "Xin lỗi, anh/ chị là giáo viên phải không?"],
    ["…いいえ、がくせいです。", "…Iie, gakusei desu.", "…Không, tôi là sinh viên."],
    ["あっ、しつれいしました。", "A, shitsurei shimashita.", "A, tôi xin lỗi."],
    ["…いえいえ、だいじょうぶです。", "…Ieie, daijoubu desu.", "…Không sao, không sao đâu."],
    ["ええと、わたしは タイじんです。", "Eeto, watashi wa taijin desu.", "Ờm... tôi là người Thái."],
    ["こんばんは。そうですか。", "Konbanwa. Sou desu ka.", "Chào buổi tối. Vậy à?"],
    ["リンさんは ベトナムじんです。わたしも ベトナムじんです。", "Rin-san wa betonamujin desu. Watashi mo betonamujin desu.", "Chị Linh là người Việt Nam. Tôi cũng là người Việt Nam."],
    ["たなかさんは かいしゃいんです。やまださんも かいしゃいんです。", "Tanaka-san wa kaishain desu. Yamada-san mo kaishain desu.", "Anh Tanaka là nhân viên công ty. Anh Yamada cũng là nhân viên công ty."],
    ["キムさんも がくせいですか。", "Kimu-san mo gakusei desu ka.", "Anh Kim cũng là sinh viên phải không?"],
    ["…はい、キムさんも がくせいです。", "…Hai, Kimu-san mo gakusei desu.", "…Vâng, anh Kim cũng là sinh viên."],
    ["これは にほんりょうりです。それも にほんりょうりです。", "Kore wa nihonryouri desu. Sore mo nihonryouri desu.", "Cái này là món ăn Nhật Bản. Cái đó cũng là món ăn Nhật Bản."],
    ["あれも ジュースですか。", "Are mo juusu desu ka.", "Cái kia cũng là nước hoa quả phải không?"],
    ["…いいえ、ビールです。", "…Iie, biiru desu.", "…Không, đó là bia."],
    ["スーさんは きょうしです。わたしも きょうしです。", "Suu-san wa kyoushi desu. Watashi mo kyoushi desu.", "Chị Su là giáo viên. Tôi cũng là giáo viên."]
  ],
  grammar: [
    {"p": "① N1 は N2 です。", "g": "は là trợ từ nêu chủ đề, viết là は nhưng ĐỌC là わ. N1 は N2 です = \"N1 là N2\" — dùng để giới thiệu bản thân, quốc tịch, nghề nghiệp, hoặc nói một vật là gì. Thể nghi vấn của mẫu này xem ③. Khi chỉ đồ vật thì N1 dùng これ (vật ở gần người nói), それ (gần người nghe), あれ (xa cả hai người); dạng lịch sự tương ứng là こちら／そちら／あちら. Ví dụ: リンさんは がくせいです。／これは にほんりょうりです。／それは ビールですか。…はい、そうです。", "ex": "わたしは ベトナムじんです。", "exr": "Watashi wa betonamujin desu.", "m": "Tôi là người Việt Nam."},
    {"p": "② N1 も N2 です。", "g": "も có nghĩa là \"cũng\", dùng khi điều nói về N1 GIỐNG với điều vừa nói về người/vật trước đó. も ĐỨNG THAY chỗ của は — không nói ～はも. Thể hỏi cũng thêm か ở cuối (N1 も N2 ですか). Ví dụ: たなかさんは かいしゃいんです。やまださんも かいしゃいんです。／これは にほんりょうりです。それも にほんりょうりです。", "ex": "リンさんは がくせいです。わたしも がくせいです。", "exr": "Rin-san wa gakusei desu. Watashi mo gakusei desu.", "m": "Chị Linh là sinh viên. Tôi cũng là sinh viên."},
    {"p": "③ N1 は N2 ですか。…はい、そうです。／いいえ、～です。", "g": "Thể NGHI VẤN của ①: giữ nguyên trật tự câu, chỉ thêm か vào cuối và lên giọng ở cuối câu (tiếng Nhật không dùng dấu ?). CÁCH TRẢ LỜI — đúng: はい、そうです。 hoặc はい、～です。 (nhắc lại N2); sai: いいえ、～です。 (nói luôn thông tin đúng, vì thể phủ định じゃ ありません chưa học ở phần này). Hỏi tên thì dùng （お）なまえは。 → ～です。 Ví dụ: これは ビールですか。…いいえ、ジュースです。／たなかさんも かいしゃいんですか。…はい、そうです。／おなまえは。…リンです。", "ex": "キムさんは かんこくじんですか。…はい、そうです。", "exr": "Kimu-san wa kankokujin desu ka. …Hai, sou desu.", "m": "Anh Kim là người Hàn Quốc phải không? …Vâng, đúng vậy."}
  ],
  readings: [

  ],
  conversations: [

  ]
}, "A");