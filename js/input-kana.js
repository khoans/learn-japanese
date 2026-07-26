/* ===== Gõ romaji -> kana (IME mini cho ô đánh máy) =====
   Chuyển tham lam: ưu tiên khớp 3 ký tự (kya/sha), rồi 2, rồi 1.
   Bỏ qua ký tự đã là kana (pass-through) để chuyển lại được chuỗi trộn.
   Phụ âm đôi -> っ; "n" trước phụ âm/"nn" -> ん (n cuối chỉ thành ん khi final=true). */
const ROMA2KANA = {
    a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
    ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ', kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ',
    sa: 'さ', shi: 'し', si: 'し', su: 'す', se: 'せ', so: 'そ', sha: 'しゃ', shu: 'しゅ', sho: 'しょ', sya: 'しゃ', syu: 'しゅ', syo: 'しょ',
    ta: 'た', chi: 'ち', ti: 'ち', tsu: 'つ', tu: 'つ', te: 'て', to: 'と', cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ', cya: 'ちゃ',
    na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の', nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
    ha: 'は', hi: 'ひ', fu: 'ふ', hu: 'ふ', he: 'へ', ho: 'ほ', hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
    fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ',
    ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も', mya: 'みゃ', myu: 'みゅ', myo: 'みょ',
    ya: 'や', yu: 'ゆ', yo: 'よ',
    ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ', rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
    wa: 'わ', wo: 'を', wi: 'うぃ', we: 'うぇ',
    ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご', gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
    za: 'ざ', ji: 'じ', zi: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ', ja: 'じゃ', ju: 'じゅ', jo: 'じょ', jya: 'じゃ', jyu: 'じゅ', jyo: 'じょ', zya: 'じゃ',
    da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
    ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ', bya: 'びゃ', byu: 'びゅ', byo: 'びょ',
    pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ', pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
    '-': 'ー', xtsu: 'っ', ltsu: 'っ', xtu: 'っ', ltu: 'っ',
    // Kana nhỏ (gõ x… hoặc l…): dùng để ghép âm ngoại lai thủ công, vd te + xi = てぃ
    xa: 'ぁ', xi: 'ぃ', xu: 'ぅ', xe: 'ぇ', xo: 'ぉ',
    la: 'ぁ', li: 'ぃ', lu: 'ぅ', le: 'ぇ', lo: 'ぉ',
    xya: 'ゃ', xyu: 'ゅ', xyo: 'ょ', lya: 'ゃ', lyu: 'ゅ', lyo: 'ょ', xwa: 'ゎ',
    // Âm ngoại lai (katakana) — gõ như IME tiếng Nhật
    thi: 'てぃ', the: 'てぇ', thu: 'てゅ', dhi: 'でぃ', dhu: 'でゅ',
    twu: 'とぅ', dwu: 'どぅ',
    che: 'ちぇ', cye: 'ちぇ', she: 'しぇ', sye: 'しぇ', je: 'じぇ', jye: 'じぇ',
    tsa: 'つぁ', tsi: 'つぃ', tse: 'つぇ', tso: 'つぉ',
    va: 'ゔぁ', vi: 'ゔぃ', vu: 'ゔ', ve: 'ゔぇ', vo: 'ゔぉ',
    ye: 'いぇ', fya: 'ふゃ', fyu: 'ふゅ', fyo: 'ふょ', kwa: 'くぁ', gwa: 'ぐぁ',
    wu: 'う'
};
function romajiToKana(s, kata, final) {
    s = String(s).toLowerCase();
    let out = '', i = 0;
    const isVowel = function (ch) { return 'aiueo'.indexOf(ch) >= 0; };
    while (i < s.length) {
        const c = s[i];
        const len = ROMA2KANA[s.substr(i, 4)] ? 4 : (ROMA2KANA[s.substr(i, 3)] ? 3 : (ROMA2KANA[s.substr(i, 2)] ? 2 : (ROMA2KANA[s.substr(i, 1)] ? 1 : 0)));
        if (len) { out += ROMA2KANA[s.substr(i, len)]; i += len; continue; }  // tra bảng trước (gồm '-' -> ー)
        if (!/[a-z]/.test(c)) { out += c; i++; continue; }     // kana / dấu cách: giữ nguyên
        const n = s[i + 1];
        if (c === 'n') {
            if (n === undefined) { if (final) { out += 'ん'; i++; } else break; continue; }
            if (n === 'n') { out += 'ん'; i += 2; continue; }
            if (!isVowel(n) && n !== 'y') { out += 'ん'; i++; continue; }
            out += c; i++; continue;
        }
        if (c === n && /[bcdfghjkmprstvwz]/.test(c)) { out += 'っ'; i++; continue; } // phụ âm đôi
        break;                                                  // phụ âm lẻ chưa đủ âm tiết: để nguyên phần còn lại
    }
    out += s.slice(i);
    if (kata) out = out.replace(/[ぁ-ゖ]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) + 0x60); });
    return out;
}
/* ===== Bảng tra "cách gõ đặc biệt" (tab ⌨️ Cách gõ) =====
   Mỗi mục: [kết quả, cách gõ, ghi chú]. Áp dụng cho CẢ bộ gõ trong app lẫn Microsoft IME
   (chỗ nào khác nhau thì nói rõ trong ghi chú). */
const IME_NOTES = [
    {t: 'Âm ngoại lai — katakana (hay gõ sai nhất)', rows: [
        ['ティ', 'thi', 'KHÔNG phải ti (ti → ち). スパゲッティ = supagetthi'],
        ['ディ', 'dhi', 'ディズニー = dhizuni-'],
        ['トゥ', 'twu', 'ドゥ = dwu'],
        ['チェ', 'che', 'チェック = chekku'],
        ['シェ', 'she', 'シェフ = shefu'],
        ['ジェ', 'je', 'ジェット = jetto'],
        ['ツァ ツィ ツェ ツォ', 'tsa tsi tse tso', 'ツアー = tsua-'],
        ['ファ フィ フェ フォ', 'fa fi fe fo', 'フィルム = firumu'],
        ['フュ', 'fyu', ''],
        ['ヴァ ヴィ ヴ ヴェ ヴォ', 'va vi vu ve vo', 'ヴァイオリン = vaiorin'],
        ['イェ', 'ye', ''],
        ['ウィ ウェ', 'wi we', 'ウォ: app gõ uxo — MS-IME gõ who'],
        ['クァ グァ', 'kwa gwa', '']
    ]},
    {t: 'Kana nhỏ (ghép tay khi cần)', rows: [
        ['ぁ ぃ ぅ ぇ ぉ', 'xa xi xu xe xo', 'Gõ l… cũng được: la li lu le lo'],
        ['ゃ ゅ ょ', 'xya xyu xyo', ''],
        ['っ', 'xtu (hoặc xtsu)', 'Cách thường dùng hơn: gấp đôi phụ âm — kippu → きっぷ'],
        ['ゎ', 'xwa', ''],
        ['ティ ghép tay', 'te + xi', 'Tương đương thi; ディ = de + xi']
    ]},
    {t: 'っ (âm ngắt) và ん', rows: [
        ['っ', 'gấp đôi phụ âm', 'きっぷ = kippu · がっこう = gakkou · とっきゅう = tokkyuu'],
        ['ッチ', 'tchi hoặc cchi', 'マッチ = matchi · こっち = kocchi'],
        ['ん cuối từ', 'nn', 'にほん = nihonn (app: gõ n cuối cũng ra ん)'],
        ['ん trước nguyên âm/y', "nn (MS-IME: n')", "しんいち = shinnichi / shin'ichi — gõ shinichi sẽ ra しにち"],
        ['ん trước phụ âm khác', 'n', 'かんじ = kanji · こんばん = konban']
    ]},
    {t: 'Trường âm & kana dễ nhầm', rows: [
        ['ー (trường âm katakana)', 'phím -', 'コーヒー = ko-hi- · パーティー = pa-thi-'],
        ['じ / ぢ', 'ji (hoặc zi) / di', 'はなぢ = hanadi'],
        ['ず / づ', 'zu / du', 'つづき = tsuduki'],
        ['を', 'wo', 'Trợ từ を'],
        ['ふ', 'fu hoặc hu', ''],
        ['し ち つ', 'shi/si · chi/ti · tsu/tu', 'Cả hai kiểu đều ra đúng']
    ]},
    {t: 'Microsoft IME — phím chức năng', rows: [
        ['Chuyển sang katakana', 'F7', 'Gõ すぱげってぃ rồi F7 → スパゲッティ'],
        ['Katakana nửa độ rộng', 'F8', ''],
        ['Về hiragana', 'F6', ''],
        ['Chữ Latin (full/half)', 'F9 / F10', ''],
        ['Chuyển kanji', 'Space', 'Space nhiều lần để chọn ứng viên; Enter để xác nhận'],
        ['Bật/tắt gõ tiếng Nhật', '半角/全角 (hoặc Alt + `)', 'Đổi bàn phím: Win + Space'],
        ['Khoá hiragana / katakana', 'Ctrl + Caps / Alt + Caps', '']
    ]},
    {t: 'Microsoft IME — dấu câu & ký hiệu', rows: [
        ['、（dấu phẩy）', 'phím ,', ''],
        ['。（dấu chấm）', 'phím .', ''],
        ['「 」', 'phím [ ]', ''],
        ['・（chấm giữa）', 'phím /', ''],
        ['〜 ／ ￥', 'gõ kara / suraQshu / en rồi Space', 'Hoặc dùng bảng ký hiệu của IME']
    ]},
    {t: 'Riêng bộ gõ trong app', rows: [
        ['Bật/tắt gõ romaji', 'ô "gõ romaji" ở thanh trên', 'Tắt đi thì gõ thẳng bằng IME của Windows'],
        ['Đổi hiragana ⇄ katakana ⇄ tự động', 'phím =', 'Phím này đổi được trong ⚙ Tùy chọn'],
        ['Không có chuyển kanji', '—', 'App chỉ so kana/romaji, không cần bấm Space chuyển kanji']
    ]}
];

/** Vẽ bảng tra cách gõ (tab ⌨️ Cách gõ); lọc theo ô tìm kiếm. */
function renderIme() {
    const box = $('imeList');
    if (!box) return;
    const q = ((($('imeSearch') && $('imeSearch').value) || '')).toLowerCase().trim();
    let html = '', hit = 0;
    IME_NOTES.forEach(function (sec) {
        const rows = sec.rows.filter(function (r) {
            return !q || (r[0] + ' ' + r[1] + ' ' + r[2] + ' ' + sec.t).toLowerCase().indexOf(q) >= 0;
        });
        if (!rows.length) return;
        hit += rows.length;
        html += '<div style="font-weight:600; color:var(--shu-bright); margin:14px 0 6px; font-size:13px;">' + escapeHtml(sec.t) + '</div>';
        rows.forEach(function (r) {
            html += '<div style="display:flex; gap:10px; align-items:baseline; padding:5px 4px; border-bottom:1px solid var(--line); font-size:14px;">'
                + '<span style="font-family:var(--fjp); color:var(--ink); flex:0 0 116px;">' + escapeHtml(r[0]) + '</span>'
                + '<span style="color:var(--gold); font-weight:700; flex:0 0 132px;">' + escapeHtml(r[1]) + '</span>'
                + '<span style="color:var(--ink-dim); flex:1 1 160px; font-size:13px;">' + escapeHtml(r[2]) + '</span>'
                + '</div>';
        });
    });
    if (!hit) html = '<div class="muted" style="padding:8px 2px;">Không tìm thấy mục nào khớp.</div>';
    box.innerHTML = html;
}

function readingIsKatakana() {
    return !!(card && card[4] && /[゠-ヿ]/.test(card[4]));
}
function kanaOutKata() {
    const sel = $('kanaScript');
    const v = sel ? sel.value : 'auto';
    if (v === 'kata') return true;     // luôn Katakana
    if (v === 'hira') return false;    // luôn Hiragana
    return readingIsKatakana();        // tự động theo đáp án
}
function toScript(text, kata) {
    if (kata) return String(text).replace(/[ぁ-ゖ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) + 0x60); });
    return String(text).replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); });
}
const KANA_LABELS = {auto: 'Tự động', hira: 'あ Hiragana', kata: 'ア Katakana'};
function romajiInputOn() {
    return !!($('romajiInput') && $('romajiInput').checked);
}
function syncKanaBar() {
    // Thanh luôn hiện (có checkbox bật/tắt); phần chọn hiragana/katakana chỉ hiện khi đang bật
    const wrap = $('kanaScriptWrap');
    if (wrap) wrap.style.display = romajiInputOn() ? 'inline-flex' : 'none';
}
function cycleKana() {
    const sel = $('kanaScript');
    if (!sel) return;
    const order = ['auto', 'hira', 'kata'];
    sel.value = order[(order.indexOf(sel.value) + 1) % order.length];
    saveLimit();
    // Chuyển luôn phần đã gõ sang script mới (chỉ khi không phải 'auto')
    const ti = $('typeInput');
    if (ti && ti.style.display !== 'none' && sel.value !== 'auto') {
        ti.value = toScript(ti.value, sel.value === 'kata');
    }
    showFixNote('Kana gõ: ' + KANA_LABELS[sel.value]);
}

