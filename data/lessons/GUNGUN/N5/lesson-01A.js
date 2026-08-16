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
    ["こんばんは。そうですか。", "Konbanwa. Sou desu ka.", "Chào buổi tối. Vậy à?"]
  ],
  grammar: [

  ],
  readings: [

  ],
  conversations: [

  ]
}, "A");