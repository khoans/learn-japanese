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

