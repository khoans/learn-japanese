/* ===== Thanh công cụ dạng tab (chỉ bản v2): gom Tùy chọn · Chọn từ · Sửa nghĩa ·
        Thống kê · Ngữ pháp · Bảng kana · Xem trước vào 1 thanh dưới thẻ ===== */
const TOOL_IDS = ['optGrp', 'pickGrp', 'masGrp', 'hwGrp', 'lookupGrp', 'k130Grp', 'statBox', 'gramBox', 'kanaChartBox', 'previewBox'];
let _activeTool = null;
function renderTool(id) {
    if (id === 'pickGrp') renderPickList();
    else if (id === 'k130Grp') { renderK130List(); renderK130Hist(); }
    else if (id === 'statBox') { populateSessionSelect(); refreshStatView(); }
    else if (id === 'gramBox') renderGram();
    else if (id === 'kanaChartBox') renderKanaChart();
    else if (id === 'previewBox') renderPreview();
    else if (id === 'masGrp') renderMasteryLists();
    else if (id === 'hwGrp') renderHwList();
    else if (id === 'lookupGrp') renderLookup();
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
    if (e.code === keys.master) {
        e.preventDefault();
        masterCurrent();
        return;
    }
    if (e.code === keys.hand) {
        e.preventDefault();
        toggleHandwrite();
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
            if ($('radCommon')) $('radCommon').checked = !!o.radCommon;
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
