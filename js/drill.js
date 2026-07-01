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
        $('pauseLbl').textContent = '⏸ Tạm dừng';
        $('stopBtn').disabled = true;
        setCardButtons('none');
        $('cardPanel').classList.remove('dim');
    } else if (phase === 'running') {
        $('startBtn').disabled = true;
        $('pauseBtn').disabled = false;
        $('pauseLbl').textContent = '⏸ Tạm dừng';
        $('stopBtn').disabled = false;
        $('cardPanel').classList.remove('dim');
    } else if (phase === 'paused') {
        $('startBtn').disabled = true;
        $('pauseBtn').disabled = false;
        $('pauseLbl').textContent = '▶ Tiếp tục';
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

/** Chọn 1 mục kế tiếp theo thuật toán đang bật (uniform/unseen/least/weak) + lọc ôn-lỗi-sai.
 *  @returns {?Card} */
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

/** Lấy thẻ kế tiếp, dựng đề/đáp án, reset trạng thái vòng.
 *  @param {boolean} [forced] bỏ qua kiểm tra mục tiêu/điều kiện dừng */
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

/** Ghi nhận kết quả thẻ hiện tại rồi sang thẻ sau (tôn trọng chế độ không-tính-điểm).
 *  @param {boolean} ok  true = Đúng, false = Sai */
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

