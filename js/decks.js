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
buildRadicalGroups();
buildThemeGroups();
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

/** @type {Keys} */
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
    // Badge phím tắt hiện ngay TRÊN nút (để dễ thấy)
    var setKb = function (id, code) { var el = $(id); if (el) el.textContent = keyLabel(code); };
    setKb('kbStart', keys.start);
    setKb('kbPause', keys.pause);
    setKb('kbStop', keys.stop);
    setKb('kbReveal', keys.reveal);
    setKb('kbCorrect', keys.correct);
    setKb('kbWrong', keys.wrong);
    setKb('kbNext', keys.reveal);   // nút "Tiếp theo" cũng đi bằng phím Hiện đáp án / Enter
    setKb('kbFix', keys.fix);
    setKb('kbSkip', keys.skip);
    setKb('kbRedo', keys.redo);
    setKb('kbClear', keys.clear);
}

// session = tiến độ phiên hiện tại. ĐƯỢC LƯU localStorage (LS_CUR) — KHÔNG đổi tên các field:
//   c = số đúng, w = số sai, to = số hết giờ
//   streak = chuỗi đúng hiện tại, best = chuỗi dài nhất, prev = chuỗi liền trước
//   times = mảng thời gian trả lời (ms), skip = các mục "đã thuộc", excluded = các mục bị loại
//   byOption[deckKey][cardKey] = thống kê từng mục: {r:romaji, c:đúng, w:sai, t:hết giờ, ts:tổng ms, tn:số lần tính giờ}
/** @type {Session} */
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
/** @type {?Card} */
let card = null;
let isRevealed = false, isTimedOut = false, cardStartMs = 0, pausedMs = 0, answerMs = 0, capturingSlot = null,
    statSort = 'count', limitTimerId = null, lastGraded = null, isTypingCard = false, typingDone = false, cardDir = 'read',
    dontScore = false;

function deckKey() {
    const m = $('mode').value;
    let base;
    if (m === 'counter') base = 'counter|' + selectedCGroups().join(','); else if (m === 'number') base = 'number|' + selectedNGroups().join(','); else if (m === 'kanji') base = 'kanji|' + selectedKRows().join(','); else if (m === 'kanji130') base = 'kanji130|' + selectedKGroups().join(','); else if (m === 'radical') base = 'radical|' + selectedRGroups().join(',') + (($('radCommon') && $('radCommon').checked) ? '|C' : ''); else if (m === 'sent') base = 'sent|' + selectedLessons().join(','); else if (m === 'lword') base = 'lword|' + selectedLessons().join(',') + ($('lwordForm').value === 'kanji' ? '|K' : ''); else if (m === 'theme') base = 'theme|' + selectedThemes().join(','); else if (m === 'word') base = 'word|' + $('script').value; else base = 'char|' + $('script').value + '|' + $('range').value;
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
    if (parts[0] === 'radical') return prefix + 'Bộ thủ' + (parts[2] === 'C' ? ' (phổ biến)' : '') + (parts[1] ? ' · ' + parts[1].split(',').filter(Boolean).length + ' nhóm' : '');
    if (parts[0] === 'sent') return prefix + 'Câu · Bài ' + (parts[1] || '1-5');
    if (parts[0] === 'lword') return prefix + 'Từ · Bài ' + (parts[1] || '1-6') + (parts[2] === 'K' ? ' (kanji)' : '');
    if (parts[0] === 'theme') return prefix + 'Từ theo chủ đề' + (parts[1] ? ' · ' + parts[1].split(',').filter(Boolean).length + ' chủ đề' : '');
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

// Dựng nút nhóm bộ thủ (chủ đề) — suy ra nhóm phân biệt từ RADICALS[*][3].
function buildRadicalGroups() {
    const box = $('rgrpBtns');
    if (!box) return;
    box.innerHTML = '';
    const seen = {};
    (typeof RADICALS !== 'undefined' ? RADICALS : []).forEach(function (r) {
        if (r[3] && !seen[r[3]]) {
            seen[r[3]] = true;
            const btn = document.createElement('button');
            btn.className = 'btn small rgrp active';
            btn.setAttribute('data-rgrp', r[3]);
            btn.textContent = r[3];
            box.appendChild(btn);
        }
    });
}
function selectedRGroups() {
    const a = [];
    document.querySelectorAll('[data-rgrp]').forEach(function (b) {
        if (b.classList.contains('active')) a.push(b.getAttribute('data-rgrp'));
    });
    return a; // rỗng = không lọc nhóm (tất cả)
}
// Nút chọn chủ đề (Từ theo chủ đề) — dựng động từ THEME_LIST, tách rời N5/N4.
function buildThemeGroups() {
    const box = $('thmBtns');
    if (!box) return;
    box.innerHTML = '';
    (typeof THEME_LIST !== 'undefined' ? THEME_LIST : []).forEach(function (t) {
        const btn = document.createElement('button');
        btn.className = 'btn small thm active';
        btn.setAttribute('data-thm', t[0]);
        btn.textContent = t[1];
        box.appendChild(btn);
    });
}
function selectedThemes() {
    const a = [];
    document.querySelectorAll('[data-thm]').forEach(function (b) {
        if (b.classList.contains('active')) a.push(b.getAttribute('data-thm'));
    });
    return a; // rỗng = không lọc (tất cả chủ đề)
}

// poolForKey() trả về mảng các "thẻ" để luyện. Mỗi thẻ (biến `card` / `item`) là mảng 6 phần tử:
//   [0] prompt      — đề bài hiển thị (đồng thời là KHÓA định danh của mục)
//   [1] answer      — đáp án (romaji, hoặc "romaji · nghĩa")
//   [2] extra       — thông tin phụ (nghĩa / cấu tạo / ghi chú)
//   [3] romaji      — romaji thuần (đề bài khi luyện Viết; để hiện đáp án)
//   [4] compareKey  — chuỗi dùng so khớp khi gõ đáp án (đánh máy)
//   [5] kanjiForm   — dạng kanji để hiện thêm khi đọc (rỗng nếu không có)
/**
 * Chuyển 1 "khóa bộ đề" thành danh sách thẻ để luyện.
 * @param {string} key  vd "sent|1,2", "W:lword|3|K", "radical", "kanji|1,2"
 * @returns {Card[]} mảng thẻ đồng nhất (mỗi thẻ 6 phần tử, xem typedef Card)
 */
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
    if (parts[0] === 'theme') {
        const thset = parts[1] ? parts[1].split(',').filter(Boolean) : [];
        const src = (typeof THEMEWORDS !== 'undefined' ? THEMEWORDS : []);
        return src.filter(function (row) {
            return !thset.length || thset.indexOf(row[4]) >= 0;   // row[4] = themeId
        }).map(function (row) {
            var reading = row[3] || row[0];   // kana
            var kanji = row[0];               // chữ hiển thị
            var hasK = /[一-鿿]/.test(kanji);
            var kanjiForm = hasK ? kanji : '';
            var compareKey = hasK ? reading : kanji;
            var hDisplay = hasK ? reading : kanji;
            var hAnswer = (hDisplay !== reading) ? (reading + '  ·  ' + row[1]) : row[1];
            return [hDisplay, hAnswer, row[2] || '', row[1], compareKey, kanjiForm];
        });
    }
    if (parts[0] === 'radical') {
        const rgroups = parts[1] ? parts[1].split(',').filter(Boolean) : [];
        const commonOnly = (parts[2] === 'C');
        return RADICALS.filter(function (row) {
            if (commonOnly && !row[4]) return false;                 // row[4] = phổ biến
            if (rgroups.length && rgroups.indexOf(row[3]) < 0) return false; // row[3] = nhóm
            return true;
        }).map(function (row) {
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

