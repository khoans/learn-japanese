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
    $('lwordFormWrap').style.display = (mode === 'lword' || mode === 'theme') ? 'block' : 'none';
    $('cgrpWrap').style.display = (mode === 'counter') ? 'block' : 'none';
    // "Ẩn cách đọc" chỉ liên quan chế độ Bộ thủ -> chỉ hiện toggle này trên màn hình chính khi đó
    if ($('hideReadingWrap')) $('hideReadingWrap').style.display = (mode === 'radical') ? 'inline-flex' : 'none';
    if ($('rgrpWrap')) $('rgrpWrap').style.display = (mode === 'radical') ? 'block' : 'none';
    if ($('thmWrap')) $('thmWrap').style.display = (mode === 'theme') ? 'block' : 'none';
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
        radCommon: $('radCommon') ? $('radCommon').checked : false,
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
$('pickGrp').addEventListener('toggle', function () {
    if ($('pickGrp').open) renderPickList();
});
if ($('pickToSel')) $('pickToSel').addEventListener('click', function () { pickTransfer.moveSel(true); });
if ($('pickToAll')) $('pickToAll').addEventListener('click', function () { pickTransfer.moveAll(true); });
if ($('pickFromSel')) $('pickFromSel').addEventListener('click', function () { pickTransfer.moveSel(false); });
if ($('pickFromAll')) $('pickFromAll').addEventListener('click', function () { pickTransfer.moveAll(false); });
if ($('pickNeedSearch')) $('pickNeedSearch').addEventListener('input', renderPickList);
if ($('pickSkipSearch')) $('pickSkipSearch').addEventListener('input', renderPickList);
if ($('pickNeedSelOnly')) $('pickNeedSelOnly').addEventListener('change', renderPickList);
if ($('pickSkipSelOnly')) $('pickSkipSelOnly').addEventListener('change', renderPickList);
$('masGrp').addEventListener('toggle', function () {
    if ($('masGrp').open) renderMasteryLists();
});
if ($('masToSel')) $('masToSel').addEventListener('click', function () { masMoveSelected(true); });
if ($('masToAll')) $('masToAll').addEventListener('click', function () { masMoveAll(true); });
if ($('masFromSel')) $('masFromSel').addEventListener('click', function () { masMoveSelected(false); });
if ($('masFromAll')) $('masFromAll').addEventListener('click', function () { masMoveAll(false); });
if ($('masRemSearch')) $('masRemSearch').addEventListener('input', renderMasteryLists);
if ($('masDoneSearch')) $('masDoneSearch').addEventListener('input', renderMasteryLists);
if ($('masRemSelOnly')) $('masRemSelOnly').addEventListener('change', renderMasteryLists);
if ($('masDoneSelOnly')) $('masDoneSelOnly').addEventListener('change', renderMasteryLists);
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
// Nút nhóm bộ thủ (dựng động ở decks.js, đã có trước khi handler này chạy)
document.querySelectorAll('[data-rgrp]').forEach(function (b) {
    b.addEventListener('click', function () {
        b.classList.toggle('active');
        updateCoverage();
        if (phase === 'running') nextCard();
        refreshPick();
        refreshMas();
    });
});
// Nút chọn chủ đề (dựng động ở decks.js, đã có trước khi handler này chạy)
document.querySelectorAll('[data-thm]').forEach(function (b) {
    b.addEventListener('click', function () {
        b.classList.toggle('active');
        updateCoverage();
        if (phase === 'running') nextCard();
        refreshPick();
        refreshMas();
    });
});
if ($('radCommon')) $('radCommon').addEventListener('change', function () {
    saveLimit();
    updateCoverage();
    if (phase === 'running') nextCard();
    refreshPick();
    refreshMas();
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

