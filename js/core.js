// ============================================================
//  App tiếng Nhật N5 — logic (giao diện: index.html)
//  app.js cũ đã TÁCH thành nhiều file trong js/ (classic script, chung scope toàn cục).
//  THỨ TỰ NẠP (trong HTML) — KHÔNG đổi:
//    registry.js → core-data.js → manifest.js → lesson-*.js
//    → js/core.js → input-kana.js → kanji130.js → decks.js → drill.js → stats.js → tools-init.js
//  File sau dựa vào định nghĩa của file trước; mọi lệnh chạy-ngay/init nằm ở tools-init.js (cuối).
// ============================================================

/**
 * Thẻ luyện — mảng 6 phần tử (do poolForKey trả về, drill engine tiêu thụ):
 * @typedef {[string, string, string, string, string, string]} Card
 * - [0] prompt     — đề hiển thị (đồng thời là KHÓA định danh mục)
 * - [1] answer     — đáp án (romaji, hoặc "romaji · nghĩa")
 * - [2] extra      — thông tin phụ (nghĩa / cấu tạo / ghi chú)
 * - [3] romaji     — romaji thuần
 * - [4] compareKey — chuỗi dùng so khớp khi gõ đáp án
 * - [5] kanjiForm  — dạng kanji hiện thêm khi đọc ('' nếu không có)
 */
/** Từ theo bài: [display, romaji, lessonNum, nghĩa, kana, level]
 *  @typedef {[string, string, number, string, string, string]} LWordRow */
/** Câu theo bài: [jp, romaji, lessonNum, nghĩa, level]
 *  @typedef {[string, string, number, string, string]} LSentRow */
/** Điểm ngữ pháp — p=mẫu câu, g=giải thích, ex=ví dụ(Nhật), exr=ví dụ(romaji), m=nghĩa
 *  @typedef {{p:string, g:string, ex:string, exr:string, m:string}} GrammarPoint */
/** Ngữ pháp theo bài (khóa = số bài dạng chuỗi)  @typedef {Object.<string, GrammarPoint[]>} Grammar */
/** Thống kê 1 mục — r=romaji, c=đúng, w=sai, t=hết giờ, ts=tổng ms, tn=số lần tính giờ
 *  @typedef {{r:string, c:number, w:number, t:number, ts:number, tn:number}} StatBucket */
/**
 * @typedef {Object} Session
 * @property {number} c  số đúng
 * @property {number} w  số sai
 * @property {number} to số hết giờ
 * @property {number} streak chuỗi đúng hiện tại
 * @property {number} best   chuỗi dài nhất
 * @property {number} prev   chuỗi liền trước
 * @property {string[]} skip  các mục "đã thuộc"
 * @property {string[]} excluded các mục bị loại
 * @property {number[]} times mảng thời gian trả lời (ms)
 * @property {Object.<string, Object.<string, StatBucket>>} byOption thống kê theo [deckKey][cardKey]
 */
/**
 * @typedef {Object} Keys  Ánh xạ hành động → mã phím (KeyboardEvent.code)
 * @property {string} reveal @property {string} correct @property {string} wrong
 * @property {string} start  @property {string} pause   @property {string} stop
 * @property {string} fix    @property {string} clear   @property {string} penup
 * @property {string} pendown @property {string} skip   @property {string} redo @property {string} kana
 */

/* ===== Dữ liệu theo bài (gộp từ data/lessons/) ===== */
/** @type {LWordRow[]} */
const LWORDS = JPLessons.words();
/** @type {LSentRow[]} */
const LSENT = JPLessons.sentences();
/** @type {Grammar} */
const GRAM = JPLessons.grammar();
/** @type {number[]} */
const ALL_LESSONS = JPLessons.nums();
/** Bài đọc hiểu theo bài: { "1": [ {t, jp, vi, q, bai, level}, ... ] } */
const READ = JPLessons.readings();
/** Hội thoại theo bài: { "1": [ {t, s, jp, vi, bai, level}, ... ] } */
const CONV = JPLessons.conversations();

/* ===== Chỉ mục "từ vựng → bài / trình độ (hoặc chủ đề)" — dùng cho tra cứu, badge trên thẻ, báo cáo ===== */
const THEME_NAME = {};
(function () {
    if (typeof THEME_LIST !== 'undefined') THEME_LIST.forEach(function (t) { THEME_NAME[t[0]] = t[1]; });
})();
// CARD_ORIGIN[khoá] = {bai, level} cho từ/câu theo bài, hoặc {theme} cho từ theo chủ đề.
// Đăng ký khoá theo CẢ dạng kanji (w[0]) LẪN cách đọc kana (w[4]/w[3]) vì poolForKey có thể hiển
// thị dạng kana làm card[0] (chế độ mặc định) hoặc kanji (chế độ "K"). Giữ mục ĐẦU TIÊN nếu trùng.
const CARD_ORIGIN = {};
function _setOrigin(key, o) { if (key && !(key in CARD_ORIGIN)) CARD_ORIGIN[key] = o; }
LWORDS.forEach(function (w) { var o = {bai: w[2], level: w[5]}; _setOrigin(w[0], o); _setOrigin(w[4], o); });
LSENT.forEach(function (s) { _setOrigin(s[0], {bai: s[2], level: s[4]}); });
(typeof THEMEWORDS !== 'undefined' ? THEMEWORDS : []).forEach(function (w) {
    var o = {theme: (THEME_NAME[w[4]] || w[4])}; _setOrigin(w[0], o); _setOrigin(w[3], o);
});

// APPENDIX[khoá] = true cho các từ PHỤ LỤC (tham khảo — không bắt buộc thuộc; cột `phuluc`
// trong words.csv). Cùng quy ước khoá như CARD_ORIGIN: đăng ký cả dạng kanji lẫn kana.
// Một từ có thể là phụ lục ở bài này nhưng là từ CHÍNH ở bài khác (vd 図書館, 体, 医者) —
// khoá ở đây là bản thân từ nên chỉ đánh dấu khi từ đó KHÔNG phải từ chính ở bất kỳ bài nào.
const APPENDIX = {};
(function () {
    var core = {};
    LWORDS.forEach(function (w) { if (!w[6]) { core[w[0]] = true; core[w[4]] = true; } });
    LWORDS.forEach(function (w) {
        if (!w[6]) return;
        if (w[0] && !core[w[0]]) APPENDIX[w[0]] = true;
        if (w[4] && !core[w[4]]) APPENDIX[w[4]] = true;
    });
})();

/** true nếu từ (theo chữ hiển thị card[0]) là từ phụ lục / tham khảo. */
function isAppendix(key) { return !!APPENDIX[key]; }

/* ===== Kanji theo bài =====
   Mỗi chữ kanji được gắn với bài ĐẦU TIÊN nó xuất hiện trong từ vựng (nên học 日 ở Bài 1
   thì Bài 5 không bắt học lại). Chỉ nhận những chữ đã có dữ liệu trong data/kanji-parts.js
   (KANJI_PARTS soạn dần theo bài) — chữ chưa soạn thì bỏ qua, không hiện trong chế độ này.
   KANJI_LESSON: [ { k, bai, level, words: [ [tu, kana, nghia], ... ] }, ... ] theo thứ tự bài. */
const KANJI_LESSON = [];
(function () {
    if (typeof KANJI_PARTS === 'undefined') return;
    var byChar = {};
    LWORDS.forEach(function (w) {
        var chars = String(w[0]).match(/[一-鿿々]/g);
        if (!chars) return;
        var seen = {};
        chars.forEach(function (c) {
            if (seen[c] || !KANJI_PARTS[c]) return;   // mỗi từ chỉ tính 1 lần cho mỗi chữ
            seen[c] = true;
            if (!byChar[c]) {
                byChar[c] = {k: c, bai: w[2], level: w[5], words: []};
                KANJI_LESSON.push(byChar[c]);
            }
            // Từ ví dụ: chỉ lấy từ của đúng bài đã gắn, tối đa 4 từ cho gọn thẻ.
            if (byChar[c].bai === w[2] && byChar[c].words.length < 4) {
                byChar[c].words.push([w[0], w[4] || '', w[3] || '']);
            }
        });
    });
    KANJI_LESSON.sort(function (a, b) { return a.bai - b.bai; });
})();

/** Nhãn nguồn gốc của một mục (theo chữ hiển thị card[0]); '' nếu không thuộc bài/chủ đề nào. */
function originLabel(key) {
    var o = CARD_ORIGIN[key];
    var apx = isAppendix(key) ? ' · 📎 phụ lục' : '';
    if (!o) return apx ? '📎 phụ lục' : '';
    if (o.theme) return 'Chủ đề: ' + o.theme + apx;
    return 'Bài ' + o.bai + ' · ' + o.level + apx;
}

function kanaSegToRomaji(s) {
    var Y = {
        'きゃ': 'kya',
        'きゅ': 'kyu',
        'きょ': 'kyo',
        'しゃ': 'sha',
        'しゅ': 'shu',
        'しょ': 'sho',
        'ちゃ': 'cha',
        'ちゅ': 'chu',
        'ちょ': 'cho',
        'にゃ': 'nya',
        'にゅ': 'nyu',
        'にょ': 'nyo',
        'ひゃ': 'hya',
        'ひゅ': 'hyu',
        'ひょ': 'hyo',
        'みゃ': 'mya',
        'みゅ': 'myu',
        'みょ': 'myo',
        'りゃ': 'rya',
        'りゅ': 'ryu',
        'りょ': 'ryo',
        'ぎゃ': 'gya',
        'ぎゅ': 'gyu',
        'ぎょ': 'gyo',
        'じゃ': 'ja',
        'じゅ': 'ju',
        'じょ': 'jo',
        'びゃ': 'bya',
        'びゅ': 'byu',
        'びょ': 'byo',
        'ぴゃ': 'pya',
        'ぴゅ': 'pyu',
        'ぴょ': 'pyo'
    };
    var M = {
        'あ': 'a',
        'い': 'i',
        'う': 'u',
        'え': 'e',
        'お': 'o',
        'か': 'ka',
        'き': 'ki',
        'く': 'ku',
        'け': 'ke',
        'こ': 'ko',
        'さ': 'sa',
        'し': 'shi',
        'す': 'su',
        'せ': 'se',
        'そ': 'so',
        'た': 'ta',
        'ち': 'chi',
        'つ': 'tsu',
        'て': 'te',
        'と': 'to',
        'な': 'na',
        'に': 'ni',
        'ぬ': 'nu',
        'ね': 'ne',
        'の': 'no',
        'は': 'ha',
        'ひ': 'hi',
        'ふ': 'fu',
        'へ': 'he',
        'ほ': 'ho',
        'ま': 'ma',
        'み': 'mi',
        'む': 'mu',
        'め': 'me',
        'も': 'mo',
        'や': 'ya',
        'ゆ': 'yu',
        'よ': 'yo',
        'ら': 'ra',
        'り': 'ri',
        'る': 'ru',
        'れ': 're',
        'ろ': 'ro',
        'わ': 'wa',
        'を': 'wo',
        'ん': 'n',
        'が': 'ga',
        'ぎ': 'gi',
        'ぐ': 'gu',
        'げ': 'ge',
        'ご': 'go',
        'ざ': 'za',
        'じ': 'ji',
        'ず': 'zu',
        'ぜ': 'ze',
        'ぞ': 'zo',
        'だ': 'da',
        'ぢ': 'ji',
        'づ': 'zu',
        'で': 'de',
        'ど': 'do',
        'ば': 'ba',
        'び': 'bi',
        'ぶ': 'bu',
        'べ': 'be',
        'ぼ': 'bo',
        'ぱ': 'pa',
        'ぴ': 'pi',
        'ぷ': 'pu',
        'ぺ': 'pe',
        'ぽ': 'po'
    };
    var S = {'ゃ': 1, 'ゅ': 1, 'ょ': 1};
    var out = '', i = 0;
    while (i < s.length) {
        var c = s[i], n = s[i + 1];
        if (c === 'っ') {
            var r2 = (n && S[s[i + 2]]) ? Y[n + s[i + 2]] : (M[n] || '');
            if (r2) {
                out += (r2[0] === 'c' ? 't' : r2[0]);
            }
            i++;
            continue;
        }
        if (n && S[n] && Y[c + n]) {
            out += Y[c + n];
            i += 2;
            continue;
        }
        if (M[c] !== undefined) {
            out += M[c];
            i++;
            continue;
        }
        out += c;
        i++;
    }
    return out;
}

/** Katakana -> hiragana (dùng khi chỉ có âm On mà cần chuỗi để gõ). */
function kataToHira(s) {
    return String(s == null ? '' : s).replace(/[ァ-ヶ]/g, function (c) {
        return String.fromCharCode(c.charCodeAt(0) - 0x60);
    });
}

function kanaRomaji(str) {
    if (!str) return '';
    return String(str).split('/').map(function (seg) {
        return kanaSegToRomaji(seg.trim());
    }).join(' / ');
}

