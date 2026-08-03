/* ===== Tooltip "bộ thủ cấu tạo" khi rê chuột vào một chữ kanji =====
   Dùng chung cho index.html VÀ report.html, nên file này KHÔNG được phụ thuộc vào
   engine trong js/ — chỉ cần data/radicals.js (RADICALS) + data/kanji-parts.js (KANJI_PARTS)
   đã nạp trước. Tự chèn CSS của mình để hai trang khỏi phải chép style.

   Cách dùng:
     kanjiTipHtml(text)  -> chuỗi HTML, mỗi kanji CÓ dữ liệu được bọc <span class="kj-tip">
     tipifyEl(el)        -> lấy text hiện có của el và bọc lại (dùng cho chỗ đang set textContent)
   Tooltip hiện bằng 1 hộp duy nhất gắn ở <body>, bắt sự kiện theo kiểu uỷ quyền nên
   nội dung dựng sau lúc nào cũng chạy, không cần gắn lại listener. */
(function () {
    'use strict';
    if (typeof document === 'undefined') return;
    if (typeof KANJI_PARTS === 'undefined') return;   // chưa có dữ liệu -> không bật gì cả

    // Dạng viết tắt của bộ thủ -> dạng gốc có trong RADICALS (để tra được nghĩa).
    const VARIANT = {
        '亻': '人', '刂': '刀', '攵': '攴', '氵': '水', '忄': '心', '扌': '手',
        '礻': '示', '衤': '衣', '艹': '艸', '辶': '辵', '阝': '阜', '⻖': '阜',
        '耂': '老', '⺌': '小', '⺍': '小', '灬': '火', '犭': '犬', '牜': '牛',
        '𤣩': '玉', '罒': '网', '⺡': '水', '⺮': '竹', '⺼': '肉', '乚': '乙'
    };

    const RAD = {};
    if (typeof RADICALS !== 'undefined') {
        RADICALS.forEach(function (r) { RAD[r[0]] = r; });   // [chữ, nghĩa, info, nhóm, phổ biến]
    }

    function radInfo(ch) {
        return RAD[ch] || RAD[VARIANT[ch]] || null;
    }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /* ---- CSS (tự chèn 1 lần) ---- */
    const CSS = [
        '.kj-tip{ cursor:help; border-bottom:1px dotted rgba(158,203,255,.55); }',
        '.kj-tip:hover{ background:rgba(158,203,255,.14); border-radius:4px; }',
        '#kjTipBox{ position:absolute; z-index:9999; max-width:290px; padding:10px 12px;',
        '  background:#12161a; border:1px solid #3a4550; border-radius:10px;',
        '  box-shadow:0 8px 26px rgba(0,0,0,.55); color:#e8e8e8; font-size:13px;',
        '  line-height:1.5; pointer-events:none; display:none; text-align:left; }',
        '#kjTipBox .kjt-h{ display:flex; gap:9px; align-items:baseline;',
        '  border-bottom:1px solid #2c2f31; padding-bottom:6px; margin-bottom:7px; }',
        '#kjTipBox .kjt-c{ font-size:30px; line-height:1; color:#fff;',
        "  font-family:'Hiragino Sans','Noto Sans JP',serif; }",
        '#kjTipBox .kjt-hv{ color:#9ecbff; font-weight:600; }',
        '#kjTipBox .kjt-ng{ color:#c8c8c8; font-size:12.5px; }',
        '#kjTipBox .kjt-cap{ font-size:10.5px; letter-spacing:1px; opacity:.55; margin-bottom:4px; }',
        '#kjTipBox .kjt-p{ display:flex; gap:8px; align-items:baseline; margin:3px 0; }',
        "#kjTipBox .kjt-pc{ font-size:20px; color:#fff; min-width:26px; text-align:center;",
        "  font-family:'Hiragino Sans','Noto Sans JP',serif; }",
        '#kjTipBox .kjt-pm{ font-size:12.5px; color:#d6d6d6; }',
        '#kjTipBox .kjt-pi{ font-size:11px; color:#8a9199; }',
        '#kjTipBox .kjt-main{ color:#ffd27a; }',
        '#kjTipBox .kjt-self{ color:#9aa0a6; font-size:12px; font-style:italic; }'
    ].join('\n');

    (function injectCss() {
        const st = document.createElement('style');
        st.id = 'kjTipCss';
        st.textContent = CSS;
        (document.head || document.documentElement).appendChild(st);
    })();

    /* ---- Bọc từng kanji có dữ liệu ---- */
    const KANJI_RE = /[一-鿿々]/g;
    // Bọc kanji trong chuỗi ĐÃ escape (dùng khi chuỗi đã lẫn thẻ HTML, vd <mark> của ô tìm kiếm).
    // Thẻ HTML chỉ gồm ký tự ASCII nên regex kanji không đụng vào tên thẻ.
    function wrapKanjiInHtml(html) {
        return String(html == null ? '' : html).replace(KANJI_RE, function (ch) {
            if (!KANJI_PARTS[ch]) return ch;
            return '<span class="kj-tip" data-kj="' + ch + '">' + ch + '</span>';
        });
    }
    function kanjiTipHtml(text) {
        return wrapKanjiInHtml(esc(text));
    }
    function tipifyEl(el) {
        if (!el) return;
        const t = el.textContent || '';
        if (!KANJI_RE.test(t)) { KANJI_RE.lastIndex = 0; return; }
        KANJI_RE.lastIndex = 0;
        el.innerHTML = kanjiTipHtml(t);
    }

    /* ---- Nội dung tooltip ---- */
    function tipHtml(ch) {
        const o = KANJI_PARTS[ch];
        if (!o) return '';
        let h = '<div class="kjt-h"><span class="kjt-c">' + esc(ch) + '</span>'
            + '<span><span class="kjt-hv">' + esc(o.hv) + '</span> '
            + '<span class="kjt-ng">' + esc(o.ngh) + '</span></span></div>';
        const parts = o.parts || [];
        const selfOnly = parts.length === 1 && parts[0][0] === ch;
        if (selfOnly) {
            const ri = radInfo(ch);
            h += '<div class="kjt-self">Chữ này tự nó là một bộ thủ.</div>';
            if (ri) h += '<div class="kjt-p"><span class="kjt-pc kjt-main">' + esc(ch) + '</span>'
                + '<span><span class="kjt-pm">' + esc(ri[1]) + '</span><br>'
                + '<span class="kjt-pi">' + esc(ri[2]) + '</span></span></div>';
            return h;
        }
        h += '<div class="kjt-cap">GỒM ' + parts.length + ' BỘ PHẬN</div>';
        parts.forEach(function (p) {
            const ri = p[1] ? null : radInfo(p[0]);
            const ngh = p[1] || (ri ? ri[1] : '');
            const info = ri ? ri[2] : '';
            h += '<div class="kjt-p"><span class="kjt-pc' + (p[2] ? ' kjt-main' : '') + '">' + esc(p[0]) + '</span>'
                + '<span><span class="kjt-pm">' + esc(ngh) + '</span>'
                + (p[2] ? ' <span class="kjt-pi">· bộ chính</span>' : '')
                + (info ? '<br><span class="kjt-pi">' + esc(info) + '</span>' : '')
                + '</span></div>';
        });
        return h;
    }

    /* ---- Hộp tooltip + sự kiện (uỷ quyền ở document) ---- */
    let box = null;
    function ensureBox() {
        if (box) return box;
        box = document.createElement('div');
        box.id = 'kjTipBox';
        document.body.appendChild(box);
        return box;
    }
    function show(el) {
        const ch = el.getAttribute('data-kj');
        const html = tipHtml(ch);
        if (!html) return;
        const b = ensureBox();
        b.innerHTML = html;
        b.style.display = 'block';
        // Đặt dưới chữ; nếu tràn mép phải/dưới thì kéo ngược lại cho lọt màn hình.
        const r = el.getBoundingClientRect();
        const sx = window.pageXOffset, sy = window.pageYOffset;
        let x = r.left + sx, y = r.bottom + sy + 7;
        const bw = b.offsetWidth, bh = b.offsetHeight;
        if (x + bw > sx + document.documentElement.clientWidth - 8) {
            x = sx + document.documentElement.clientWidth - bw - 8;
        }
        if (x < sx + 6) x = sx + 6;
        if (r.bottom + bh + 12 > document.documentElement.clientHeight) {
            y = r.top + sy - bh - 7;                 // không đủ chỗ bên dưới -> lật lên trên
            if (y < sy + 4) y = r.bottom + sy + 7;   // trên cũng không đủ -> thôi để dưới
        }
        b.style.left = Math.round(x) + 'px';
        b.style.top = Math.round(y) + 'px';
    }
    function hide() { if (box) box.style.display = 'none'; }

    document.addEventListener('mouseover', function (e) {
        const el = e.target && e.target.closest ? e.target.closest('.kj-tip') : null;
        if (el) show(el);
    });
    document.addEventListener('mouseout', function (e) {
        const el = e.target && e.target.closest ? e.target.closest('.kj-tip') : null;
        if (el) hide();
    });
    // Điện thoại: chạm để hiện, chạm chỗ khác để tắt.
    document.addEventListener('click', function (e) {
        const el = e.target && e.target.closest ? e.target.closest('.kj-tip') : null;
        if (el) { show(el); } else { hide(); }
    });
    window.addEventListener('scroll', hide, true);

    window.kanjiTipHtml = kanjiTipHtml;
    window.wrapKanjiInHtml = wrapKanjiInHtml;
    window.tipifyEl = tipifyEl;
})();
