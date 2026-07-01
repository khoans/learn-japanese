// ============================================================
//  app.js — Toan bo logic cua app (giao dien: kana_speed_trainer_v2.html)
//  PHAI nap SAU registry.js + core-data.js + cac file lesson-*.js
// ============================================================
/* ===== Du lieu theo bai duoc gop tu cac file trong data/lessons/ ===== */
const LWORDS = JPLessons.words();
const LSENT = JPLessons.sentences();
const GRAM = JPLessons.grammar();
const ALL_LESSONS = JPLessons.nums();

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

function kanaRomaji(str) {
    if (!str) return '';
    return String(str).split('/').map(function (seg) {
        return kanaSegToRomaji(seg.trim());
    }).join(' / ');
}

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

/* ===== Kanji130: chỉnh sửa nghĩa/ghi chú, lưu localStorage, lịch sử + hoàn lại ===== */
const LS_K130 = 'jp_kanji130_edits_v1';
let kanji130Edits = {ov: {}, hist: []};

function loadK130E() {
    try {
        const s = lsGet(LS_K130);
        if (s) {
            const o = JSON.parse(s);
            kanji130Edits = {ov: (o && o.ov) || {}, hist: (o && o.hist) || []};
        }
    } catch (e) {
        kanji130Edits = {ov: {}, hist: []};
    }
}

function saveK130E() {
    try {
        lsSet(LS_K130, JSON.stringify(kanji130Edits));
    } catch (e) {
    }
}

function k130Base(k) {
    for (let i = 0; i < KANJI130.length; i++) {
        if (KANJI130[i][0] === k) return KANJI130[i][2];
    }
    return '';
}

function k130EffMeaning(k) {
    const o = kanji130Edits.ov[k];
    return (o && o.m !== undefined && o.m !== '') ? o.m : k130Base(k);
}

function k130EffNote(k) {
    const o = kanji130Edits.ov[k];
    return (o && o.n) ? o.n : '';
}

function k130Compose(k) {
    const m = k130EffMeaning(k);
    const n = k130EffNote(k);
    return m + (n ? '   📝 ' + n : '');
}

function k130IsEdited(k) {
    const o = kanji130Edits.ov[k];
    if (!o) return false;
    const b = k130Base(k);
    return (o.m !== undefined && o.m !== '' && o.m !== b) || (!!o.n && o.n !== '');
}

function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, '&quot;');
}

function k130Apply(k, newM, newN, isRevert) {
    newM = (newM == null ? '' : String(newM)).trim();
    newN = (newN == null ? '' : String(newN)).trim();
    const base = k130Base(k);
    if (newM === '') newM = base;
    const bm = k130EffMeaning(k), bn = k130EffNote(k);
    if (bm === newM && bn === newN) return false;
    if (newM === base && newN === '') {
        delete kanji130Edits.ov[k];
    } else {
        kanji130Edits.ov[k] = {m: newM, n: newN};
    }
    kanji130Edits.hist.push({
        id: 'h' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
        ts: Date.now(),
        k: k,
        bm: bm,
        bn: bn,
        am: newM,
        an: newN,
        rev: !!isRevert
    });
    saveK130E();
    if (card && $('mode').value === 'kanji130' && card[0] === k) {
        card[2] = k130Compose(k);
        if (isRevealed) {
            $('wordMeaning').textContent = (cardDir === 'meaning') ? (card[1] || '') : (card[2] || '');
        }
    }
    if ($('k130Grp') && $('k130Grp').open) {
        renderK130Hist();
    }
    return true;
}

function k130Revert(id) {
    const e = kanji130Edits.hist.filter(function (x) {
        return x.id === id;
    })[0];
    if (!e) return;
    k130Apply(e.k, e.bm, e.bn, true);
    renderK130List();
}

function k130ResetAll() {
    if (!confirm('Khôi phục TẤT CẢ nghĩa về mặc định và xóa toàn bộ lịch sử chỉnh sửa? Không thể hoàn tác.')) return;
    kanji130Edits = {ov: {}, hist: []};
    saveK130E();
    if (card && $('mode').value === 'kanji130') {
        card[2] = k130Compose(card[0]);
        if (isRevealed) $('wordMeaning').textContent = (cardDir === 'meaning') ? (card[1] || '') : (card[2] || '');
    }
    renderK130List();
    renderK130Hist();
    if (phase === 'running') nextCard();
    updateCoverage();
}

function k130Uniq() {
    const seen = {};
    const out = [];
    KANJI130.forEach(function (x) {
        if (!seen[x[0]]) {
            seen[x[0]] = 1;
            out.push(x);
        }
    });
    return out;
}

function renderK130List() {
    const box = $('k130EditList');
    if (!box) return;
    const q = (($('k130Search') && $('k130Search').value) || '').toLowerCase();
    const list = k130Uniq().filter(function (x) {
        if (!q) return true;
        const m = k130EffMeaning(x[0]);
        const n = k130EffNote(x[0]);
        return (x[0] + ' ' + x[1] + ' ' + kanaRomaji(x[1]) + ' ' + m + ' ' + n).toLowerCase().indexOf(q) >= 0;
    });
    box.innerHTML = '';
    if (!list.length) {
        box.innerHTML = '<div style="color:#9aa0a6; font-size:12px; padding:8px;">Không có kết quả.</div>';
        return;
    }
    list.forEach(function (x) {
        const k = x[0];
        const ed = k130IsEdited(k);
        const row = document.createElement('div');
        row.style.cssText = 'padding:8px 4px; border-bottom:1px solid #2c2f31;';
        row.innerHTML = '<div style="display:flex; align-items:baseline; gap:8px; margin-bottom:5px;">'
            + '<span style="font-family:Hiragino Sans,Noto Sans JP,sans-serif; color:#fff; font-size:21px;">' + escapeHtml(k) + '</span>'
            + '<span style="color:#9ecbff; font-size:12px;">' + escapeHtml(x[1]) + '</span>'
            + (ed ? '<span class="k130badge" style="margin-left:auto; font-size:10px; color:#ffe6ab; border:1px solid #8a6d2e; border-radius:5px; padding:1px 5px;">đã sửa</span>' : '<span class="k130badge" style="margin-left:auto;"></span>')
            + '</div>'
            + '<input type="text" class="k130mEdit" data-k="' + escapeAttr(k) + '" value="' + escapeAttr(k130EffMeaning(k)) + '" placeholder="nghĩa" style="width:100%; background:#101213; color:#fff; border:1px solid #3a3f43; border-radius:6px; padding:6px; font-size:13px; margin-bottom:5px;">'
            + '<input type="text" class="k130nEdit" data-k="' + escapeAttr(k) + '" value="' + escapeAttr(k130EffNote(k)) + '" placeholder="ghi chú (tùy chọn)" style="width:100%; background:#101213; color:#cfd6e0; border:1px dashed #3a3f43; border-radius:6px; padding:6px; font-size:12.5px;">';
        box.appendChild(row);
    });
}

function renderK130Hist() {
    const box = $('k130HistList');
    if (!box) return;
    const h = kanji130Edits.hist.slice().reverse();
    box.innerHTML = '';
    if (!h.length) {
        box.innerHTML = '<div style="color:#9aa0a6; font-size:12px; padding:6px;">Chưa có chỉnh sửa nào.</div>';
        return;
    }
    h.forEach(function (e) {
        var ts = '';
        try {
            ts = new Date(e.ts).toLocaleString();
        } catch (err) {
            ts = '';
        }
        var body = '';
        if (e.bm !== e.am) body += '<div>Nghĩa: <span style="color:#ff9aa0; text-decoration:line-through;">' + escapeHtml(e.bm || '(trống)') + '</span> → <span style="color:#6ee7a0;">' + escapeHtml(e.am || '(trống)') + '</span></div>';
        if (e.bn !== e.an) body += '<div>Ghi chú: <span style="color:#ff9aa0; text-decoration:line-through;">' + escapeHtml(e.bn || '(trống)') + '</span> → <span style="color:#6ee7a0;">' + escapeHtml(e.an || '(trống)') + '</span></div>';
        if (!body) body = '<div style="color:#9aa0a6;">(không đổi)</div>';
        const row = document.createElement('div');
        row.style.cssText = 'padding:7px 4px; border-bottom:1px solid #2c2f31;';
        row.innerHTML = '<div style="display:flex; align-items:baseline; gap:8px;">'
            + '<span style="font-family:Hiragino Sans,Noto Sans JP,sans-serif; color:#fff; font-size:18px;">' + escapeHtml(e.k) + '</span>'
            + (e.rev ? '<span style="font-size:10px; color:#9ecbff;">hoàn lại</span>' : '')
            + '<span style="margin-left:auto; color:#777; font-size:11px;">' + escapeHtml(ts) + '</span>'
            + '<button class="btn small" data-hrev="' + escapeAttr(e.id) + '" style="padding:3px 8px;">↩ Hoàn lại</button></div>'
            + '<div style="font-size:12px; color:#c8c8c8; margin-top:3px;">' + body + '</div>';
        box.appendChild(row);
    });
}

function k130ShowEditBar() {
    const on = ($('mode').value === 'kanji130' && isRevealed && phase === 'running');
    var bar = $('k130EditBar');
    if (bar) bar.style.display = on ? 'block' : 'none';
    if (!on) {
        var bx = $('k130EditBox');
        if (bx) bx.style.display = 'none';
    }
}

function k130OpenInline() {
    if (!card || $('mode').value !== 'kanji130') return;
    $('k130mIn').value = k130EffMeaning(card[0]);
    $('k130nIn').value = k130EffNote(card[0]);
    $('k130EditBar').style.display = 'none';
    $('k130EditBox').style.display = 'block';
    $('k130SaveMsg').textContent = '';
    setTimeout(function () {
        try {
            $('k130mIn').focus();
        } catch (e) {
        }
    }, 0);
}

function k130SaveInline() {
    const k = card && card[0];
    if (!k) return;
    const ch = k130Apply(k, $('k130mIn').value, $('k130nIn').value, false);
    $('k130SaveMsg').textContent = ch ? 'Đã lưu ✓' : 'Không có thay đổi';
    if ($('k130Grp') && $('k130Grp').open) renderK130List();
    setTimeout(function () {
        $('k130EditBox').style.display = 'none';
        $('k130EditBar').style.display = 'block';
    }, 550);
}

const $ = function (id) {
    return document.getElementById(id);
};

/* ===== Tao nut chon bai + danh sach ngu phap dong tu du lieu da nap ===== */
function buildLessonUI() {
    var box = $('baiBtns');
    if (box) {
        box.innerHTML = '';
        var levels = (JPLessons.levels && JPLessons.levels()) || [];
        if (!levels.length) levels = ['N5'];
        levels.forEach(function (lv) {
            var nums = (JPLessons.numsOf && JPLessons.numsOf(lv)) || ALL_LESSONS;
            var lab = document.createElement('div');
            lab.className = 'lvl-label';
            lab.textContent = 'Trình độ ' + lv;
            lab.style.cssText = 'flex-basis:100%; width:100%; margin:2px 0 4px; font-size:11px; font-weight:700; letter-spacing:1px; opacity:.6;';
            box.appendChild(lab);
            nums.forEach(function (num) {
                var btn = document.createElement('button');
                btn.className = 'btn small bai active';
                btn.setAttribute('data-bai', num);
                btn.setAttribute('data-level', lv);
                btn.textContent = 'Bài ' + num;
                box.appendChild(btn);
            });
        });
    }
    var gramSelect = $('gramSel');
    if (gramSelect) {
        gramSelect.innerHTML = '';
        Object.keys(GRAM).map(Number).sort(function (a, btn) {
            return a - btn;
        }).forEach(function (num) {
            var opt = document.createElement('option');
            opt.value = num;
            opt.textContent = 'Bài ' + num;
            gramSelect.appendChild(opt);
        });
    }
}

buildLessonUI();
let canvas = null, ctx = null, isDrawing = false, canvasSize = 'm', penWidth = 11, penColor = '#ffffff';
const CANVAS_SIZES = {s: {fixed: 300, h: 300}, m: {frac: 0.55, h: 340}, l: {frac: 0.8, h: 430}, xl: {frac: 1.0, h: 340}};

function containerW() {
    const j = $('jp');
    const w = (j ? j.clientWidth : 560) - 36;
    return Math.max(240, w);
}

function setCanvasSize(sz) {
    if (!CANVAS_SIZES[sz]) sz = 'm';
    canvasSize = sz;
    const c = CANVAS_SIZES[sz];
    if (!canvas) return;
    const cw = containerW();
    let w = c.fixed ? Math.min(c.fixed, cw) : Math.round(cw * c.frac);
    w = Math.max(240, Math.min(w, cw));
    canvas.width = w;
    canvas.height = c.h;
    canvas.style.width = w + 'px';
    canvas.style.height = c.h + 'px';
    document.querySelectorAll('[data-size]').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-size') === sz);
    });
    try {
        lsSet('jp_reader_csize', sz);
    } catch (e) {
    }
    clearCanvas();
}

function initCanvas() {
    canvas = $('draw');
    ctx = canvas.getContext('2d');
    let sz = 'm';
    try {
        const s = lsGet('jp_reader_csize');
        if (s && CSIZES[s]) sz = s;
    } catch (e) {
    }
    setCanvasSize(sz);
    try {
        const pj = lsGet('jp_reader_pen');
        if (pj) {
            const po = JSON.parse(pj);
            if (po.w) penWidth = po.w;
            if (po.color) penColor = po.color;
        }
    } catch (e) {
    }
    $('penW').value = penWidth;
    $('penWVal').textContent = penWidth + 'px';
    $('penColor').value = penColor;

    function pos(e) {
        const r = canvas.getBoundingClientRect();
        const cx = (e.touches ? e.touches[0].clientX : e.clientX);
        const cy = (e.touches ? e.touches[0].clientY : e.clientY);
        return {x: (cx - r.left) * (canvas.width / r.width), y: (cy - r.top) * (canvas.height / r.height)};
    }

    function down(e) {
        e.preventDefault();
        isDrawing = true;
        const p = pos(e);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
    }

    function move(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const p = pos(e);
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    }

    function up() {
        isDrawing = false;
    }

    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    canvas.addEventListener('pointerleave', up);
}

function clearCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#2b2f31';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function setAppWidth(p) {
    p = parseInt(p, 10);
    if (!p || p < 40) p = 70;
    if (p > 100) p = 100;
    $('jp').style.maxWidth = p + 'vw';
    $('appWVal').textContent = p + '%';
    $('appW').value = p;
    try {
        lsSet('jp_reader_appw', String(p));
    } catch (e) {
    }
    if (typeof canvas !== 'undefined' && canvas) setCanvasSize(canvasSize);
}

function changePen(delta) {
    penWidth = Math.max(2, Math.min(30, (penWidth || 11) + delta));
    var s = $('penW');
    if (s) s.value = penWidth;
    var v = $('penWVal');
    if (v) v.textContent = penWidth + 'px';
    try {
        lsSet('jp_reader_pen', JSON.stringify({w: penWidth, color: penColor}));
    } catch (e) {
    }
}

function showAnsKanji() {
    const ak = $('ansKanji');
    if (!ak) return;
    const kj = (card && card[5]) ? card[5] : '';
    const prm = $('kana').textContent;
    if (cardDir === 'read' && kj && kj !== prm) {
        ak.textContent = kj;
        ak.style.display = 'block';
    } else {
        ak.style.display = 'none';
    }
}

function styleAnswer() {
    const rj = $('romaji');
    if (cardDir === 'write' || cardDir === 'meaning') {
        rj.style.fontSize = '52px';
        rj.style.fontFamily = "'Hiragino Sans','Noto Sans JP',sans-serif";
        rj.style.color = '#fff';
    } else {
        rj.style.fontSize = '24px';
        rj.style.fontFamily = '';
        rj.style.color = '#9ecbff';
    }
}

const LS_HIST = 'jp_reader_history_v2', LS_KEYS = 'jp_reader_keys_v2', LS_CUR = 'jp_reader_cur_v2',
    LS_LIMIT = 'jp_reader_limit_v2';

function lsGet(k) {
    try {
        return localStorage.getItem(k);
    } catch (e) {
        return null;
    }
}

function lsSet(k, v) {
    try {
        localStorage.setItem(k, v);
    } catch (e) {
    }
}

function lsDel(k) {
    try {
        localStorage.removeItem(k);
    } catch (e) {
    }
}

let keys = {
    reveal: 'ArrowDown',
    correct: 'Digit2',
    wrong: 'Digit1',
    start: 'Enter',
    pause: 'ArrowUp',
    stop: 'KeyX',
    fix: 'Backslash',
    clear: 'KeyC',
    penup: 'BracketRight',
    pendown: 'BracketLeft',
    skip: 'KeyM',
    redo: 'KeyR',
    kana: 'Equal'
};
(function () {
    const s = lsGet(LS_KEYS);
    if (s) {
        try {
            const o = JSON.parse(s);
            keys = Object.assign({
                reveal: 'ArrowDown',
                correct: 'Digit2',
                wrong: 'Digit1',
                start: 'Enter',
                pause: 'ArrowUp',
                stop: 'KeyX',
                fix: 'Backslash',
                clear: 'KeyC',
                penup: 'BracketRight',
                pendown: 'BracketLeft',
                skip: 'KeyM',
                redo: 'KeyR',
                kana: 'Equal'
            }, o);
        } catch (e) {
        }
    }
})();

function keyLabel(c) {
    if (c === 'Space') return 'Space';
    if (c === 'BracketRight') return ']';
    if (c === 'BracketLeft') return '[';
    if (c === 'Minus') return '-';
    if (c === 'Equal') return '=';
    if (c === 'Backslash') return '\\';
    if (c === 'Enter') return 'Enter';
    if (c.indexOf('Key') === 0) return c.slice(3);
    if (c.indexOf('Digit') === 0) return c.slice(5);
    if (c.indexOf('Arrow') === 0) return c.slice(5);
    return c;
}

function renderKeyLabels() {
    $('lblReveal').textContent = keyLabel(keys.reveal);
    $('lblCorrect').textContent = keyLabel(keys.correct);
    $('lblWrong').textContent = keyLabel(keys.wrong);
    $('lblStart').textContent = keyLabel(keys.start);
    $('lblPause').textContent = keyLabel(keys.pause);
    $('lblStop').textContent = keyLabel(keys.stop);
    $('lblFix').textContent = keyLabel(keys.fix);
    $('lblClear').textContent = keyLabel(keys.clear);
    $('lblPenUp').textContent = keyLabel(keys.penup);
    $('lblPenDown').textContent = keyLabel(keys.pendown);
    var _ls = $('lblSkip');
    if (_ls) _ls.textContent = keyLabel(keys.skip);
    var _lr = $('lblRedo');
    if (_lr) _lr.textContent = keyLabel(keys.redo);
    var _lk = $('lblKana');
    if (_lk) _lk.textContent = keyLabel(keys.kana);
    var _lkm = $('lblKanaMain');
    if (_lkm) _lkm.textContent = keyLabel(keys.kana);
}

// session = tiến độ phiên hiện tại. ĐƯỢC LƯU localStorage (LS_CUR) — KHÔNG đổi tên các field:
//   c = số đúng, w = số sai, to = số hết giờ
//   streak = chuỗi đúng hiện tại, best = chuỗi dài nhất, prev = chuỗi liền trước
//   times = mảng thời gian trả lời (ms), skip = các mục "đã thuộc", excluded = các mục bị loại
//   byOption[deckKey][cardKey] = thống kê từng mục: {r:romaji, c:đúng, w:sai, t:hết giờ, ts:tổng ms, tn:số lần tính giờ}
let session = {c: 0, w: 0, to: 0, streak: 0, best: 0, prev: 0, skip: [], excluded: [], times: [], byOption: {}};
(function () {
    const s = lsGet(LS_CUR);
    if (s) {
        try {
            session = JSON.parse(s);
            if (session.to === undefined) session.to = 0;
            if (session.streak === undefined) session.streak = 0;
            if (session.best === undefined) session.best = 0;
            if (session.prev === undefined) session.prev = 0;
            if (!session.skip) session.skip = [];
            if (!session.excluded) session.excluded = [];
        } catch (e) {
        }
    }
})();

function saveSession() {
    lsSet(LS_CUR, JSON.stringify(session));
}

function loadHist() {
    const str = lsGet(LS_HIST);
    if (!str) return [];
    try {
        return JSON.parse(str);
    } catch (e) {
        return [];
    }
}

function saveHist(history) {
    lsSet(LS_HIST, JSON.stringify(history));
}

let phase = 'idle'; // idle | running | paused
let card = null, isRevealed = false, isTimedOut = false, cardStartMs = 0, pausedMs = 0, answerMs = 0, capturingSlot = null,
    statSort = 'count', limitTimerId = null, lastGraded = null, isTypingCard = false, typingDone = false, cardDir = 'read',
    dontScore = false;

function deckKey() {
    const m = $('mode').value;
    let base;
    if (m === 'counter') base = 'counter|' + selectedCGroups().join(','); else if (m === 'number') base = 'number|' + selectedNGroups().join(','); else if (m === 'kanji') base = 'kanji|' + selectedKRows().join(','); else if (m === 'kanji130') base = 'kanji130|' + selectedKGroups().join(','); else if (m === 'radical') base = 'radical'; else if (m === 'sent') base = 'sent|' + selectedLessons().join(','); else if (m === 'lword') base = 'lword|' + selectedLessons().join(',') + ($('lwordForm').value === 'kanji' ? '|K' : ''); else if (m === 'word') base = 'word|' + $('script').value; else base = 'char|' + $('script').value + '|' + $('range').value;
    return ($('dir').value === 'write' ? 'W:' : ($('dir').value === 'meaning' ? 'M:' : '')) + base;
}

function deckLabel(key) {
    let prefix = '';
    if (key.indexOf('W:') === 0) {
        prefix = 'Viết · ';
        key = key.slice(2);
    } else if (key.indexOf('M:') === 0) {
        prefix = 'Nghĩa→kana · ';
        key = key.slice(2);
    }
    const parts = key.split('|');
    const scriptNames = {mix: 'Trộn cả hai', hira: 'Hiragana', kata: 'Katakana'};
    if (parts[0] === 'counter') return prefix + 'Đơn vị đếm · loại ' + (parts[1] || 'all');
    if (parts[0] === 'number') return prefix + 'Số đếm · cấp ' + (parts[1] || 'all');
    if (parts[0] === 'kanji') return prefix + 'Kanji N5 · hàng ' + (parts[1] || 'all');
    if (parts[0] === 'kanji130') return prefix + '130 kanji N5 · nhóm ' + (parts[1] || 'all');
    if (parts[0] === 'radical') return prefix + 'Bộ thủ thông dụng';
    if (parts[0] === 'sent') return prefix + 'Câu · Bài ' + (parts[1] || '1-5');
    if (parts[0] === 'lword') return prefix + 'Từ · Bài ' + (parts[1] || '1-6') + (parts[2] === 'K' ? ' (kanji)' : '');
    if (parts[0] === 'word') return prefix + 'Đọc từ N5 · ' + scriptNames[parts[1]];
    const rangeNames = {basic: 'Cơ bản', full: 'Cơ bản+biến âm', yoon: 'Cơ bản+biến âm+ghép', tricky: 'Hay nhầm'};
    return prefix + 'Ký tự · ' + scriptNames[parts[1]] + ' · ' + rangeNames[parts[2]];
}

function parseLessons(seg) {
    if (!seg) return ALL_LESSONS.slice();
    const lessons = seg.split(',').map(function (num) {
        return parseInt(num, 10);
    }).filter(function (num) {
        return ALL_LESSONS.indexOf(num) >= 0;
    });
    return lessons.length ? lessons : ALL_LESSONS.slice();
}

function selectedLessons() {
    const a = [];
    document.querySelectorAll('[data-bai]').forEach(function (b) {
        if (b.classList.contains('active')) a.push(parseInt(b.getAttribute('data-bai'), 10));
    });
    return a.length ? a : ALL_LESSONS.slice();
}

function selectedKRows() {
    const a = [];
    document.querySelectorAll('[data-krow]').forEach(function (b) {
        if (b.classList.contains('active')) a.push(parseInt(b.getAttribute('data-krow'), 10));
    });
    return a.length ? a : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
}

function selectedKGroups() {
    const a = [];
    document.querySelectorAll('[data-kgrp]').forEach(function (b) {
        if (b.classList.contains('active')) a.push(parseInt(b.getAttribute('data-kgrp'), 10));
    });
    return a.length ? a : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
}

function selectedNGroups() {
    const a = [];
    document.querySelectorAll('[data-ngrp]').forEach(function (b) {
        if (b.classList.contains('active')) a.push(parseInt(b.getAttribute('data-ngrp'), 10));
    });
    return a.length ? a : [1, 2, 3, 4, 5, 6, 7];
}

function selectedCGroups() {
    const a = [];
    document.querySelectorAll('[data-cgrp]').forEach(function (b) {
        if (b.classList.contains('active')) a.push(parseInt(b.getAttribute('data-cgrp'), 10));
    });
    return a.length ? a : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
}

// poolForKey() trả về mảng các "thẻ" để luyện. Mỗi thẻ (biến `card` / `item`) là mảng 6 phần tử:
//   [0] prompt      — đề bài hiển thị (đồng thời là KHÓA định danh của mục)
//   [1] answer      — đáp án (romaji, hoặc "romaji · nghĩa")
//   [2] extra       — thông tin phụ (nghĩa / cấu tạo / ghi chú)
//   [3] romaji      — romaji thuần (đề bài khi luyện Viết; để hiện đáp án)
//   [4] compareKey  — chuỗi dùng so khớp khi gõ đáp án (đánh máy)
//   [5] kanjiForm   — dạng kanji để hiện thêm khi đọc (rỗng nếu không có)
function poolForKey(key) {
    const isW = key.indexOf('W:') === 0;
    if (isW || key.indexOf('M:') === 0) key = key.slice(2);
    const parts = key.split('|');
    if (parts[0] === 'sent') {
        const lessons = parseLessons(parts[1]);
        return LSENT.filter(function (row) {
            return lessons.indexOf(row[2]) >= 0;
        }).map(function (row) {
            return [row[0], row[1], row[3] || '', row[1], row[0], ''];
        });
    }
    if (parts[0] === 'lword') {
        const lessons = parseLessons(parts[1]);
        const kanjiMode = (parts[2] === 'K');
        return LWORDS.filter(function (row) {
            return lessons.indexOf(row[2]) >= 0;
        }).map(function (row) {
            var reading = row[4] || row[0];
            var kanji = row[0];
            var hasK = /[\u4e00-\u9fff]/.test(kanji);
            var kanjiForm = hasK ? kanji : '';
            var compareKey = hasK ? reading : kanji;
            if (kanjiMode) {
                var display = kanji;
                var answer = (display !== reading) ? (reading + '  ·  ' + row[1]) : row[1];
                return [display, answer, row[3] || '', row[1], compareKey, kanjiForm];
            }
            var hDisplay = hasK ? reading : kanji;
            var hAnswer = (hDisplay !== reading) ? (reading + '  ·  ' + row[1]) : row[1];
            return [hDisplay, hAnswer, row[3] || '', row[1], compareKey, kanjiForm];
        });
    }
    if (parts[0] === 'radical') {
        return RADICALS.map(function (row) {
            return [row[0], row[1], row[2], '', row[0], ''];
        });
    }
    if (parts[0] === 'kanji') {
        const rowsSel = (parts[1] ? parts[1].split(',').map(function (numStr) {
            return parseInt(numStr, 10);
        }) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        return KANJIV.filter(function (row) {
            return rowsSel.indexOf(row[4]) >= 0;
        }).map(function (row) {
            return [row[0], row[1] + '  ·  ' + row[2], row[3], row[2], row[1], row[0]];
        });
    }
    if (parts[0] === 'kanji130') {
        const groupsSel = (parts[1] ? parts[1].split(',').map(function (numStr) {
            return parseInt(numStr, 10);
        }) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        return KANJI130.filter(function (row) {
            return groupsSel.indexOf(row[3]) >= 0;
        }).map(function (row) {
            var rom = kanaRomaji(row[1]);
            return [row[0], row[1] + '  ·  ' + rom, k130Compose(row[0]), rom, row[1], row[0]];
        });
    }
    if (parts[0] === 'number') {
        const numGroups = (parts[1] ? parts[1].split(',').map(function (numStr) {
            return parseInt(numStr, 10);
        }) : [1, 2, 3, 4, 5, 6, 7]);
        return NUMSET.filter(function (row) {
            return numGroups.indexOf(row[4]) >= 0;
        }).map(function (row) {
            return [row[0], row[1] + '  ·  ' + row[2], '= ' + row[3], row[2], row[1], row[0]];
        });
    }
    if (parts[0] === 'counter') {
        const counterGroups = (parts[1] ? parts[1].split(',').map(function (numStr) {
            return parseInt(numStr, 10);
        }) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
        return COUNTSET.filter(function (row) {
            return counterGroups.indexOf(row[4]) >= 0;
        }).map(function (row) {
            return [row[0], row[1] + '  ·  ' + row[2], row[3], row[2], row[1], row[0]];
        });
    }
    if (parts[0] === 'word') {
        const scriptSel = parts[1];
        return WORDS.filter(function (wordRow) {
            if (scriptSel === 'hira') return wordRow[2] === 'H';
            if (scriptSel === 'kata') return wordRow[2] === 'K';
            return true;
        }).map(function (wordRow) {
            return [wordRow[0], wordRow[1], wordRow[3] || '', wordRow[1], wordRow[0], ''];
        });
    }
    const scriptSel = parts[1], rangeSel = parts[2];
    if (rangeSel === 'tricky') {
        const m = {};
        [].concat(H_BASIC, H_DAKU, K_BASIC, K_DAKU).forEach(function (numStr) {
            m[numStr[0]] = numStr[1];
        });
        return TRICKY.filter(function (k) {
            const h = k.charCodeAt(0) < 0x30A0;
            if (scriptSel === 'hira') return h;
            if (scriptSel === 'kata') return !h;
            return true;
        }).map(function (k) {
            return [k, m[k], '', m[k], k, ''];
        });
    }
    if (scriptSel === 'mix' && isW) {
        let hiraList = [].concat(H_BASIC), kataList = [].concat(K_BASIC);
        if (rangeSel === 'full' || rangeSel === 'yoon') {
            hiraList = hiraList.concat(H_DAKU);
            kataList = kataList.concat(K_DAKU);
        }
        if (rangeSel === 'yoon') {
            hiraList = hiraList.concat(H_YOON);
            kataList = kataList.concat(K_YOON);
        }
        const mixRows = [];
        for (let i = 0; i < hiraList.length; i++) {
            mixRows.push([hiraList[i][0] + ' / ' + kataList[i][0], hiraList[i][1], '', hiraList[i][1], hiraList[i][0] + kataList[i][0], '']);
        }
        return mixRows;
    }
    let kanaRows = [];
    if (scriptSel === 'hira' || scriptSel === 'mix') {
        kanaRows = kanaRows.concat(H_BASIC);
        if (rangeSel === 'full' || rangeSel === 'yoon') kanaRows = kanaRows.concat(H_DAKU);
        if (rangeSel === 'yoon') kanaRows = kanaRows.concat(H_YOON);
    }
    if (scriptSel === 'kata' || scriptSel === 'mix') {
        kanaRows = kanaRows.concat(K_BASIC);
        if (rangeSel === 'full' || rangeSel === 'yoon') kanaRows = kanaRows.concat(K_DAKU);
        if (rangeSel === 'yoon') kanaRows = kanaRows.concat(K_YOON);
    }
    return kanaRows.map(function (row) {
        return [row[0], row[1], row[3] || '', row[1], row[0], ''];
    });
}

function currentPool() {
    return poolForKey(deckKey());
}

function fmtSec(ms) {
    return (ms / 1000).toFixed(2) + 's';
}

function limitMs() {
    let s = parseFloat($('limitSec').value);
    if (!s || s < 0.2) s = 3;
    return s * 1000;
}

function setCardButtons(state) {
    $('btnReveal').style.display = state === 'reveal' ? 'block' : 'none';
    $('btnGrade').style.display = state === 'grade' ? 'flex' : 'none';
    $('btnNext').style.display = state === 'next' ? 'block' : 'none';
}

/* ===== Đồng hồ đếm ngược trực quan (thanh vơi dần theo giới hạn thời gian) ===== */
let _cdRaf = null;
function stopCountdown() {
    if (_cdRaf) {
        cancelAnimationFrame(_cdRaf);
        _cdRaf = null;
    }
}
function hideCountdown() {
    stopCountdown();
    const wrap = $('countdownWrap');
    if (wrap) wrap.style.visibility = 'hidden';
}
function tickCountdown() {
    _cdRaf = null;
    const bar = $('countdownBar');
    if (!bar) return;
    if (phase !== 'running' || isRevealed || isTimedOut || !$('limitOn').checked) return; // dừng/đóng băng
    const total = limitMs();
    let frac = 1 - (pausedMs + (performance.now() - cardStartMs)) / total;
    if (frac < 0) frac = 0;
    bar.style.width = (frac * 100) + '%';
    bar.style.background = frac > 0.5 ? '#356394' : (frac > 0.2 ? '#8a6d3b' : '#7d3743');
    if (frac > 0) _cdRaf = requestAnimationFrame(tickCountdown);
}
function startCountdown() {
    stopCountdown();
    const wrap = $('countdownWrap'), bar = $('countdownBar');
    if (!wrap || !bar) return;
    if ($('limitOn').checked && phase === 'running' && !isRevealed && !isTimedOut) {
        wrap.style.visibility = 'visible';
        bar.style.width = '100%';
        _cdRaf = requestAnimationFrame(tickCountdown);
    } else {
        wrap.style.visibility = 'hidden';
    }
}

function clearTimer() {
    if (limitTimerId) {
        clearTimeout(limitTimerId);
        limitTimerId = null;
    }
    stopCountdown();
}

function startTimer(ms) {
    clearTimer();
    if ($('limitOn').checked) {
        const d = (ms === undefined) ? limitMs() : ms;
        if (d <= 0) {
            doTimeout();
            return;
        }
        limitTimerId = setTimeout(doTimeout, d);
    }
    startCountdown();
}

function updatePhaseUI() {
    if (phase === 'idle') {
        $('startBtn').disabled = false;
        $('startBtn').style.display = '';
        $('pauseBtn').disabled = true;
        $('pauseBtn').textContent = '⏸ Tạm dừng';
        $('stopBtn').disabled = true;
        setCardButtons('none');
        $('cardPanel').classList.remove('dim');
    } else if (phase === 'running') {
        $('startBtn').disabled = true;
        $('pauseBtn').disabled = false;
        $('pauseBtn').textContent = '⏸ Tạm dừng';
        $('stopBtn').disabled = false;
        $('cardPanel').classList.remove('dim');
    } else if (phase === 'paused') {
        $('startBtn').disabled = true;
        $('pauseBtn').disabled = false;
        $('pauseBtn').textContent = '▶ Tiếp tục';
        $('stopBtn').disabled = false;
        $('cardPanel').classList.add('dim');
    }
    $('fixBtn').disabled = (phase === 'idle' || !lastGraded);
}

function currentBucket() {
    return session.byOption[deckKey()] || {};
}

function seenCount(bucket, cardKey) {
    const stat = bucket[cardKey];
    return stat ? (stat.c + stat.w + (stat.t || 0)) : 0;
}

function unseenList(pool) {
    const bucket = currentBucket();
    return pool.filter(function (item) {
        return seenCount(bucket, item[0]) === 0;
    });
}

function avoidRepeat(list) {
    if (!list.length) return null;
    if (list.length === 1) return list[0];
    let i = Math.floor(Math.random() * list.length);
    if (card && list[i][0] === card[0]) i = (i + 1) % list.length;
    return list[i];
}

function weightedPick(list, weights) {
    let totalWeight = 0;
    for (let i = 0; i < weights.length; i++) totalWeight += weights[i];
    if (totalWeight <= 0) return avoidRepeat(list);
    let rnd = Math.random() * totalWeight;
    let idx = list.length - 1;
    for (let i = 0; i < list.length; i++) {
        rnd -= weights[i];
        if (rnd <= 0) {
            idx = i;
            break;
        }
    }
    if (card && list[idx][0] === card[0] && list.length > 1) idx = (idx + 1) % list.length;
    return list[idx];
}

function pickItem() {
    let pool = currentPool().filter(function (item) {
        return !isSkipped(item[0]) && !isExcluded(item[0]);
    });
    if (!pool.length) {
        pool = currentPool();
    }
    if (!pool.length) return null;
    // "Ôn lỗi sai": chỉ giữ các mục từng Sai hoặc Hết giờ trong bộ này (nếu có)
    if ($('mistakesOn') && $('mistakesOn').checked) {
        const wrongBucket = currentBucket();
        const onlyWrong = pool.filter(function (item) {
            const st = wrongBucket[item[0]];
            return st && ((st.w || 0) + (st.t || 0)) > 0;
        });
        if (onlyWrong.length) pool = onlyWrong;
    }
    // Guaranteed coverage near session end (needs question goal on)
    if ($('goalOn').checked) {
        const goal = goalTarget();
        const prog = sessionCount() / goal;
        const remaining = goal - sessionCount();
        const unseen = unseenList(pool);
        if (unseen.length > 0) {
            if (prog >= 0.7 || remaining <= unseen.length) return avoidRepeat(unseen);
            if (prog >= 0.4) {
                const push = (prog - 0.4) / 0.3;
                if (Math.random() < push) return avoidRepeat(unseen);
            }
        }
    }
    const algo = $('algo').value, bucket = currentBucket();
    if (algo === 'unseen') {
        const unseen = unseenList(pool);
        return avoidRepeat(unseen.length ? unseen : pool);
    }
    if (algo === 'least') {
        let minSeen = Infinity;
        pool.forEach(function (item) {
            const seen = seenCount(bucket, item[0]);
            if (seen < minSeen) minSeen = seen;
        });
        const candidates = pool.filter(function (item) {
            return seenCount(bucket, item[0]) === minSeen;
        });
        return avoidRepeat(candidates);
    }
    if (algo === 'weak') {
        const w = pool.map(function (item) {
            const stat = bucket[item[0]];
            if (!stat) return 3.0;
            const seen = stat.c + stat.w + (stat.t || 0);
            if (seen === 0) return 3.0;
            const failRate = (stat.w + (stat.t || 0)) / seen;
            const avg = (stat.tn ? stat.ts / stat.tn : 0);
            return Math.max(0.15, 0.4 + failRate * 3 + Math.min(2, avg / 2000));
        });
        return weightedPick(pool, w);
    }
    return avoidRepeat(pool); // uniform
}

function nextCard(forced) {
    clearTimer();
    const mode = $('mode').value;
    const dir = $('dir').value;
    let pick = forced || pickItem();
    if (!pick) return;
    card = pick;
    cardDir = (dir === 'meaning' && !(pick[2] && pick[2].length > 0)) ? 'read' : dir;
    if (mode === 'radical' && cardDir === 'meaning' && $('hideReading') && $('hideReading').checked) {
        // Bộ thủ + ẩn cách đọc: đề chỉ hiện NGHĨA (vốn ở [1]); cách đọc (ở [2]) chỉ lộ khi lật
        pick = card = [pick[0], pick[2], pick[1], pick[3], pick[4], pick[5]];
    }
    const el = $('kana');
    let promptText = (cardDir === 'write') ? pick[1] : ((cardDir === 'meaning') ? (pick[2] || pick[1]) : pick[0]);
    if (cardDir === 'listen') promptText = '🔊';   // chế độ Nghe: ẩn chữ, chỉ phát âm
    el.textContent = promptText;
    if (cardDir === 'listen') {
        el.style.fontFamily = '';
        el.style.whiteSpace = 'nowrap';
        el.style.lineHeight = '1.15';
        el.style.fontSize = '88px';
    } else if (cardDir === 'write' || cardDir === 'meaning') {
        el.style.whiteSpace = 'normal';
        el.style.lineHeight = '1.35';
        el.style.fontFamily = '';
        el.style.fontSize = (promptText.length > 24 ? '22px' : (promptText.length > 12 ? '28px' : (promptText.length > 6 ? '36px' : '48px')));
    } else if (mode === 'sent') {
        el.style.fontFamily = '';
        el.style.whiteSpace = 'normal';
        el.style.lineHeight = '1.6';
        el.style.fontSize = (pick[0].length > 40 ? '22px' : (pick[0].length > 16 ? '26px' : '32px'));
    } else {
        el.style.fontFamily = '';
        el.style.whiteSpace = 'nowrap';
        el.style.lineHeight = '1.15';
        el.style.fontSize = (pick[0].length >= 4 ? '60px' : (pick[0].length === 3 ? '78px' : '100px'));
    }
    const rj = $('romaji');
    rj.textContent = (cardDir === 'read' || cardDir === 'listen') ? pick[1] : pick[0];
    rj.style.visibility = 'hidden';
    $('ansKanji').style.display = 'none';
    $('wordMeaning').textContent = '';
    $('timeNow').textContent = '';
    {
        // Furigana: hiện cách đọc kana phía trên khi đề là chữ kanji (chỉ chế độ Đọc)
        var fh = $('furiHint');
        if (fh) {
            var showFuri = $('furiOn') && $('furiOn').checked && cardDir === 'read'
                && mode !== 'sent' && card[5] && card[4] && card[4] !== card[0];
            fh.textContent = showFuri ? card[4] : '';
            fh.style.visibility = showFuri ? 'visible' : 'hidden';
        }
    }
    isTypingCard = ($('typingOn').checked && (cardDir === 'read' || cardDir === 'meaning' || cardDir === 'listen') && phase === 'running');
    {
        const showCanvas = phase === 'running' && (cardDir === 'write' || (cardDir === 'meaning' && !isTypingCard));
        if (showCanvas) {
            $('drawWrap').style.display = 'block';
            clearCanvas();
        } else {
            $('drawWrap').style.display = 'none';
        }
    }
    isRevealed = false;
    isTimedOut = false;
    typingDone = false;
    pausedMs = 0;
    cardStartMs = performance.now();
    dontScore = !!($('practiceOn') && $('practiceOn').checked);
    {
        var _eb = $('k130EditBar');
        if (_eb) _eb.style.display = 'none';
        var _ex = $('k130EditBox');
        if (_ex) _ex.style.display = 'none';
        var _nb = $('noteBar');
        if (_nb) _nb.style.display = 'none';
        var _nx = $('noteBox');
        if (_nx) _nx.style.display = 'none';
        var _sb = $('strokeBox');
        if (_sb) _sb.style.display = 'none';
    }
    $('typeDiff').style.display = 'none';
    $('typeDiff').innerHTML = '';
    if (isTypingCard) {
        const ti = $('typeInput');
        ti.style.display = 'block';
        ti.value = '';
        setCardButtons('none');
        setTimeout(function () {
            try {
                ti.focus();
            } catch (e) {
            }
        }, 0);
    } else {
        $('typeInput').style.display = 'none';
        setCardButtons('reveal');
    }
    if (cardDir === 'listen' && phase === 'running') speak(card[4] || card[0]);
    showStrokeBtn();
    startTimer();
}

/* ===== Phát âm (Web Speech API — miễn phí, client-side) ===== */
let _jaVoice = null;
function pickJaVoice() {
    try {
        const vs = speechSynthesis.getVoices();
        _jaVoice = vs.filter(function (v) {
            return /ja[-_]?JP/i.test(v.lang) || /japanese/i.test(v.name);
        })[0] || _jaVoice;
    } catch (e) {
    }
}
if (typeof speechSynthesis !== 'undefined') {
    pickJaVoice();
    try {
        speechSynthesis.onvoiceschanged = pickJaVoice;
    } catch (e) {
    }
}
function speak(text) {
    if (!text || typeof speechSynthesis === 'undefined') return;
    try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(String(text));
        u.lang = 'ja-JP';
        if (_jaVoice) u.voice = _jaVoice;
        u.rate = 0.95;
        speechSynthesis.speak(u);
    } catch (e) {
    }
}
function speakCurrent() {
    if (card) speak(card[4] || card[0]); // card[4] = cách đọc kana (không nhập nhằng âm Hán)
}
function maybeSpeak() {
    if ($('audioOn') && $('audioOn').checked) speakCurrent();
}

/* ===== Ghi chú cá nhân cho MỌI mục (lưu theo card[0]) ===== */
const LS_NOTES = 'jp_notes_v1';
let notesStore = {};
function loadNotes() {
    try {
        const s = lsGet(LS_NOTES);
        if (s) notesStore = JSON.parse(s) || {};
    } catch (e) {
        notesStore = {};
    }
}
function saveNotes() {
    try {
        lsSet(LS_NOTES, JSON.stringify(notesStore));
    } catch (e) {
    }
}
function getNote(key) {
    return (key && notesStore[key]) ? notesStore[key] : '';
}
function setNote(key, text) {
    text = (text || '').trim();
    if (text) notesStore[key] = text; else delete notesStore[key];
    saveNotes();
}
function showNoteBar() {
    const bar = $('noteBar');
    if (!bar) return;
    const on = isRevealed && phase === 'running' && !!card;
    bar.style.display = on ? 'block' : 'none';
    if (!on) {
        const box = $('noteBox');
        if (box) box.style.display = 'none';
        return;
    }
    const note = getNote(card[0]);
    const disp = $('noteDisplay');
    if (disp) {
        disp.textContent = note;
        disp.style.display = note ? 'block' : 'none';
    }
    const btn = $('noteBtnText');
    if (btn) btn.textContent = note ? '📝 Sửa ghi chú' : '📝 Thêm ghi chú';
}
function openNoteEdit() {
    if (!card) return;
    const inp = $('noteInput');
    if (inp) inp.value = getNote(card[0]);
    const box = $('noteBox');
    if (box) box.style.display = 'block';
    setTimeout(function () {
        try {
            if (inp) inp.focus();
        } catch (e) {
        }
    }, 0);
}
function saveNoteInline() {
    if (!card) return;
    const inp = $('noteInput');
    setNote(card[0], inp ? inp.value : '');
    const box = $('noteBox');
    if (box) box.style.display = 'none';
    showNoteBar();
}
function revealListenText() {
    // Chế độ Nghe: khi lật, hiện lại câu/từ tiếng Nhật (vốn bị ẩn lúc hỏi)
    if (cardDir !== 'listen' || !card) return;
    const el = $('kana');
    el.style.fontFamily = '';
    el.style.whiteSpace = 'normal';
    el.style.lineHeight = '1.5';
    el.style.fontSize = (card[0].length > 24 ? '24px' : (card[0].length > 12 ? '30px' : '40px'));
    el.textContent = card[0];
}
function onAnswerShown() {
    revealListenText();
    maybeSpeak();
    showNoteBar();
}

function reveal() {
    if (phase !== 'running' || isRevealed) return;
    clearTimer();
    hideCountdown();
    answerMs = pausedMs + (performance.now() - cardStartMs);
    styleAnswer();
    showAnsKanji();
    $('romaji').style.visibility = 'visible';
    $('wordMeaning').textContent = (cardDir === 'meaning') ? (card[1] || '') : (card[2] || '');
    $('timeNow').textContent = fmtSec(answerMs);
    isRevealed = true;
    setCardButtons('grade');
    k130ShowEditBar();
    onAnswerShown();
}

function recordItem(field, ms) {
    const dKey = deckKey();
    if (!session.byOption[dKey]) session.byOption[dKey] = {};
    const bucket = session.byOption[dKey];
    const cardKey = card[0];
    if (!bucket[cardKey]) bucket[cardKey] = {r: card[1], c: 0, w: 0, t: 0, ts: 0, tn: 0};
    if (bucket[cardKey].t === undefined) bucket[cardKey].t = 0;
    if (bucket[cardKey].ts === undefined) {
        bucket[cardKey].ts = 0;
        bucket[cardKey].tn = 0;
    }
    bucket[cardKey][field]++;
    if (ms !== undefined && ms > 0) {
        bucket[cardKey].ts += ms;
        bucket[cardKey].tn++;
    }
}

function grade(ok) {
    if (phase !== 'running' || !isRevealed || isTimedOut) return;
    if (dontScore) {
        nextCard();
        return;
    }
    if (ok) {
        session.c++;
        recordItem('c', answerMs);
        session.streak = (session.streak || 0) + 1;
        if (session.streak > (session.best || 0)) session.best = session.streak;
    } else {
        session.w++;
        recordItem('w', answerMs);
        if (session.streak > 0) session.prev = session.streak;
        session.streak = 0;
    }
    lastGraded = {deckKey: deckKey(), itemKey: card[0], romaji: card[1], field: (ok ? 'c' : 'w'), ms: answerMs};
    session.times.push(answerMs);
    saveSession();
    afterRecord();
    if (checkGoal()) return;
    nextCard();
}

function doTimeout() {
    if (phase !== 'running' || isRevealed || isTimedOut) return;
    clearTimer();
    hideCountdown();
    $('typeInput').style.display = 'none';
    isTimedOut = true;
    isRevealed = true;
    if (dontScore) {
        styleAnswer();
        showAnsKanji();
        $('romaji').style.visibility = 'visible';
        $('wordMeaning').textContent = (cardDir === 'meaning') ? (card[1] || '') : (card[2] || '');
        $('timeNow').innerHTML = '<span style="color:#9aa0a6;">⏱ Hết giờ (không tính)</span>';
        setCardButtons('next');
        k130ShowEditBar();
        onAnswerShown();
        return;
    }
    session.to = (session.to || 0) + 1;
    recordItem('t', $('limitOn').checked ? limitMs() : undefined);
    if (session.streak > 0) session.prev = session.streak;
    session.streak = 0;
    lastGraded = {
        deckKey: deckKey(),
        itemKey: card[0],
        romaji: card[1],
        field: 't',
        ms: ($('limitOn').checked ? limitMs() : undefined)
    };
    saveSession();
    styleAnswer();
    showAnsKanji();
    $('romaji').style.visibility = 'visible';
    $('wordMeaning').textContent = (cardDir === 'meaning') ? (card[1] || '') : (card[2] || '');
    $('timeNow').innerHTML = '<span style="color:#ffd27a;">⏱ Hết giờ</span>';
    setCardButtons('next');
    afterRecord();
    k130ShowEditBar();
    onAnswerShown();
    if ($('goalOn').checked && sessionCount() >= goalTarget()) {
        setTimeout(finishByGoal, 600);
    }
}

function exKey(cardKey) {
    return deckKey() + '\u00a7' + cardKey;
}

function isExcluded(cardKey) {
    return session.excluded && session.excluded.indexOf(exKey(cardKey)) >= 0;
}

function toggleExclude(cardKey) {
    if (!session.excluded) session.excluded = [];
    const exclKey = exKey(cardKey);
    const i = session.excluded.indexOf(exclKey);
    if (i >= 0) session.excluded.splice(i, 1); else session.excluded.push(exclKey);
    saveSession();
}

function pickAll(inc) {
    const pool = poolForKey(deckKey());
    if (!session.excluded) session.excluded = [];
    pool.forEach(function (item) {
        const exclKey = exKey(item[0]);
        const i = session.excluded.indexOf(exclKey);
        if (inc) {
            if (i >= 0) session.excluded.splice(i, 1);
        } else {
            if (i < 0) session.excluded.push(exclKey);
        }
    });
    saveSession();
    renderPickList();
    updateCoverage();
    refreshMas();
    if (phase === 'running') nextCard();
}

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function itemMatches(item, q) {
    if (!q) return true;
    return (item[0] + ' ' + (item[1] || '') + ' ' + (item[2] || '')).toLowerCase().indexOf(q) >= 0;
}

function pickFiltered(inc) {
    const query = (($('pickSearch') && $('pickSearch').value) || '').toLowerCase();
    const items = poolForKey(deckKey()).filter(function (item) {
        return itemMatches(item, query);
    });
    if (!session.excluded) session.excluded = [];
    items.forEach(function (item) {
        const exclKey = exKey(item[0]);
        const i = session.excluded.indexOf(exclKey);
        if (inc) {
            if (i >= 0) session.excluded.splice(i, 1);
        } else {
            if (i < 0) session.excluded.push(exclKey);
        }
    });
    saveSession();
    renderPickList();
    updateCoverage();
    refreshMas();
    if (phase === 'running') nextCard();
}

function renderPickList() {
    const box = $('pickList');
    if (!box) return;
    const query = (($('pickSearch') && $('pickSearch').value) || '').toLowerCase();
    const items = poolForKey(deckKey());
    const activeCount = items.filter(function (row) {
        return !isExcluded(row[0]);
    }).length;
    const shown = items.filter(function (item) {
        return itemMatches(item, query);
    });
    box.innerHTML = '';
    shown.forEach(function (item) {
        const cardKey = item[0];
        const isOn = !isExcluded(cardKey);
        const row = document.createElement('div');
        row.className = 'pickrow' + (isOn ? ' isOn' : '');
        row.innerHTML = '<span class="pchk">' + (isOn ? '\u2713' : '') + '</span><span class="pjp">' + escapeHtml(cardKey) + '</span><span class="pinfo"><span class="prd">' + escapeHtml(item[1] || '') + '</span> <span class="pmn">' + escapeHtml(item[2] || '') + '</span></span>';
        row.addEventListener('click', function () {
            toggleExclude(cardKey);
            renderPickList();
            updateCoverage();
            refreshMas();
            if (phase === 'running') nextCard();
        });
        box.appendChild(row);
    });
    $('pickCount').textContent = 'Đang luyện ' + activeCount + ' / ' + items.length + (query ? (' · tìm thấy ' + shown.length) : '');
}

function refreshPick() {
    if ($('pickGrp') && $('pickGrp').open) renderPickList();
}

function renderMasteryLists() {
    const items = poolForKey(deckKey());
    const doneBox = $('masDoneList'), remainBox = $('masRemList');
    if (!doneBox) return;
    doneBox.innerHTML = '';
    remainBox.innerHTML = '';
    let doneCount = 0, remainCount = 0;
    items.forEach(function (item) {
        const cardKey = item[0];
        if (isExcluded(cardKey)) return;
        const row = document.createElement('div');
        row.className = 'pickrow on';
        row.innerHTML = '<span class="pjp">' + escapeHtml(cardKey) + '</span><span class="pinfo"><span class="prd">' + escapeHtml(item[1] || '') + '</span> <span class="pmn">' + escapeHtml(item[2] || '') + '</span></span>';
        if (isSkipped(cardKey)) {
            doneCount++;
            row.addEventListener('click', function () {
                unmaster(cardKey);
            });
            doneBox.appendChild(row);
        } else {
            remainCount++;
            row.addEventListener('click', function () {
                masterItem(cardKey);
            });
            remainBox.appendChild(row);
        }
    });
    $('masDoneN').textContent = doneCount;
    $('masRemN').textContent = remainCount;
}

function unmaster(cardKey) {
    if (!session.skip) session.skip = [];
    const i = session.skip.indexOf(skipKeyFor(cardKey));
    if (i >= 0) {
        session.skip.splice(i, 1);
        saveSession();
    }
    updateCoverage();
    renderMasteryLists();
    if ($('pickGrp') && $('pickGrp').open) renderPickList();
}

function masterItem(cardKey) {
    if (!session.skip) session.skip = [];
    const skipKey = skipKeyFor(cardKey);
    if (session.skip.indexOf(skipKey) < 0) session.skip.push(skipKey);
    if (phase === 'running') recordCorrectKey(cardKey);
    saveSession();
    updateStats();
    updateStreak();
    updateCoverage();
    renderMasteryLists();
    if ($('pickGrp') && $('pickGrp').open) renderPickList();
    if (phase === 'running' && checkAllMastered()) {
        finishMastered();
    }
}

function refreshMas() {
    if ($('masGrp') && $('masGrp').open) renderMasteryLists();
}

function skipKeyFor(cardKey) {
    return deckKey() + '\u00a7' + cardKey;
}

function isSkipped(cardKey) {
    return session.skip && session.skip.indexOf(skipKeyFor(cardKey)) >= 0;
}

function redoCard() {
    if (phase !== 'running' || !card) return;
    const c = card;
    nextCard(c);
    dontScore = true;
    showFixNote('Làm lại (không tính)');
}

function recordCorrectKey(cardKey) {
    const dKey = deckKey();
    if (!session.byOption[dKey]) session.byOption[dKey] = {};
    const bucket = session.byOption[dKey];
    if (!bucket[cardKey]) bucket[cardKey] = {r: '', c: 0, w: 0, t: 0, ts: 0, tn: 0};
    bucket[cardKey].c = (bucket[cardKey].c || 0) + 1;
    session.c = (session.c || 0) + 1;
    session.streak = (session.streak || 0) + 1;
    if (session.streak > (session.best || 0)) session.best = session.streak;
}

function checkAllMastered() {
    const p = poolForKey(deckKey());
    if (!p.length) return false;
    for (var i = 0; i < p.length; i++) {
        var k = p[i][0];
        if (!isExcluded(k) && !isSkipped(k)) return false;
    }
    return true;
}

/* ===== Tổng kết phiên (đọc từ entry vừa lưu trong lịch sử) + biểu đồ ===== */
function renderSummary() {
    const box = $('summaryBox');
    if (!box) return;
    const history = loadHist();
    if (!history.length) { box.style.display = 'none'; return; }
    const s = history[history.length - 1];
    const total = s.c + s.w + (s.to || 0);
    // Gom các mục cần ôn (sai + hết giờ) trên mọi bộ trong phiên
    const weak = [];
    const byOpt = s.byOption || {};
    for (const dk in byOpt) {
        const bucket = byOpt[dk];
        for (const cardKey in bucket) {
            const st = bucket[cardKey];
            const bad = (st.w || 0) + (st.t || 0);
            if (bad > 0) weak.push({k: cardKey, r: st.r || '', bad: bad});
        }
    }
    weak.sort(function (a, b) { return b.bad - a.bad; });
    const recent = history.slice(-12);

    let html = '<div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-bottom:12px;">';
    html += '<div style="font-size:40px; font-weight:800; color:#6ee7a0; line-height:1;">' + (s.acc || 0) + '%</div>';
    html += '<div style="font-size:13px; color:#c8c8c8; line-height:1.7;">'
        + '<div>✓ <b style="color:#6ee7a0;">' + s.c + '</b>　✗ <b style="color:#ff8b8b;">' + s.w + '</b>　⏱ <b style="color:#ffd27a;">' + (s.to || 0) + '</b>　/ ' + total + ' câu</div>'
        + '<div>Chuỗi dài nhất: <b style="color:#ffd27a;">' + (s.best || 0) + '</b>　·　TB: <b style="color:#9ecbff;">' + (s.avg || '–') + '</b></div>'
        + '</div>';
    html += '<button class="btn small" data-sum-close style="margin-left:auto;">Đóng ✕</button>';
    html += '</div>';

    if (weak.length) {
        html += '<div style="font-size:12px; color:#9aa0a6; margin-bottom:6px;">Cần ôn lại (sai/hết giờ nhiều nhất) — bật "Chỉ ôn lỗi sai" để luyện:</div>';
        html += '<div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px;">';
        weak.slice(0, 10).forEach(function (item) {
            html += '<span style="background:#3a1f24; border:1px solid #7d3743; border-radius:7px; padding:3px 8px; font-size:13px;">'
                + '<span style="font-family:Hiragino Sans,Noto Sans JP,sans-serif; color:#fff;">' + escapeHtml(item.k) + '</span>'
                + (item.r ? ' <span style="color:#9ecbff; font-size:11px;">' + escapeHtml(item.r) + '</span>' : '')
                + ' <span style="color:#ff8b8b; font-size:11px;">×' + item.bad + '</span></span>';
        });
        html += '</div>';
    } else {
        html += '<div style="color:#6ee7a0; font-size:13px; margin-bottom:14px;">✓ Không sai câu nào — tuyệt vời!</div>';
    }

    if (recent.length > 1) {
        html += '<div style="font-size:12px; color:#9aa0a6; margin-bottom:6px;">Độ chính xác ' + recent.length + ' phiên gần nhất:</div>';
        html += '<div style="display:flex; align-items:flex-end; gap:4px; height:74px; padding:6px 4px 2px; background:#101213; border-radius:8px;">';
        recent.forEach(function (rs, idx) {
            const acc = rs.acc || 0;
            const barH = Math.max(3, Math.round(acc * 0.58));
            const isLast = idx === recent.length - 1;
            html += '<div title="' + escapeHtml(rs.date || '') + ' · ' + acc + '%" style="flex:1; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:2px;">'
                + '<div style="width:100%; max-width:24px; height:' + barH + 'px; background:' + (isLast ? '#6ee7a0' : '#356394') + '; border-radius:3px 3px 0 0;"></div>'
                + '<div style="font-size:9px; color:#777;">' + acc + '</div></div>';
        });
        html += '</div>';
    }

    box.innerHTML = html;
    box.style.display = 'block';
}

function finishMastered() {
    stopSession();
    renderSummary();
    $('timeNow').innerHTML = '<span style="color:#6ee7a0;">\u2713 Đã thuộc hết mục này — session đã lưu</span>';
}

function skipCurrent() {
    if (phase !== 'running' || !card) return;
    const skipKey = skipKeyFor(card[0]);
    if (!session.skip) session.skip = [];
    if (session.skip.indexOf(skipKey) < 0) session.skip.push(skipKey);
    recordCorrectKey(card[0]);
    saveSession();
    showFixNote('Đã thuộc (\u2713): ' + card[0]);
    updateStats();
    updateStreak();
    updateCoverage();
    refreshMas();
    if ($('statBox').style.display !== 'none' && $('vSession').value === 'cur') refreshStatView();
    if (checkAllMastered()) {
        finishMastered();
        return;
    }
    if ($('goalOn').checked && sessionCount() >= goalTarget()) {
        finishByGoal();
        return;
    }
    nextCard();
}

function showFixNote(msg) {
    const el = $('fixNote');
    el.textContent = msg;
    clearTimeout(el._t);
    el._t = setTimeout(function () {
        el.textContent = '';
    }, 1800);
}

function fixPrev() {
    if (!lastGraded || phase === 'idle') {
        showFixNote('Chưa có câu để sửa');
        return;
    }
    if (lastGraded.field === 'w') {
        showFixNote('Câu trước đã là Sai');
        return;
    }
    const prevAction = lastGraded;
    if (prevAction.field === 'c') session.c = Math.max(0, session.c - 1);
    else if (prevAction.field === 't') session.to = Math.max(0, (session.to || 0) - 1);
    session.w++;
    const bucket = session.byOption[prevAction.deckKey];
    if (bucket && bucket[prevAction.itemKey]) {
        const item = bucket[prevAction.itemKey];
        item[prevAction.field] = Math.max(0, (item[prevAction.field] || 0) - 1);
        item.w = (item.w || 0) + 1;
    }
    if (prevAction.field === 'c') {
        if ((session.streak || 0) > 0) session.prev = session.streak;
        session.streak = 0;
    }
    lastGraded.field = 'w';
    saveSession();
    updateStats();
    updateStreak();
    updateCoverage();
    if ($('statBox').style.display !== 'none' && $('vSession').value === 'cur') refreshStatView();
    renderPrev();
    showFixNote('Đã sửa "' + prevAction.itemKey + '" → Sai');
}

function sessionCount() {
    return session.c + session.w + (session.to || 0);
}

function goalTarget() {
    let g = parseInt($('goalNum').value, 10);
    if (!g || g < 1) g = 30;
    return g;
}

function updateGoalProg() {
    const el = $('goalProg');
    if ($('goalOn').checked) {
        el.textContent = sessionCount() + ' / ' + goalTarget() + ' câu';
    } else {
        el.textContent = '';
    }
}

function checkGoal() {
    if ($('goalOn').checked && phase !== 'idle' && sessionCount() >= goalTarget()) {
        finishByGoal();
        return true;
    }
    return false;
}

function finishByGoal() {
    clearTimer();
    const reached = goalTarget();
    stopSession();
    renderSummary();
    $('timeNow').innerHTML = '<span style="color:#6ee7a0;">\u2713 Đã đạt ' + reached + ' câu \u2014 session đã lưu</span>';
}

function renderPrev() {
    const p = $('prevPanel');
    if (!lastGraded || phase === 'idle') {
        p.style.display = 'none';
        return;
    }
    p.style.display = 'block';
    $('prevKana').textContent = lastGraded.itemKey;
    $('prevRomaji').textContent = lastGraded.romaji || '';
    let lbl = '', col = '';
    if (lastGraded.field === 'c') {
        lbl = '✓ Bạn chấm: Đúng';
        col = '#6ee7a0';
    } else if (lastGraded.field === 'w') {
        lbl = '✗ Bạn chấm: Sai';
        col = '#ff8b8b';
    } else if (lastGraded.field === 't') {
        lbl = '⏱ Hết giờ';
        col = '#ffd27a';
    }
    const tm = (lastGraded.ms !== undefined && lastGraded.ms > 0) ? (' · ' + fmtSec(lastGraded.ms)) : '';
    const el = $('prevResult');
    el.textContent = lbl + tm;
    el.style.color = col;
}

function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function diffHtml(a, b) {
    a = a || '';
    b = b || '';
    const n = a.length, m = b.length;
    const dp = [];
    for (let i = 0; i <= n; i++) dp.push(new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    let i = 0, j = 0;
    const am = new Array(n).fill(false), bm = new Array(m).fill(false);
    while (i < n && j < m) {
        if (a[i] === b[j]) {
            am[i] = true;
            bm[j] = true;
            i++;
            j++;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++;
    }
    let aH = '', bH = '';
    for (let k = 0; k < n; k++) {
        aH += am[k] ? escHtml(a[k]) : '<span style="background:#5a2730;color:#ffd3d3;border-radius:3px;padding:0 1px;">' + escHtml(a[k]) + '</span>';
    }
    for (let k = 0; k < m; k++) {
        bH += bm[k] ? escHtml(b[k]) : '<span style="background:#1f4d33;color:#bff5d4;border-radius:3px;padding:0 1px;">' + escHtml(b[k]) + '</span>';
    }
    return {aH: aH || '<span style="color:#888;">(trống)</span>', bH: bH};
}

function normR(s) {
    return (s || '').toLowerCase().replace(/[^a-z]/g, '');
}

function checkRomaji(typed, target) {
    const t = normR(typed);
    if (!t) return false;
    const parts = String(target).split(/[,/]/).map(normR).filter(Boolean);
    return parts.indexOf(t) >= 0;
}

function typingSubmit() {
    if (phase !== 'running' || isRevealed || !isTypingCard) return;
    clearTimer();
    hideCountdown();
    answerMs = pausedMs + (performance.now() - cardStartMs);
    let typed = $('typeInput').value;
    if ($('romajiInput') && $('romajiInput').checked) typed = romajiToKana(typed, kanaOutKata(), true);
    const cmp = card[4] || card[0];
    styleAnswer();
    showAnsKanji();
    $('romaji').style.visibility = 'visible';
    $('wordMeaning').textContent = (cardDir === 'meaning') ? (card[1] || '') : (card[2] || '');
    $('typeInput').blur();
    $('typeInput').style.display = 'none';
    const d = diffHtml(typed, cmp);
    $('typeDiff').innerHTML = '<div style="font-family:Hiragino Sans,Noto Sans JP,sans-serif;"><span style="color:#9aa0a6;font-size:13px;">Bạn gõ:</span> ' + d.aH + '</div><div style="font-family:Hiragino Sans,Noto Sans JP,sans-serif;"><span style="color:#9aa0a6;font-size:13px;">Đáp án:</span> ' + d.bH + '</div>';
    $('typeDiff').style.display = 'block';
    $('timeNow').textContent = fmtSec(answerMs);
    isRevealed = true;
    setCardButtons('grade');
    k130ShowEditBar();
    onAnswerShown();
}

function afterRecord() {
    updateStats();
    updateStreak();
    updateCoverage();
    updateGoalProg();
    renderPrev();
    if ($('fixBtn')) $('fixBtn').disabled = (phase === 'idle' || !lastGraded);
    if ($('statBox').style.display !== 'none' && $('vSession').value === 'cur') refreshStatView();
}

function updateStreak() {
    $('streakCur').textContent = session.streak || 0;
    $('streakPrev').textContent = session.prev || 0;
    $('streakBest').textContent = session.best || 0;
}

function updateStats() {
    $('sCorrect').textContent = session.c;
    $('sWrong').textContent = session.w;
    $('sTimeout').textContent = session.to || 0;
    const t = session.c + session.w + (session.to || 0);
    $('sAcc').textContent = t ? Math.round(session.c / t * 100) + '%' : '–';
    $('sAvg').textContent = session.times.length ? fmtSec(session.times.reduce(function (a, b) {
        return a + b;
    }, 0) / session.times.length) : '–';
}

function updateCoverage() {
    const key = deckKey();
    const pool = poolForKey(key);
    const bucket = session.byOption[key] || {};
    let seen = 0, mast = 0, total = 0;
    for (let i = 0; i < pool.length; i++) {
        const cardKey = pool[i][0];
        if (isExcluded(cardKey)) continue;
        total++;
        const stat = bucket[cardKey];
        const skipped = isSkipped(cardKey);
        if (skipped) mast++;
        if ((stat && (stat.c + stat.w + (stat.t || 0) > 0)) || skipped) seen++;
    }
    const pct = total ? Math.round(seen / total * 100) : 0;
    $('covVal').textContent = seen + ' / ' + total + ' (' + pct + '%)';
    if ($('masVal')) {
        $('masVal').textContent = mast;
        $('masRem').textContent = (total - mast);
    }
}

function startSession() {
    if (phase !== 'idle') return;
    if ($('summaryBox')) $('summaryBox').style.display = 'none';
    lastGraded = null;
    phase = 'running';
    updatePhaseUI();
    updateGoalProg();
    renderPrev();
    nextCard();
    $('jp').focus();
}

function pauseToggle() {
    if (phase === 'running') {
        if (!isRevealed && !isTimedOut) {
            pausedMs += performance.now() - cardStartMs;
            clearTimer();
        }
        phase = 'paused';
        updatePhaseUI();
        if (!isRevealed) $('timeNow').innerHTML = '<span style="color:#ffd27a;">⏸ Đã tạm dừng</span>';
    } else if (phase === 'paused') {
        phase = 'running';
        updatePhaseUI();
        if (!isRevealed && !isTimedOut) {
            $('timeNow').textContent = '';
            cardStartMs = performance.now();
            if ($('limitOn').checked) startTimer(limitMs() - pausedMs);
        }
    }
}

function stopSession() {
    if (phase === 'idle') return;
    clearTimer();
    hideCountdown();
    archiveIfData();
    session = {c: 0, w: 0, to: 0, streak: 0, best: 0, prev: 0, skip: [], excluded: [], times: [], byOption: {}};
    saveSession();
    phase = 'idle';
    card = null;
    isRevealed = false;
    isTimedOut = false;
    lastGraded = null;
    $('kana').textContent = 'ー';
    $('kana').style.fontSize = '100px';
    $('romaji').style.visibility = 'hidden';
    $('drawWrap').style.display = 'none';
    $('timeNow').textContent = 'Bấm ▶ Bắt đầu để luyện';
    setCardButtons('none');
    updatePhaseUI();
    updateStats();
    updateCoverage();
    updateGoalProg();
    renderPrev();
    if ($('statBox').style.display !== 'none') {
        populateSessionSelect();
        refreshStatView();
    }
}

function archiveIfData() {
    if ((session.c + session.w + (session.to || 0)) > 0) {
        const history = loadHist();
        const total = session.c + session.w + (session.to || 0);
        const now = new Date();
        const pad = function (x) {
            return (x < 10 ? '0' : '') + x;
        };
        history.push({
            date: now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()),
            c: session.c,
            w: session.w,
            to: (session.to || 0),
            best: (session.best || 0),
            acc: Math.round(session.c / total * 100),
            avg: session.times.length ? fmtSec(session.times.reduce(function (a, b) {
                return a + b;
            }, 0) / session.times.length) : '–',
            byOption: JSON.parse(JSON.stringify(session.byOption))
        });
        saveHist(history);
    }
}

function getSessionObj(sel) {
    if (sel === 'cur') return session;
    const history = loadHist();
    return history[parseInt(sel, 10)] || null;
}

function populateSessionSelect() {
    const sel = $('vSession');
    const prev = sel.value;
    sel.innerHTML = '';
    let firstOpt = document.createElement('option');
    firstOpt.value = 'cur';
    firstOpt.textContent = 'Hiện tại';
    sel.appendChild(firstOpt);
    const history = loadHist();
    history.forEach(function (sessItem, i) {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = '#' + (i + 1) + ' · ' + sessItem.date;
        sel.appendChild(opt);
    });
    if (prev && (prev === 'cur' || parseInt(prev, 10) < history.length)) sel.value = prev; else sel.value = 'cur';
}

function populateOptionSelect() {
    const sess = getSessionObj($('vSession').value);
    const sel = $('vOption');
    const prev = sel.value;
    sel.innerHTML = '';
    const buckets = (sess && sess.byOption) ? sess.byOption : {};
    const deckKeys = Object.keys(buckets).filter(function (dKey) {
        const bucket = buckets[dKey];
        for (const cardKey in bucket) {
            if (bucket[cardKey].c + bucket[cardKey].w + (bucket[cardKey].t || 0) > 0) return true;
        }
        return false;
    });
    if (!deckKeys.length) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = '(chưa có dữ liệu)';
        sel.appendChild(opt);
        return;
    }
    const currentDeckKey = deckKey();
    deckKeys.forEach(function (dKey) {
        const opt = document.createElement('option');
        opt.value = dKey;
        opt.textContent = deckLabel(dKey);
        sel.appendChild(opt);
    });
    if (prev && deckKeys.indexOf(prev) >= 0) sel.value = prev; else if (deckKeys.indexOf(currentDeckKey) >= 0) sel.value = currentDeckKey; else sel.value = deckKeys[0];
}

function refreshStatView() {
    populateOptionSelect();
    renderDist();
}

function renderUnseen(optionKey, bucket) {
    const pool = poolForKey(optionKey);
    const total = pool.length;
    const seenSet = {};
    for (const cardKey in bucket) {
        if (bucket[cardKey].c + bucket[cardKey].w + (bucket[cardKey].t || 0) > 0) seenSet[cardKey] = 1;
    }
    const missing = pool.filter(function (item) {
        return !seenSet[item[0]];
    });
    const seen = total - missing.length;
    const pct = total ? Math.round(seen / total * 100) : 0;
    $('distCoverage').textContent = 'Đã gặp: ' + seen + ' / ' + total + ' mục (' + pct + '%)';
    $('distSummary').textContent = 'Còn ' + missing.length + ' mục CHƯA gặp:';
    const box = $('distList');
    box.innerHTML = '';
    if (!missing.length) {
        const div = document.createElement('div');
        div.style.cssText = 'padding:10px; color:#6ee7a0; font-size:14px;';
        div.textContent = '✓ Đã gặp hết tất cả mục trong lựa chọn này!';
        box.appendChild(div);
        return;
    }
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fill,minmax(82px,1fr)); gap:8px;';
    missing.forEach(function (item) {
        const div = document.createElement('div');
        div.style.cssText = 'background:#1a1d1f; border:0.5px solid #3a3f43; border-radius:8px; padding:6px 4px; text-align:center;';
        div.innerHTML = '<div style="font-size:20px; color:#fff; font-family:Hiragino Sans,Noto Sans JP,sans-serif; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + item[0] + '">' + item[0] + '</div><div style="font-size:11px; color:#9aa0a6;">' + item[1] + '</div>';
        grid.appendChild(div);
    });
    box.appendChild(grid);
}

function renderDist() {
    const statSession = getSessionObj($('vSession').value);
    const optionKey = $('vOption').value;
    const box = $('distList');
    box.innerHTML = '';
    if (!optionKey) {
        $('distCoverage').textContent = '';
        $('distSummary').textContent = 'Chưa có dữ liệu cho lựa chọn này.';
        return;
    }
    const bucket = (statSession && statSession.byOption && statSession.byOption[optionKey]) ? statSession.byOption[optionKey] : {};
    if (statSort === 'unseen') {
        renderUnseen(optionKey, bucket);
        return;
    }
    if (!statSession || !statSession.byOption || !statSession.byOption[optionKey]) {
        $('distCoverage').textContent = '';
        $('distSummary').textContent = 'Chưa có dữ liệu cho lựa chọn này.';
        return;
    }
    const rows = [];
    for (const cardKey in bucket) {
        const stat = bucket[cardKey];
        const tt = (stat.t || 0);
        const n = stat.c + stat.w + tt;
        const tn = (stat.tn || 0);
        const avg = tn ? (stat.ts / tn) : 0;
        if (n > 0) rows.push({cardKey: cardKey, r: stat.r, c: stat.c, w: stat.w, t: tt, n: n, fr: (stat.w + tt) / n, avg: avg, tn: tn});
    }
    const total = poolForKey(optionKey).length;
    const seen = rows.length;
    const pct = total ? Math.round(seen / total * 100) : 0;
    $('distCoverage').textContent = 'Đã gặp: ' + seen + ' / ' + total + ' mục (' + pct + '%)';
    let totalAttempts = 0;
    rows.forEach(function (row) {
        totalAttempts += row.n;
    });
    $('distSummary').textContent = 'Tổng ' + totalAttempts + ' lượt trên ' + seen + ' mục đã gặp';
    if (statSort === 'count') rows.sort(function (a, b) {
        return b.n - a.n;
    });
    else if (statSort === 'failrate') rows.sort(function (a, b) {
        return b.fr - a.fr || (b.w + b.t) - (a.w + a.t);
    });
    else if (statSort === 'slow') rows.sort(function (a, b) {
        return b.avg - a.avg;
    });
    else rows.sort(function (a, b) {
            return a.cardKey.localeCompare(b.cardKey, 'ja');
        });
    const maxAttempts = rows.length ? Math.max.apply(null, rows.map(function (row) {
        return row.n;
    })) : 1;
    rows.forEach(function (row) {
        const acc = Math.round(row.c / row.n * 100);
        const color = row.fr >= 0.5 ? '#7d3743' : (row.fr > 0 ? '#8a6d3b' : '#356394');
        const timeoutStr = row.t ? (' /<span style="color:#ffd27a;">' + row.t + '⏱</span>') : '';
        const avgHtml = row.tn ? ('<span style="color:#9ecbff; min-width:48px; text-align:right;">' + fmtSec(row.avg) + '</span>') : '<span style="color:#555; min-width:48px; text-align:right;">–</span>';
        const div = document.createElement('div');
        div.className = 'distrow';
        div.innerHTML = '<span style="min-width:60px; font-family:Hiragino Sans,Noto Sans JP,sans-serif; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + row.cardKey + '">' + row.cardKey + '</span>'
            + '<div class="distbar" style="width:' + (row.n / maxAttempts * 80) + 'px; background:' + color + ';"></div>'
            + '<span style="color:#9aa0a6; min-width:26px;">' + row.n + '×</span>'
            + avgHtml
            + '<span style="margin-left:auto; font-size:12px;"><span style="color:#6ee7a0;">' + row.c + '✓</span>/<span style="color:#ff8b8b;">' + row.w + '✗</span>' + timeoutStr + ' · ' + acc + '%</span>';
        box.appendChild(div);
    });
}

function clearAll() {
    saveHist([]);
    lsDel(LS_HIST);
    session = {c: 0, w: 0, to: 0, streak: 0, best: 0, prev: 0, skip: [], excluded: [], times: [], byOption: {}};
    saveSession();
    lsDel(LS_CUR);
    lastGraded = null;
    updateStats();
    updateCoverage();
    populateSessionSelect();
    refreshStatView();
}

function syncControls() {
    const mode = $('mode').value;
    const isChar = mode === 'char';
    const isWord = mode === 'word';
    const isLesson = (mode === 'sent' || mode === 'lword');
    const isKanji = mode === 'kanji';
    $('rangeWrap').style.opacity = isChar ? '1' : '0.4';
    $('range').disabled = !isChar;
    $('scriptWrap').style.opacity = (isChar || isWord) ? '1' : '0.4';
    $('script').disabled = !(isChar || isWord);
    $('baiWrap').style.display = isLesson ? 'block' : 'none';
    $('krowWrap').style.display = isKanji ? 'block' : 'none';
    $('kgrpWrap').style.display = (mode === 'kanji130') ? 'block' : 'none';
    $('ngrpWrap').style.display = (mode === 'number') ? 'block' : 'none';
    $('lwordFormWrap').style.display = (mode === 'lword') ? 'block' : 'none';
    $('cgrpWrap').style.display = (mode === 'counter') ? 'block' : 'none';
    // "Ẩn cách đọc" chỉ liên quan chế độ Bộ thủ -> chỉ hiện toggle này trên màn hình chính khi đó
    if ($('hideReadingWrap')) $('hideReadingWrap').style.display = (mode === 'radical') ? 'inline-flex' : 'none';
}

function saveLimit() {
    lsSet(LS_LIMIT, JSON.stringify({
        on: $('limitOn').checked,
        sec: $('limitSec').value,
        gon: $('goalOn').checked,
        gnum: $('goalNum').value,
        algo: $('algo').value,
        typing: $('typingOn').checked,
        practice: $('practiceOn').checked,
        audio: $('audioOn') ? $('audioOn').checked : false,
        furi: $('furiOn') ? $('furiOn').checked : false,
        mistakes: $('mistakesOn') ? $('mistakesOn').checked : false,
        romaji: $('romajiInput') ? $('romajiInput').checked : false,
        kanaScript: $('kanaScript') ? $('kanaScript').value : 'auto',
        hideReading: $('hideReading') ? $('hideReading').checked : false,
        lwf: $('lwordForm').value
    }));
}

$('tipBtn').addEventListener('click', function () {
    const b = $('tipBox');
    const show = b.style.display === 'none';
    b.style.display = show ? 'block' : 'none';
    $('tipBtn').textContent = show ? '? Ẩn gợi ý' : '? Gợi ý mốc';
});
$('dir').addEventListener('change', function () {
    updateCoverage();
    if (phase === 'running') nextCard(); else $('drawWrap').style.display = 'none';
    refreshPick();
    refreshMas();
});
$('appW').addEventListener('input', function () {
    $('appWVal').textContent = this.value + '%';
});
$('appW').addEventListener('change', function () {
    setAppWidth(this.value);
});
$('clearDraw').addEventListener('click', clearCanvas);
window.addEventListener('resize', function () {
    if (canvas) setCanvasSize(canvasSize);
});
document.querySelectorAll('[data-size]').forEach(function (b) {
    b.addEventListener('click', function () {
        setCanvasSize(b.getAttribute('data-size'));
    });
});
$('penW').addEventListener('input', function () {
    penWidth = parseInt(this.value, 10) || 11;
    $('penWVal').textContent = penWidth + 'px';
    try {
        lsSet('jp_reader_pen', JSON.stringify({w: penWidth, color: penColor}));
    } catch (e) {
    }
});
$('penColor').addEventListener('input', function () {
    penColor = this.value;
    try {
        lsSet('jp_reader_pen', JSON.stringify({w: penWidth, color: penColor}));
    } catch (e) {
    }
});
$('typeInput').addEventListener('keydown', function (e) {
    if (e.code === keys.kana && romajiInputOn()) {   // đổi loại kana — chỉ khi đang dùng tự chuyển
        e.preventDefault();
        cycleKana();
        return;
    }
    if (e.key === 'Enter') {
        if (e.isComposing || e.keyCode === 229) return;
        e.preventDefault();
        if (!isRevealed) typingSubmit();
    }
});
$('typingOn').addEventListener('change', function () {
    saveLimit();
    if (phase === 'running') nextCard();
});
$('startBtn').addEventListener('click', startSession);
$('pauseBtn').addEventListener('click', pauseToggle);
$('stopBtn').addEventListener('click', stopSession);
$('primary').addEventListener('click', reveal);
$('correct').addEventListener('click', function () {
    grade(true);
});
$('wrong').addEventListener('click', function () {
    grade(false);
});
$('nextBtn').addEventListener('click', function () {
    if (phase === 'running') nextCard();
});
$('fixBtn').addEventListener('click', fixPrev);
$('skipBtn').addEventListener('click', skipCurrent);
$('redoBtn').addEventListener('click', redoCard);
$('pickAllBtn').addEventListener('click', function () {
    pickAll(true);
});
$('pickNoneBtn').addEventListener('click', function () {
    pickAll(false);
});
$('pickGrp').addEventListener('toggle', function () {
    if ($('pickGrp').open) renderPickList();
});
$('masGrp').addEventListener('toggle', function () {
    if ($('masGrp').open) renderMasteryLists();
});
$('pickInclResBtn').addEventListener('click', function () {
    pickFiltered(true);
});
$('pickExclResBtn').addEventListener('click', function () {
    pickFiltered(false);
});
$('pickSearch').addEventListener('input', renderPickList);
if ($('statBtn')) $('statBtn').addEventListener('click', function () {
    const b = $('statBox');
    const show = b.style.display === 'none';
    b.style.display = show ? 'block' : 'none';
    $('statBtn').textContent = 'Xem thống kê ' + (show ? '(▴)' : '(▾)');
    if (show) {
        populateSessionSelect();
        refreshStatView();
    }
});
$('vSession').addEventListener('change', refreshStatView);
$('vOption').addEventListener('change', renderDist);
$('clearAll').addEventListener('click', clearAll);
document.querySelectorAll('[data-sort]').forEach(function (b) {
    b.addEventListener('click', function () {
        statSort = b.getAttribute('data-sort');
        document.querySelectorAll('[data-sort]').forEach(function (x) {
            x.classList.remove('active');
        });
        b.classList.add('active');
        renderDist();
    });
});
$('mode').addEventListener('change', function () {
    syncControls();
    updateCoverage();
    if (phase === 'running') nextCard();
    refreshPick();
    refreshMas();
});
$('script').addEventListener('change', function () {
    updateCoverage();
    if (phase === 'running') nextCard();
    refreshPick();
    refreshMas();
});
$('range').addEventListener('change', function () {
    updateCoverage();
    if (phase === 'running') nextCard();
    refreshPick();
    refreshMas();
});
$('limitOn').addEventListener('change', function () {
    saveLimit();
    if (phase === 'running' && !isRevealed && !isTimedOut) {
        cardStartMs = performance.now();
        startTimer(Math.max(0, limitMs() - pausedMs));
    }
});
$('limitSec').addEventListener('change', saveLimit);
$('goalOn').addEventListener('change', function () {
    saveLimit();
    updateGoalProg();
});
$('goalNum').addEventListener('change', function () {
    saveLimit();
    updateGoalProg();
});
$('algo').addEventListener('change', saveLimit);
$('lwordForm').addEventListener('change', function () {
    saveLimit();
    updateCoverage();
    if (phase === 'running') nextCard();
    refreshPick();
    refreshMas();
});
document.querySelectorAll('[data-bai]').forEach(function (b) {
    b.addEventListener('click', function () {
        b.classList.toggle('active');
        updateCoverage();
        if (phase === 'running') nextCard();
        refreshPick();
        refreshMas();
    });
});
document.querySelectorAll('[data-krow]').forEach(function (b) {
    b.addEventListener('click', function () {
        b.classList.toggle('active');
        updateCoverage();
        if (phase === 'running') nextCard();
        refreshPick();
        refreshMas();
    });
});
document.querySelectorAll('[data-kgrp]').forEach(function (b) {
    b.addEventListener('click', function () {
        b.classList.toggle('active');
        updateCoverage();
        if (phase === 'running') nextCard();
        refreshPick();
        refreshMas();
    });
});
$('k130EditBtn').addEventListener('click', k130OpenInline);
$('k130SaveBtn').addEventListener('click', k130SaveInline);
$('k130CancelBtn').addEventListener('click', function () {
    $('k130EditBox').style.display = 'none';
    $('k130EditBar').style.display = 'block';
});
$('k130mIn').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        k130SaveInline();
    }
});
$('k130nIn').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        k130SaveInline();
    }
});
$('k130Grp').addEventListener('toggle', function () {
    if ($('k130Grp').open) {
        renderK130List();
        renderK130Hist();
    }
});
$('k130Search').addEventListener('input', renderK130List);
$('k130EditList').addEventListener('change', function (e) {
    const t = e.target;
    if (!t || !t.getAttribute) return;
    const k = t.getAttribute('data-k');
    if (!k) return;
    if (!(t.className.indexOf('k130mEdit') >= 0 || t.className.indexOf('k130nEdit') >= 0)) return;
    const mEl = $('k130EditList').querySelector('.k130mEdit[data-k="' + k + '"]');
    const nEl = $('k130EditList').querySelector('.k130nEdit[data-k="' + k + '"]');
    k130Apply(k, mEl ? mEl.value : '', nEl ? nEl.value : '', false);
});
$('k130HistList').addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-hrev]') : null;
    if (!b) return;
    k130Revert(b.getAttribute('data-hrev'));
});
$('k130ResetBtn').addEventListener('click', k130ResetAll);
document.querySelectorAll('[data-ngrp]').forEach(function (b) {
    b.addEventListener('click', function () {
        b.classList.toggle('active');
        updateCoverage();
        if (phase === 'running') nextCard();
        refreshPick();
        refreshMas();
    });
});
document.querySelectorAll('[data-cgrp]').forEach(function (b) {
    b.addEventListener('click', function () {
        b.classList.toggle('active');
        updateCoverage();
        if (phase === 'running') nextCard();
        refreshPick();
        refreshMas();
    });
});

function renderGram() {
    const lessonNum = $('gramSel').value;
    const items = GRAM[lessonNum] || [];
    const box = $('gramList');
    box.innerHTML = '';
    items.forEach(function (gram) {
        const div = document.createElement('div');
        div.style.cssText = 'margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid #2c2f31;';
        var html = '<div style="color:#cfe6ff; font-weight:600; font-size:14px;">' + gram.p + '</div>';
        html += '<div style="color:#c8c8c8; font-size:13px; margin-top:4px; line-height:1.5;">' + gram.gram + '</div>';
        if (gram.ex) {
            html += '<div style="margin-top:6px; font-size:13px;"><span style="color:#fff; font-family:Hiragino Sans,Noto Sans JP,sans-serif;">' + gram.ex + '</span> <span style="color:#9ecbff;"> ' + gram.exr + '</span></div>';
            html += '<div style="font-size:12px; color:#9aa0a6; margin-top:2px;">' + gram.m + '</div>';
        }
        div.innerHTML = html;
        box.appendChild(div);
    });
}

if ($('gramBtn')) $('gramBtn').addEventListener('click', function () {
    const b = $('gramBox');
    const show = b.style.display === 'none';
    b.style.display = show ? 'block' : 'none';
    $('gramBtn').textContent = 'Ngữ pháp theo bài ' + (show ? '(▴)' : '(▾)');
    if (show) renderGram();
});
$('gramSel').addEventListener('change', renderGram);

function renderKanaChart() {
    const box = $('kanaChartList');
    if (!box) return;
    function grid(title, rows) {
        let h = '<div style="font-weight:600; color:#cfe6ff; margin:12px 0 6px; font-size:13px;">' + title + '</div>';
        h += '<div style="display:flex; flex-wrap:wrap; gap:5px;">';
        (rows || []).forEach(function (r) {
            h += '<div style="width:46px; text-align:center; background:#1a1d1f; border:1px solid #2c2f31; border-radius:7px; padding:5px 2px;">'
                + '<div style="font-family:Hiragino Sans,Noto Sans JP,sans-serif; font-size:19px; color:#fff;">' + r[0] + '</div>'
                + '<div style="font-size:10px; color:#9ecbff;">' + r[1] + '</div></div>';
        });
        return h + '</div>';
    }
    box.innerHTML = grid('Hiragana — cơ bản', H_BASIC) + grid('Hiragana — biến âm (dakuten)', H_DAKU) + grid('Hiragana — âm ghép (yōon)', H_YOON)
        + grid('Katakana — cơ bản', K_BASIC) + grid('Katakana — biến âm', K_DAKU) + grid('Katakana — âm ghép', K_YOON);
}
if ($('kanaChartBtn')) $('kanaChartBtn').addEventListener('click', function () {
    const b = $('kanaChartBox');
    const show = b.style.display === 'none';
    b.style.display = show ? 'block' : 'none';
    $('kanaChartBtn').textContent = 'Bảng tra kana ' + (show ? '(▴)' : '(▾)');
    if (show) renderKanaChart();
});

/* ===== Xem trước danh sách: các mục (+ ngữ pháp nếu là bài) trước khi luyện ===== */
function renderPreview() {
    const box = $('previewList');
    if (!box) return;
    const items = poolForKey(deckKey());
    let html = '<div style="font-size:12px; color:#9aa0a6; margin-bottom:8px;">Danh sách ' + items.length + ' mục trong lựa chọn hiện tại (đọc lướt trước khi luyện):</div>';
    items.forEach(function (it) {
        html += '<div style="display:flex; gap:10px; align-items:baseline; padding:5px 4px; border-bottom:1px solid #2c2f31; font-size:14px;">'
            + '<span style="font-family:Hiragino Sans,Noto Sans JP,sans-serif; color:#fff; min-width:64px;">' + escapeHtml(it[0]) + '</span>'
            + '<span style="color:#9ecbff; min-width:90px;">' + escapeHtml(it[1] || '') + '</span>'
            + '<span style="color:#c8c8c8; flex:1;">' + escapeHtml(it[2] || '') + '</span>'
            + '</div>';
    });
    const mode = $('mode').value;
    if (mode === 'lword' || mode === 'sent') {
        selectedLessons().forEach(function (n) {
            const g = GRAM[String(n)];
            if (!g || !g.length) return;
            html += '<div style="font-weight:600; color:#cfe6ff; margin:16px 0 6px; font-size:13px;">Ngữ pháp — Bài ' + n + '</div>';
            g.forEach(function (gr) {
                html += '<div style="margin-bottom:9px; font-size:13px; padding-bottom:7px; border-bottom:1px solid #2c2f31;">'
                    + '<div style="color:#cfe6ff; font-weight:600;">' + escapeHtml(gr.p) + '</div>'
                    + '<div style="color:#c8c8c8; line-height:1.5;">' + escapeHtml(gr.g) + '</div>'
                    + (gr.ex ? '<div style="margin-top:3px;"><span style="font-family:Hiragino Sans,Noto Sans JP,sans-serif; color:#fff;">' + escapeHtml(gr.ex) + '</span> <span style="color:#9ecbff;">' + escapeHtml(gr.exr) + '</span> <span style="color:#9aa0a6;">— ' + escapeHtml(gr.m) + '</span></div>' : '')
                    + '</div>';
            });
        });
    }
    box.innerHTML = html;
}
if ($('previewBtn')) $('previewBtn').addEventListener('click', function () {
    const b = $('previewBox');
    const show = b.style.display === 'none';
    b.style.display = show ? 'block' : 'none';
    $('previewBtn').textContent = 'Xem trước bài ' + (show ? '(▴)' : '(▾)');
    if (show) renderPreview();
});

/* ===== Thanh công cụ dạng tab (chỉ bản v2): gom Tùy chọn · Chọn từ · Sửa nghĩa ·
        Thống kê · Ngữ pháp · Bảng kana · Xem trước vào 1 thanh dưới thẻ ===== */
const TOOL_IDS = ['optGrp', 'pickGrp', 'masGrp', 'k130Grp', 'statBox', 'gramBox', 'kanaChartBox', 'previewBox'];
let _activeTool = null;
function renderTool(id) {
    if (id === 'pickGrp') renderPickList();
    else if (id === 'k130Grp') { renderK130List(); renderK130Hist(); }
    else if (id === 'statBox') { populateSessionSelect(); refreshStatView(); }
    else if (id === 'gramBox') renderGram();
    else if (id === 'kanaChartBox') renderKanaChart();
    else if (id === 'previewBox') renderPreview();
    else if (id === 'masGrp') renderMasteryLists();
    // optGrp: form tĩnh, không cần render
}
function showTool(id) {
    const opening = (_activeTool !== id);   // bấm lại tab đang mở => đóng (kiểu accordion)
    TOOL_IDS.forEach(function (t) {
        const el = $(t);
        if (!el) return;
        el.style.display = 'none';
        if (el.tagName === 'DETAILS') el.open = false;
    });
    document.querySelectorAll('.tool-tab').forEach(function (b) { b.classList.remove('active'); });
    if (opening && $(id)) {
        const el = $(id);
        if (el.tagName === 'DETAILS') el.open = true;
        el.style.display = 'block';
        const tab = document.querySelector('.tool-tab[data-tool="' + id + '"]');
        if (tab) tab.classList.add('active');
        renderTool(id);
        _activeTool = id;
    } else {
        _activeTool = null;
    }
}

/* ===== Thứ tự nét (hanzi-writer, tải theo yêu cầu; CHỈ kanji, CẦN internet) ===== */
let _hwLoading = null;
function ensureHanziWriter() {
    if (window.HanziWriter) return Promise.resolve(true);
    if (_hwLoading) return _hwLoading;
    _hwLoading = new Promise(function (resolve) {
        const sc = document.createElement('script');
        sc.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3/dist/hanzi-writer.min.js';
        sc.onload = function () { resolve(!!window.HanziWriter); };
        sc.onerror = function () { _hwLoading = null; resolve(false); };
        document.head.appendChild(sc);
    });
    return _hwLoading;
}
function kanjiChars(s) {
    const out = [];
    String(s || '').split('').forEach(function (ch) {
        if (/[一-鿿㐀-䶿]/.test(ch) && out.indexOf(ch) < 0) out.push(ch);
    });
    return out;
}
function showStrokeBtn() {
    const disp = (card && phase === 'running' && kanjiChars(card[5] || card[0]).length) ? 'inline-block' : 'none';
    if ($('strokeBtn')) $('strokeBtn').style.display = disp;
    if ($('writeBtn')) $('writeBtn').style.display = disp;
}
const OFFLINE_MSG = '⚠ Không xem được thứ tự nét: cần <b>kết nối internet</b> để tải dữ liệu, mà hiện không truy cập được. Hãy kiểm tra mạng rồi bấm "↻ Lặp lại".';
function openStroke() {
    if (!card) return;
    const chars = kanjiChars(card[5] || card[0]);
    if (!chars.length) return;
    const box = $('strokeBox'), target = $('strokeTarget'), status = $('strokeStatus');
    if (!box) return;
    box.style.display = 'block';
    if ($('strokeTitle')) $('strokeTitle').textContent = '✍ Thứ tự nét';
    if ($('strokeReplay')) $('strokeReplay').style.display = '';
    target.innerHTML = '';
    status.innerHTML = 'Đang tải dữ liệu thứ tự nét…';
    ensureHanziWriter().then(function (ok) {
        if (!ok || !window.HanziWriter) {
            status.innerHTML = OFFLINE_MSG;
            return;
        }
        status.innerHTML = '';
        chars.forEach(function (ch) {
            const cell = document.createElement('div');
            cell.style.cssText = 'margin:4px; text-align:center;';
            const holder = document.createElement('div');
            holder.style.cssText = 'background:#101213; border:1px solid #3a3f43; border-radius:8px;';
            cell.appendChild(holder);
            const lbl = document.createElement('div');
            lbl.style.cssText = 'font-size:11px; color:#9aa0a6; margin-top:3px; font-family:Hiragino Sans,Noto Sans JP,sans-serif;';
            lbl.textContent = ch;
            cell.appendChild(lbl);
            target.appendChild(cell);
            try {
                const writer = window.HanziWriter.create(holder, ch, {
                    width: 100, height: 100, padding: 6, showOutline: true,
                    strokeColor: '#9ecbff', radicalColor: '#6ee7a0', outlineColor: '#333',
                    strokeAnimationSpeed: 1, delayBetweenStrokes: 220,
                    onLoadCharDataError: function () {
                        status.innerHTML = OFFLINE_MSG;
                        lbl.innerHTML = '<span style="color:#ff8b8b;">' + ch + ' ✕</span>';
                    }
                });
                writer.loopCharacterAnimation();
            } catch (e) {
                status.innerHTML = OFFLINE_MSG;
            }
        });
    });
}
/* ===== Luyện viết có chấm điểm (HanziWriter.quiz — tự chấm từng nét; CHỈ kanji/bộ thủ, CẦN internet) ===== */
let _writeWriters = [];
function buildWriteQuiz(chars, msgNode) {
    const target = $('strokeTarget');
    target.innerHTML = '';
    _writeWriters = [];
    let done = 0;
    chars.forEach(function (ch) {
        const cell = document.createElement('div');
        cell.style.cssText = 'margin:4px; text-align:center;';
        const holder = document.createElement('div');
        holder.style.cssText = 'background:#101213; border:1px solid #3a3f43; border-radius:8px; touch-action:none;';
        cell.appendChild(holder);
        const lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:11px; color:#9aa0a6; margin-top:3px; font-family:Hiragino Sans,Noto Sans JP,sans-serif;';
        lbl.textContent = ch;
        cell.appendChild(lbl);
        target.appendChild(cell);
        try {
            const writer = window.HanziWriter.create(holder, ch, {
                width: 110, height: 110, padding: 6,
                showOutline: true, showCharacter: false,
                strokeColor: '#9ecbff', radicalColor: '#6ee7a0', outlineColor: '#333',
                drawingColor: '#ffd27a', drawingWidth: 24,
                onLoadCharDataError: function () {
                    if (msgNode) msgNode.innerHTML = OFFLINE_MSG;
                    lbl.innerHTML = '<span style="color:#ff8b8b;">' + ch + ' ✕</span>';
                }
            });
            _writeWriters.push(writer);
            writer.quiz({
                showHintAfterMisses: 2,
                onComplete: function () {
                    lbl.innerHTML = '<span style="color:#6ee7a0;">' + ch + ' ✓</span>';
                    done++;
                    if (msgNode) {
                        if (done >= chars.length) msgNode.innerHTML = '<span style="color:#6ee7a0; font-weight:600;">Tuyệt vời! Bạn đã viết đúng ✓</span>';
                        else msgNode.textContent = 'Đúng! Viết tiếp chữ bên cạnh →';
                    }
                }
            });
        } catch (e) {
            if (msgNode) msgNode.innerHTML = OFFLINE_MSG;
        }
    });
}
function gradeFromWrite(ok) {
    if (phase !== 'running') return;
    if (!isRevealed) reveal();          // lộ đáp án + bật nút chấm (giống luồng thường)
    const box = $('strokeBox');
    if (box) box.style.display = 'none';
    grade(ok);                          // ghi nhận đúng/sai (tôn trọng chế độ luyện tập) + qua thẻ sau
}
function openWrite() {
    if (!card) return;
    const chars = kanjiChars(card[5] || card[0]);
    if (!chars.length) return;
    const box = $('strokeBox'), status = $('strokeStatus');
    if (!box) return;
    box.style.display = 'block';
    if ($('strokeTitle')) $('strokeTitle').textContent = '✏️ Luyện viết (tự chấm)';
    if ($('strokeReplay')) $('strokeReplay').style.display = 'none';
    $('strokeTarget').innerHTML = '';
    status.innerHTML = 'Đang tải dữ liệu thứ tự nét…';
    ensureHanziWriter().then(function (ok) {
        if (!ok || !window.HanziWriter) { status.innerHTML = OFFLINE_MSG; return; }
        status.innerHTML = '';
        const msg = document.createElement('div');
        msg.style.cssText = 'margin-bottom:6px;';
        msg.textContent = 'Viết theo thứ tự nét bằng chuột/ngón tay. Viết sai sẽ hiện gợi ý.';
        const bar = document.createElement('div');
        bar.style.cssText = 'display:flex; gap:6px; justify-content:center;';
        const demo = document.createElement('button');
        demo.className = 'btn small';
        demo.textContent = '▶ Xem mẫu';
        demo.onclick = function () {
            _writeWriters.forEach(function (wr, i) { try { setTimeout(function () { wr.animateCharacter(); }, i * 700); } catch (e) {} });
        };
        const redo = document.createElement('button');
        redo.className = 'btn small';
        redo.textContent = '↻ Viết lại';
        redo.onclick = function () {
            msg.textContent = 'Viết theo thứ tự nét bằng chuột/ngón tay. Viết sai sẽ hiện gợi ý.';
            buildWriteQuiz(chars, msg);
        };
        bar.appendChild(demo);
        bar.appendChild(redo);
        const gbar = document.createElement('div');
        gbar.style.cssText = 'display:flex; gap:6px; justify-content:center; margin-top:6px;';
        const okB = document.createElement('button');
        okB.className = 'btn small';
        okB.style.cssText = 'background:#1f7a4d; border-color:#2e9e66; color:#eafff2;';
        okB.textContent = 'Đúng ✓';
        okB.onclick = function () { gradeFromWrite(true); };
        const noB = document.createElement('button');
        noB.className = 'btn small';
        noB.style.cssText = 'background:#7a2b2b; border-color:#a53a3a; color:#ffecec;';
        noB.textContent = 'Sai ✕';
        noB.onclick = function () { gradeFromWrite(false); };
        gbar.appendChild(okB);
        gbar.appendChild(noB);
        status.appendChild(msg);
        status.appendChild(bar);
        status.appendChild(gbar);
        buildWriteQuiz(chars, msg);
    });
}
if ($('strokeBtn')) $('strokeBtn').addEventListener('click', openStroke);
if ($('writeBtn')) $('writeBtn').addEventListener('click', openWrite);
if ($('strokeReplay')) $('strokeReplay').addEventListener('click', openStroke);
if ($('strokeClose')) $('strokeClose').addEventListener('click', function () {
    if ($('strokeBox')) $('strokeBox').style.display = 'none';
});
document.querySelectorAll('.keybtn').forEach(function (btn) {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.keybtn').forEach(function (b) {
            b.classList.remove('listening');
            b.textContent = 'gán';
        });
        capturingSlot = btn.getAttribute('data-slot');
        btn.classList.add('listening');
        btn.textContent = 'nhấn phím…';
        $('jp').focus();
    });
});
window.addEventListener('keydown', function (e) {
    if (capturingSlot) {
        e.preventDefault();
        keys[capturingSlot] = e.code;
        lsSet(LS_KEYS, JSON.stringify(keys));
        document.querySelectorAll('.keybtn').forEach(function (b) {
            b.classList.remove('listening');
            b.textContent = 'gán';
        });
        capturingSlot = null;
        renderKeyLabels();
        return;
    }
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) return;
    if (e.code === keys.kana && romajiInputOn()) {   // đổi loại kana — chỉ khi đang dùng tự chuyển
        e.preventDefault();
        cycleKana();
        return;
    }
    if (typingDone) {
        if (e.code === 'Enter' || e.code === keys.reveal) {
            e.preventDefault();
            nextCard();
        }
        return;
    }
    if (e.code === keys.start) {
        e.preventDefault();
        if (phase === 'idle') startSession();
        return;
    }
    if (e.code === keys.pause) {
        e.preventDefault();
        if (phase === 'running' || phase === 'paused') pauseToggle();
        return;
    }
    if (e.code === keys.stop) {
        e.preventDefault();
        if (phase !== 'idle') stopSession();
        return;
    }
    if (e.code === keys.fix) {
        e.preventDefault();
        fixPrev();
        return;
    }
    if (e.code === keys.clear) {
        e.preventDefault();
        clearCanvas();
        return;
    }
    if (e.code === keys.penup) {
        e.preventDefault();
        changePen(2);
        return;
    }
    if (e.code === keys.pendown) {
        e.preventDefault();
        changePen(-2);
        return;
    }
    if (e.code === keys.skip) {
        e.preventDefault();
        skipCurrent();
        return;
    }
    if (e.code === keys.redo) {
        e.preventDefault();
        redoCard();
        return;
    }
    if (phase !== 'running') return;
    if (isTimedOut) {
        if (e.code === keys.reveal || e.code === keys.correct || e.code === keys.wrong) {
            e.preventDefault();
            nextCard();
        }
        return;
    }
    if (e.code === keys.reveal) {
        e.preventDefault();
        if (!isRevealed) reveal();
        return;
    }
    if (isRevealed) {
        if (e.code === keys.correct) {
            e.preventDefault();
            grade(true);
        } else if (e.code === keys.wrong) {
            e.preventDefault();
            grade(false);
        }
    }
});
(function () {
    const s = lsGet(LS_LIMIT);
    if (s) {
        try {
            const o = JSON.parse(s);
            $('limitOn').checked = !!o.on;
            if (o.sec) $('limitSec').value = o.sec;
            $('goalOn').checked = !!o.gon;
            if (o.gnum) $('goalNum').value = o.gnum;
            if (o.algo) $('algo').value = o.algo;
            $('typingOn').checked = !!o.typing;
            $('practiceOn').checked = !!o.practice;
            if ($('audioOn')) $('audioOn').checked = !!o.audio;
            if ($('furiOn')) $('furiOn').checked = !!o.furi;
            if ($('mistakesOn')) $('mistakesOn').checked = !!o.mistakes;
            if ($('romajiInput')) $('romajiInput').checked = !!o.romaji;
            if ($('kanaScript') && o.kanaScript) $('kanaScript').value = o.kanaScript;
            if ($('hideReading')) $('hideReading').checked = !!o.hideReading;
            if (o.lwf) $('lwordForm').value = o.lwf;
        } catch (e) {
        }
    }
})();
(function () {
    try {
        const s = lsGet('jp_reader_appw');
        setAppWidth(s ? s : 70);
    } catch (e) {
        setAppWidth(70);
    }
})();
if ($('audioOn')) $('audioOn').addEventListener('change', saveLimit);
if ($('furiOn')) $('furiOn').addEventListener('change', function () {
    saveLimit();
    if (phase === 'running') nextCard();
});
if ($('speakBtn')) $('speakBtn').addEventListener('click', speakCurrent);
if ($('summaryBox')) $('summaryBox').addEventListener('click', function (e) {
    if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-sum-close')) {
        $('summaryBox').style.display = 'none';
    }
});
if ($('noteBtn')) $('noteBtn').addEventListener('click', openNoteEdit);
if ($('noteSave')) $('noteSave').addEventListener('click', saveNoteInline);
if ($('noteCancel')) $('noteCancel').addEventListener('click', function () {
    if ($('noteBox')) $('noteBox').style.display = 'none';
});
if ($('noteInput')) $('noteInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        saveNoteInline();
    }
});
if ($('mistakesOn')) $('mistakesOn').addEventListener('change', function () {
    saveLimit();
    if (phase === 'running') nextCard();
});
if ($('romajiInput')) $('romajiInput').addEventListener('change', function () {
    saveLimit();
    syncKanaBar();
});
if ($('kanaScript')) $('kanaScript').addEventListener('change', saveLimit);
if ($('hideReading')) $('hideReading').addEventListener('change', function () {
    saveLimit();
    if (phase === 'running') nextCard();
});
if ($('typeInput')) $('typeInput').addEventListener('input', function () {
    if (!($('romajiInput') && $('romajiInput').checked)) return;
    const conv = romajiToKana(this.value, kanaOutKata(), false);
    if (conv !== this.value) {
        this.value = conv;
        try {
            this.setSelectionRange(conv.length, conv.length);
        } catch (e) {
        }
    }
});
initCanvas();
renderKeyLabels();
loadK130E();
loadNotes();
syncControls();
updateStats();
updateStreak();
updateCoverage();
updateGoalProg();
updatePhaseUI();
renderPrev();
syncKanaBar();

/* Gom 7 panel vào thanh tab dưới thẻ (chỉ bản v2 có #toolHost). Chạy CUỐI CÙNG để mọi
   listener của các panel đã gắn xong; appendChild chỉ dời node nên listener được giữ nguyên. */
(function () {
    const host = $('toolHost');
    if (!host) return;   // bản classic không có -> giữ nguyên các nút/details cũ
    TOOL_IDS.forEach(function (t) {
        const el = $(t);
        if (!el) return;
        if (el.tagName === 'DETAILS') {
            const s = el.querySelector('summary');
            if (s) s.style.display = 'none';   // ẩn tiêu đề details, dùng tab thay thế
            el.open = false;
        }
        el.style.display = 'none';
        host.appendChild(el);
    });
    document.querySelectorAll('.tool-tab').forEach(function (b) {
        b.addEventListener('click', function () { showTool(b.getAttribute('data-tool')); });
    });
})();

/* ===== PWA: đăng ký service worker (chỉ trên http/https, bỏ qua file://) ===== */
if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {
        });
    });
}
