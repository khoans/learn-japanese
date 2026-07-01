// ===== Minna no Nihongo - Bai 7 =====
// TU DONG SINH tu  data/lessons/csv/lesson-07-*.csv  boi  tools/build-lessons.ps1
// DUNG SUA TRUC TIEP FILE NAY -- moi thay doi se bi ghi de. Hay sua CSV roi chay lai script.
// words: [ chu_hien_thi, romaji, nghia_tiengviet, hiragana ]
// sentences: [ cau_nhat, romaji, nghia_tiengviet ]
// grammar: { p: tieu_de, g: giai_thich, ex: vi_du_nhat, exr: romaji, m: nghia }
registerLesson(7, {
  words: [
    ["切ります", "kirimasu", "cắt", "きります"],
    ["送ります", "okurimasu", "gửi", "おくります"],
    ["あげます", "agemasu", "cho, tặng", "あげます"],
    ["もらいます", "moraimasu", "nhận", "もらいます"],
    ["貸します", "kashimasu", "cho mượn, cho vay", "かします"],
    ["借ります", "karimasu", "mượn, vay", "かります"],
    ["教えます", "oshiemasu", "dạy", "おしえます"],
    ["習います", "naraimasu", "học, tập", "ならいます"],
    ["電話をかけます", "denwa o kakemasu", "gọi điện thoại", "でんわをかけます"],
    ["手", "te", "tay", "て"],
    ["箸", "hashi", "đũa", "はし"],
    ["スプーン", "supuun", "thìa", "すぷーん"],
    ["ナイフ", "naifu", "dao", "ないふ"],
    ["フォーク", "fooku", "nĩa, dĩa", "ふぉーく"],
    ["はさみ", "hasami", "kéo", "はさみ"],
    ["ファクス", "fakusu", "fax", "ふぁくす"],
    ["ワープロ", "waapuro", "máy đánh chữ", "わーぷろ"],
    ["パソコン", "pasokon", "máy vi tính cá nhân", "ぱそこん"],
    ["パンチ", "panchi", "cái đục lỗ", "ぱんち"],
    ["ホッチキス", "hocchikisu", "cái dập ghim", "ほっちきす"],
    ["セロテープ", "seroteepu", "băng dính", "せろてーぷ"],
    ["けしゴム", "keshigomu", "cái tẩy", "けしごむ"],
    ["紙", "kami", "giấy", "かみ"],
    ["花", "hana", "hoa", "はな"],
    ["シャツ", "shatsu", "áo sơ mi", "しゃつ"],
    ["プレゼント", "purezento", "quà tặng", "ぷれぜんと"],
    ["荷物", "nimotsu", "đồ đạc, hành lý", "にもつ"],
    ["お金", "okane", "tiền", "おかね"],
    ["切符", "kippu", "vé", "きっぷ"],
    ["クリスマス", "kurisumasu", "Giáng sinh", "くりすます"],
    ["父", "chichi", "bố (bố mình)", "ちち"],
    ["母", "haha", "mẹ (mẹ mình)", "はは"],
    ["お父さん", "otousan", "bố (bố người khác)", "おとうさん"],
    ["お母さん", "okaasan", "mẹ (mẹ người khác)", "おかあさん"],
    ["旅行", "ryokou", "du lịch", "りょこう"],
    ["お土産", "omiyage", "quà (mua khi đi xa)", "おみやげ"],
    ["ヨーロッパ", "yooroppa", "Châu Âu", "よーろっぱ"],
    ["スペイン", "supein", "Tây Ban Nha", "すぺいん"]
  ],
  sentences: [
    ["はしで ごはんを たべます。", "Hashi de gohan o tabemasu.", "Tôi ăn cơm bằng đũa."],
    ["はさみで かみを きります。", "Hasami de kami o kirimasu.", "Tôi cắt giấy bằng kéo."],
    ["パソコンで レポートを かきます。", "Pasokon de repooto o kakimasu.", "Tôi viết báo cáo bằng máy vi tính."],
    ["にほんごで てがみを かきます。", "Nihongo de tegami o kakimasu.", "Tôi viết thư bằng tiếng Nhật."],
    ["「ありがとう」は えいごで なんですか。", "“Arigatou” wa eigo de nan desu ka.", "“Arigatou” tiếng Anh nói thế nào?"],
    ["…「サンキュー」です。", "…“Sankyuu” desu.", "…Là “Thank you”."],
    ["ともだちに はなを あげます。", "Tomodachi ni hana o agemasu.", "Tôi tặng hoa cho bạn."],
    ["わたしは ミラーさんに ほんを かしました。", "Watashi wa Miraa-san ni hon o kashimashita.", "Tôi đã cho anh Miller mượn sách."],
    ["せんせいに にほんごを ならいます。", "Sensei ni nihongo o naraimasu.", "Tôi học tiếng Nhật từ thầy giáo."],
    ["だれに その プレゼントを もらいましたか。", "Dare ni sono purezento o moraimashita ka.", "Bạn nhận món quà đó từ ai?"],
    ["…やまださんに もらいました。", "…Yamada-san ni moraimashita.", "…Tôi nhận từ anh Yamada."],
    ["ともだちに ほんを かりました。", "Tomodachi ni hon o karimashita.", "Tôi đã mượn sách của bạn."],
    ["ちちに とけいを もらいました。", "Chichi ni tokei o moraimashita.", "Tôi được bố tặng đồng hồ."],
    ["ははに おかねを おくります。", "Haha ni okane o okurimasu.", "Tôi gửi tiền cho mẹ."],
    ["クリスマスに おかあさんに シャツを あげました。", "Kurisumasu ni okaasan ni shatsu o agemashita.", "Vào Giáng sinh, tôi tặng mẹ áo sơ mi."],
    ["もう ひるごはんを たべましたか。", "Mou hirugohan o tabemashita ka.", "Bạn ăn trưa chưa?"],
    ["…はい、もう たべました。", "…Hai, mou tabemashita.", "…Vâng, tôi ăn rồi."],
    ["…いいえ、まだです。", "…Iie, mada desu.", "…Chưa, tôi chưa ăn."],
    ["やまだ先生に でんわを かけます。", "Yamada-sensei ni denwa o kakemasu.", "Tôi gọi điện cho thầy Yamada."],
    ["りょこうの おみやげを もらいました。", "Ryokou no omiyage o moraimashita.", "Tôi được tặng quà chuyến du lịch."]
  ],
  grammar: [
    {"p": "① trợ từ で (công cụ / phương tiện)", "g": "[công cụ/cách thức]＋で = 'bằng ~': はしで たべます, はさみで きります. Cũng dùng với ngôn ngữ: にほんごで かきます (viết bằng tiếng Nhật).", "ex": "はしで ごはんを たべます。", "exr": "Hashi de gohan o tabemasu.", "m": "Tôi ăn cơm bằng đũa."},
    {"p": "②「～」は～語で 何ですか", "g": "Hỏi cách nói một từ trong ngôn ngữ khác: 「ありがとう」は えいごで なんですか — '\"Arigatou\" tiếng Anh là gì?'. ～語 = tiếng nước ~ (えいご, にほんご).", "ex": "「ありがとう」は えいごで なんですか。", "exr": "“Arigatou” wa eigo de nan desu ka.", "m": "“Arigatou” tiếng Anh nói thế nào?"},
    {"p": "③ [người]に [vật]を あげます", "g": "Cho/tặng AI cái gì: dùng に chỉ NGƯỜI NHẬN. Nhóm động từ cho đi: あげます, かします (cho mượn), おしえます (dạy), おくります (gửi), でんわを かけます.", "ex": "ともだちに はなを あげます。", "exr": "Tomodachi ni hana o agemasu.", "m": "Tôi tặng hoa cho bạn."},
    {"p": "④ [người]に [vật]を もらいます", "g": "Nhận cái gì TỪ AI: dùng に (hoặc から) chỉ NGƯỜI CHO. Nhóm động từ nhận về: もらいます, かります (mượn), ならいます (học từ ai). Hỏi: だれに.", "ex": "やまださんに ほんを もらいました。", "exr": "Yamada-san ni hon o moraimashita.", "m": "Tôi nhận sách từ anh Yamada."},
    {"p": "⑤ もう ～ました", "g": "もう＋[động từ]ました = 'đã … rồi'. Trả lời: はい、もう ～ました (rồi) hoặc いいえ、まだです (chưa). KHÔNG nói いいえ、まだ ～ませんでした.", "ex": "もう ひるごはんを たべましたか。", "exr": "Mou hirugohan o tabemashita ka.", "m": "Bạn ăn trưa chưa?"}
  ]
});