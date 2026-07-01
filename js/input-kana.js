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
    '-': 'ー', xtsu: 'っ', ltsu: 'っ'
};
function romajiToKana(s, kata, final) {
    s = String(s).toLowerCase();
    let out = '', i = 0;
    const isVowel = function (ch) { return 'aiueo'.indexOf(ch) >= 0; };
    while (i < s.length) {
        const c = s[i];
        const len = ROMA2KANA[s.substr(i, 3)] ? 3 : (ROMA2KANA[s.substr(i, 2)] ? 2 : (ROMA2KANA[s.substr(i, 1)] ? 1 : 0));
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

