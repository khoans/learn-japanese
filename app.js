// ============================================================
//  app.js — Logic dung chung cho ca 2 giao dien
//  (kana_speed_trainer.html = ban goc, kana_speed_trainer_v2.html = ban moi)
//  PHAI nap SAU registry.js + core-data.js + cac file lesson-*.js
// ============================================================
/* ===== Du lieu theo bai duoc gop tu cac file trong data/lessons/ ===== */
const LWORDS = JPLessons.words();
const LSENT  = JPLessons.sentences();
const GRAM   = JPLessons.grammar();
const ALL_LESSONS = JPLessons.nums();

function _romaSeg(s){var Y={'きゃ':'kya','きゅ':'kyu','きょ':'kyo','しゃ':'sha','しゅ':'shu','しょ':'sho','ちゃ':'cha','ちゅ':'chu','ちょ':'cho','にゃ':'nya','にゅ':'nyu','にょ':'nyo','ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo','みゃ':'mya','みゅ':'myu','みょ':'myo','りゃ':'rya','りゅ':'ryu','りょ':'ryo','ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo','じゃ':'ja','じゅ':'ju','じょ':'jo','びゃ':'bya','びゅ':'byu','びょ':'byo','ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo'};var M={'あ':'a','い':'i','う':'u','え':'e','お':'o','か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko','さ':'sa','し':'shi','す':'su','せ':'se','そ':'so','た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to','な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no','は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho','ま':'ma','み':'mi','む':'mu','め':'me','も':'mo','や':'ya','ゆ':'yu','よ':'yo','ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro','わ':'wa','を':'wo','ん':'n','が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go','ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo','だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do','ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo','ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po'};var S={'ゃ':1,'ゅ':1,'ょ':1};var out='',i=0;while(i<s.length){var c=s[i],n=s[i+1];if(c==='っ'){var r2=(n&&S[s[i+2]])?Y[n+s[i+2]]:(M[n]||'');if(r2){out+=(r2[0]==='c'?'t':r2[0]);}i++;continue;}if(n&&S[n]&&Y[c+n]){out+=Y[c+n];i+=2;continue;}if(M[c]!==undefined){out+=M[c];i++;continue;}out+=c;i++;}return out;}
function kanaRomaji(str){if(!str)return '';return String(str).split('/').map(function(seg){return _romaSeg(seg.trim());}).join(' / ');}
/* ===== Kanji130: chỉnh sửa nghĩa/ghi chú, lưu localStorage, lịch sử + hoàn lại ===== */
const LS_K130='jp_kanji130_edits_v1';
let K130E={ov:{},hist:[]};
function loadK130E(){ try{ const s=lsGet(LS_K130); if(s){ const o=JSON.parse(s); K130E={ov:(o&&o.ov)||{}, hist:(o&&o.hist)||[]}; } }catch(e){ K130E={ov:{},hist:[]}; } }
function saveK130E(){ try{ lsSet(LS_K130, JSON.stringify(K130E)); }catch(e){} }
function k130Base(k){ for(let i=0;i<KANJI130.length;i++){ if(KANJI130[i][0]===k) return KANJI130[i][2]; } return ''; }
function k130EffMeaning(k){ const o=K130E.ov[k]; return (o&&o.m!==undefined&&o.m!=='')?o.m:k130Base(k); }
function k130EffNote(k){ const o=K130E.ov[k]; return (o&&o.n)?o.n:''; }
function k130Compose(k){ const m=k130EffMeaning(k); const n=k130EffNote(k); return m+(n?'   📝 '+n:''); }
function k130IsEdited(k){ const o=K130E.ov[k]; if(!o)return false; const b=k130Base(k); return (o.m!==undefined&&o.m!==''&&o.m!==b)||(!!o.n&&o.n!==''); }
function _escAttr(s){ return _escp(s).replace(/"/g,'&quot;'); }
function k130Apply(k,newM,newN,isRevert){
  newM=(newM==null?'':String(newM)).trim(); newN=(newN==null?'':String(newN)).trim();
  const base=k130Base(k); if(newM==='') newM=base;
  const bm=k130EffMeaning(k), bn=k130EffNote(k);
  if(bm===newM && bn===newN) return false;
  if(newM===base && newN===''){ delete K130E.ov[k]; } else { K130E.ov[k]={m:newM,n:newN}; }
  K130E.hist.push({id:'h'+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36), ts:Date.now(), k:k, bm:bm, bn:bn, am:newM, an:newN, rev:!!isRevert});
  saveK130E();
  if(cur && $('mode').value==='kanji130' && cur[0]===k){ cur[2]=k130Compose(k); if(revealed){ $('wordMeaning').textContent=(curDir==='meaning')?(cur[1]||''):(cur[2]||''); } }
  if($('k130Grp')&&$('k130Grp').open){ renderK130Hist(); }
  return true;
}
function k130Revert(id){ const e=K130E.hist.filter(function(x){return x.id===id;})[0]; if(!e)return; k130Apply(e.k, e.bm, e.bn, true); renderK130List(); }
function k130ResetAll(){ if(!confirm('Khôi phục TẤT CẢ nghĩa về mặc định và xóa toàn bộ lịch sử chỉnh sửa? Không thể hoàn tác.')) return; K130E={ov:{},hist:[]}; saveK130E(); if(cur && $('mode').value==='kanji130'){ cur[2]=k130Compose(cur[0]); if(revealed)$('wordMeaning').textContent=(curDir==='meaning')?(cur[1]||''):(cur[2]||''); } renderK130List(); renderK130Hist(); if(phase==='running') nextCard(); updateCoverage(); }
function k130Uniq(){ const seen={}; const out=[]; KANJI130.forEach(function(x){ if(!seen[x[0]]){ seen[x[0]]=1; out.push(x); } }); return out; }
function renderK130List(){ const box=$('k130EditList'); if(!box)return; const q=(($('k130Search')&&$('k130Search').value)||'').toLowerCase();
  const list=k130Uniq().filter(function(x){ if(!q)return true; const m=k130EffMeaning(x[0]); const n=k130EffNote(x[0]); return (x[0]+' '+x[1]+' '+kanaRomaji(x[1])+' '+m+' '+n).toLowerCase().indexOf(q)>=0; });
  box.innerHTML='';
  if(!list.length){ box.innerHTML='<div style="color:#9aa0a6; font-size:12px; padding:8px;">Không có kết quả.</div>'; return; }
  list.forEach(function(x){ const k=x[0]; const ed=k130IsEdited(k);
    const row=document.createElement('div'); row.style.cssText='padding:8px 4px; border-bottom:1px solid #2c2f31;';
    row.innerHTML='<div style="display:flex; align-items:baseline; gap:8px; margin-bottom:5px;">'
      +'<span style="font-family:Hiragino Sans,Noto Sans JP,sans-serif; color:#fff; font-size:21px;">'+_escp(k)+'</span>'
      +'<span style="color:#9ecbff; font-size:12px;">'+_escp(x[1])+'</span>'
      +(ed?'<span class="k130badge" style="margin-left:auto; font-size:10px; color:#ffe6ab; border:1px solid #8a6d2e; border-radius:5px; padding:1px 5px;">đã sửa</span>':'<span class="k130badge" style="margin-left:auto;"></span>')
      +'</div>'
      +'<input type="text" class="k130mEdit" data-k="'+_escAttr(k)+'" value="'+_escAttr(k130EffMeaning(k))+'" placeholder="nghĩa" style="width:100%; background:#101213; color:#fff; border:1px solid #3a3f43; border-radius:6px; padding:6px; font-size:13px; margin-bottom:5px;">'
      +'<input type="text" class="k130nEdit" data-k="'+_escAttr(k)+'" value="'+_escAttr(k130EffNote(k))+'" placeholder="ghi chú (tùy chọn)" style="width:100%; background:#101213; color:#cfd6e0; border:1px dashed #3a3f43; border-radius:6px; padding:6px; font-size:12.5px;">';
    box.appendChild(row);
  });
}
function renderK130Hist(){ const box=$('k130HistList'); if(!box)return; const h=K130E.hist.slice().reverse(); box.innerHTML='';
  if(!h.length){ box.innerHTML='<div style="color:#9aa0a6; font-size:12px; padding:6px;">Chưa có chỉnh sửa nào.</div>'; return; }
  h.forEach(function(e){ var ts=''; try{ ts=new Date(e.ts).toLocaleString(); }catch(err){ ts=''; }
    var body=''; if(e.bm!==e.am) body+='<div>Nghĩa: <span style="color:#ff9aa0; text-decoration:line-through;">'+_escp(e.bm||'(trống)')+'</span> → <span style="color:#6ee7a0;">'+_escp(e.am||'(trống)')+'</span></div>';
    if(e.bn!==e.an) body+='<div>Ghi chú: <span style="color:#ff9aa0; text-decoration:line-through;">'+_escp(e.bn||'(trống)')+'</span> → <span style="color:#6ee7a0;">'+_escp(e.an||'(trống)')+'</span></div>';
    if(!body) body='<div style="color:#9aa0a6;">(không đổi)</div>';
    const row=document.createElement('div'); row.style.cssText='padding:7px 4px; border-bottom:1px solid #2c2f31;';
    row.innerHTML='<div style="display:flex; align-items:baseline; gap:8px;">'
      +'<span style="font-family:Hiragino Sans,Noto Sans JP,sans-serif; color:#fff; font-size:18px;">'+_escp(e.k)+'</span>'
      +(e.rev?'<span style="font-size:10px; color:#9ecbff;">hoàn lại</span>':'')
      +'<span style="margin-left:auto; color:#777; font-size:11px;">'+_escp(ts)+'</span>'
      +'<button class="btn small" data-hrev="'+_escAttr(e.id)+'" style="padding:3px 8px;">↩ Hoàn lại</button></div>'
      +'<div style="font-size:12px; color:#c8c8c8; margin-top:3px;">'+body+'</div>';
    box.appendChild(row);
  });
}
function k130ShowEditBar(){ const on=($('mode').value==='kanji130' && revealed && phase==='running'); var bar=$('k130EditBar'); if(bar) bar.style.display=on?'block':'none'; if(!on){ var bx=$('k130EditBox'); if(bx) bx.style.display='none'; } }
function k130OpenInline(){ if(!cur||$('mode').value!=='kanji130')return; $('k130mIn').value=k130EffMeaning(cur[0]); $('k130nIn').value=k130EffNote(cur[0]); $('k130EditBar').style.display='none'; $('k130EditBox').style.display='block'; $('k130SaveMsg').textContent=''; setTimeout(function(){ try{$('k130mIn').focus();}catch(e){} },0); }
function k130SaveInline(){ const k=cur&&cur[0]; if(!k)return; const ch=k130Apply(k,$('k130mIn').value,$('k130nIn').value,false); $('k130SaveMsg').textContent=ch?'Đã lưu ✓':'Không có thay đổi'; if($('k130Grp')&&$('k130Grp').open) renderK130List(); setTimeout(function(){ $('k130EditBox').style.display='none'; $('k130EditBar').style.display='block'; },550); }
const $=function(id){return document.getElementById(id);};
/* ===== Tao nut chon bai + danh sach ngu phap dong tu du lieu da nap ===== */
function buildLessonUI(){
  var box=$('baiBtns');
  if(box){ box.innerHTML=''; ALL_LESSONS.forEach(function(n){
    var b=document.createElement('button'); b.className='btn small bai active';
    b.setAttribute('data-bai', n); b.textContent='Bài '+n; box.appendChild(b); }); }
  var gs=$('gramSel');
  if(gs){ gs.innerHTML=''; Object.keys(GRAM).map(Number).sort(function(a,b){return a-b;}).forEach(function(n){
    var o=document.createElement('option'); o.value=n; o.textContent='Bài '+n; gs.appendChild(o); }); }
}
buildLessonUI();
let _cv=null,_ctx=null,_drawing=false,_csize='m',_penW=11,_penColor='#ffffff';
const CFRAC={ s:{fixed:300,h:300}, m:{frac:0.55,h:340}, l:{frac:0.8,h:430}, xl:{frac:1.0,h:340} };
function containerW(){ const j=$('jp'); const w=(j?j.clientWidth:560)-36; return Math.max(240,w); }
function setCanvasSize(sz){ if(!CFRAC[sz])sz='m'; _csize=sz; const c=CFRAC[sz]; if(!_cv)return;
  const cw=containerW(); let w = c.fixed? Math.min(c.fixed,cw) : Math.round(cw*c.frac); w=Math.max(240,Math.min(w,cw));
  _cv.width=w; _cv.height=c.h; _cv.style.width=w+'px'; _cv.style.height=c.h+'px';
  document.querySelectorAll('[data-size]').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-size')===sz); });
  try{ lsSet('jp_reader_csize', sz); }catch(e){} clearCanvas(); }
function initCanvas(){ _cv=$('draw'); _ctx=_cv.getContext('2d');
  let sz='m'; try{ const s=lsGet('jp_reader_csize'); if(s&&CSIZES[s])sz=s; }catch(e){}
  setCanvasSize(sz);
  try{ const pj=lsGet('jp_reader_pen'); if(pj){ const po=JSON.parse(pj); if(po.w)_penW=po.w; if(po.color)_penColor=po.color; } }catch(e){}
  $('penW').value=_penW; $('penWVal').textContent=_penW+'px'; $('penColor').value=_penColor;
  function pos(e){ const r=_cv.getBoundingClientRect(); const cx=(e.touches?e.touches[0].clientX:e.clientX); const cy=(e.touches?e.touches[0].clientY:e.clientY); return {x:(cx-r.left)*(_cv.width/r.width), y:(cy-r.top)*(_cv.height/r.height)}; }
  function down(e){ e.preventDefault(); _drawing=true; const p=pos(e); _ctx.beginPath(); _ctx.moveTo(p.x,p.y); }
  function move(e){ if(!_drawing)return; e.preventDefault(); const p=pos(e); _ctx.strokeStyle=_penColor; _ctx.lineWidth=_penW; _ctx.lineCap='round'; _ctx.lineJoin='round'; _ctx.lineTo(p.x,p.y); _ctx.stroke(); }
  function up(){ _drawing=false; }
  _cv.addEventListener('pointerdown',down); _cv.addEventListener('pointermove',move);
  window.addEventListener('pointerup',up); _cv.addEventListener('pointerleave',up);
}
function clearCanvas(){ if(!_ctx)return; _ctx.clearRect(0,0,_cv.width,_cv.height);
  _ctx.strokeStyle='#2b2f31'; _ctx.lineWidth=1; _ctx.setLineDash([6,6]); _ctx.beginPath();
  _ctx.moveTo(_cv.width/2,0); _ctx.lineTo(_cv.width/2,_cv.height); _ctx.moveTo(0,_cv.height/2); _ctx.lineTo(_cv.width,_cv.height/2); _ctx.stroke(); _ctx.setLineDash([]); }
function setAppWidth(p){ p=parseInt(p,10); if(!p||p<40)p=70; if(p>100)p=100; $('jp').style.maxWidth=p+'vw'; $('appWVal').textContent=p+'%'; $('appW').value=p; try{ lsSet('jp_reader_appw', String(p)); }catch(e){} if(typeof _cv!=='undefined' && _cv) setCanvasSize(_csize); }
function changePen(delta){ _penW=Math.max(2,Math.min(30,(_penW||11)+delta)); var s=$('penW'); if(s)s.value=_penW; var v=$('penWVal'); if(v)v.textContent=_penW+'px'; try{lsSet('jp_reader_pen',JSON.stringify({w:_penW,color:_penColor}));}catch(e){} }
function showAnsKanji(){ const ak=$('ansKanji'); if(!ak)return; const kj=(cur&&cur[5])?cur[5]:''; const prm=$('kana').textContent; if(curDir==='read' && kj && kj!==prm){ ak.textContent=kj; ak.style.display='block'; } else { ak.style.display='none'; } }
function styleAnswer(){ const rj=$('romaji');
  if(curDir==='write'||curDir==='meaning'){ rj.style.fontSize='52px'; rj.style.fontFamily="'Hiragino Sans','Noto Sans JP',sans-serif"; rj.style.color='#fff'; }
  else { rj.style.fontSize='24px'; rj.style.fontFamily=''; rj.style.color='#9ecbff'; } }

const LS_HIST='jp_reader_history_v2', LS_KEYS='jp_reader_keys_v2', LS_CUR='jp_reader_cur_v2', LS_LIMIT='jp_reader_limit_v2';
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function lsDel(k){ try{ localStorage.removeItem(k); }catch(e){} }

let keys={reveal:'ArrowDown',correct:'Digit2',wrong:'Digit1',start:'Enter',pause:'ArrowUp',stop:'KeyX',fix:'Backslash',clear:'KeyC',penup:'BracketRight',pendown:'BracketLeft',skip:'KeyM',redo:'KeyR'};
(function(){ const s=lsGet(LS_KEYS); if(s){ try{ const o=JSON.parse(s); keys=Object.assign({reveal:'ArrowDown',correct:'Digit2',wrong:'Digit1',start:'Enter',pause:'ArrowUp',stop:'KeyX',fix:'Backslash',clear:'KeyC',penup:'BracketRight',pendown:'BracketLeft',skip:'KeyM',redo:'KeyR'}, o); }catch(e){} } })();
function keyLabel(c){ if(c==='Space')return 'Space'; if(c==='BracketRight')return ']'; if(c==='BracketLeft')return '['; if(c==='Minus')return '-'; if(c==='Equal')return '='; if(c==='Backslash')return '\\'; if(c==='Enter')return 'Enter'; if(c.indexOf('Key')===0)return c.slice(3); if(c.indexOf('Digit')===0)return c.slice(5); if(c.indexOf('Arrow')===0)return c.slice(5); return c; }
function renderKeyLabels(){ $('lblReveal').textContent=keyLabel(keys.reveal); $('lblCorrect').textContent=keyLabel(keys.correct); $('lblWrong').textContent=keyLabel(keys.wrong); $('lblStart').textContent=keyLabel(keys.start); $('lblPause').textContent=keyLabel(keys.pause); $('lblStop').textContent=keyLabel(keys.stop); $('lblFix').textContent=keyLabel(keys.fix); $('lblClear').textContent=keyLabel(keys.clear); $('lblPenUp').textContent=keyLabel(keys.penup); $('lblPenDown').textContent=keyLabel(keys.pendown); var _ls=$('lblSkip'); if(_ls)_ls.textContent=keyLabel(keys.skip); var _lr=$('lblRedo'); if(_lr)_lr.textContent=keyLabel(keys.redo); }

let session={c:0,w:0,to:0,streak:0,best:0,prev:0,skip:[],excluded:[],times:[],byOption:{}};
(function(){ const s=lsGet(LS_CUR); if(s){ try{ session=JSON.parse(s); if(session.to===undefined)session.to=0; if(session.streak===undefined)session.streak=0; if(session.best===undefined)session.best=0; if(session.prev===undefined)session.prev=0; if(!session.skip)session.skip=[]; if(!session.excluded)session.excluded=[]; }catch(e){} } })();
function saveSession(){ lsSet(LS_CUR, JSON.stringify(session)); }
function loadHist(){ const s=lsGet(LS_HIST); if(!s)return []; try{return JSON.parse(s);}catch(e){return [];} }
function saveHist(h){ lsSet(LS_HIST, JSON.stringify(h)); }

let phase='idle'; // idle | running | paused
let cur=null, revealed=false, timedOut=false, t0=0, elapsedBefore=0, revealElapsed=0, capturing=null, distSort='count', timerId=null, lastAction=null, typingThis=false, typeDone=false, curDir='read', noCount=false;

function optKey(){ const m=$('mode').value; let base; if(m==='counter') base='counter|'+selectedCGroups().join(','); else if(m==='number') base='number|'+selectedNGroups().join(','); else if(m==='kanji') base='kanji|'+selectedKRows().join(','); else if(m==='kanji130') base='kanji130|'+selectedKGroups().join(','); else if(m==='radical') base='radical'; else if(m==='sent') base='sent|'+selectedLessons().join(','); else if(m==='lword') base='lword|'+selectedLessons().join(',')+($('lwordForm').value==='kanji'?'|K':''); else if(m==='word') base='word|'+$('script').value; else base='char|'+$('script').value+'|'+$('range').value; return ($('dir').value==='write'?'W:':($('dir').value==='meaning'?'M:':''))+base; }
function optLabel(key){ let pre=''; if(key.indexOf('W:')===0){ pre='Viết · '; key=key.slice(2); } else if(key.indexOf('M:')===0){ pre='Nghĩa→kana · '; key=key.slice(2); } const p=key.split('|'); const sc={mix:'Trộn cả hai',hira:'Hiragana',kata:'Katakana'};
  if(p[0]==='counter') return pre+'Đơn vị đếm · loại '+(p[1]||'all'); if(p[0]==='number') return pre+'Số đếm · cấp '+(p[1]||'all'); if(p[0]==='kanji') return pre+'Kanji N5 · hàng '+(p[1]||'all'); if(p[0]==='kanji130') return pre+'130 kanji N5 · nhóm '+(p[1]||'all'); if(p[0]==='radical') return pre+'Bộ thủ thông dụng'; if(p[0]==='sent') return pre+'Câu · Bài '+(p[1]||'1-5'); if(p[0]==='lword') return pre+'Từ · Bài '+(p[1]||'1-6')+(p[2]==='K'?' (kanji)':''); if(p[0]==='word') return pre+'Đọc từ N5 · '+sc[p[1]];
  const rg={basic:'Cơ bản',full:'Cơ bản+biến âm',yoon:'Cơ bản+biến âm+ghép',tricky:'Hay nhầm'}; return pre+'Ký tự · '+sc[p[1]]+' · '+rg[p[2]]; }
function parseLessons(seg){ if(!seg)return ALL_LESSONS.slice(); const a=seg.split(',').map(function(x){return parseInt(x,10);}).filter(function(x){return ALL_LESSONS.indexOf(x)>=0;}); return a.length?a:ALL_LESSONS.slice(); }
function selectedLessons(){ const a=[]; document.querySelectorAll('[data-bai]').forEach(function(b){ if(b.classList.contains('active'))a.push(parseInt(b.getAttribute('data-bai'),10)); }); return a.length?a:ALL_LESSONS.slice(); }
function selectedKRows(){ const a=[]; document.querySelectorAll('[data-krow]').forEach(function(b){ if(b.classList.contains('active'))a.push(parseInt(b.getAttribute('data-krow'),10)); }); return a.length?a:[1,2,3,4,5,6,7,8,9,10]; }
function selectedKGroups(){ const a=[]; document.querySelectorAll('[data-kgrp]').forEach(function(b){ if(b.classList.contains('active'))a.push(parseInt(b.getAttribute('data-kgrp'),10)); }); return a.length?a:[1,2,3,4,5,6,7,8,9,10]; }
function selectedNGroups(){ const a=[]; document.querySelectorAll('[data-ngrp]').forEach(function(b){ if(b.classList.contains('active'))a.push(parseInt(b.getAttribute('data-ngrp'),10)); }); return a.length?a:[1,2,3,4,5,6,7]; }
function selectedCGroups(){ const a=[]; document.querySelectorAll('[data-cgrp]').forEach(function(b){ if(b.classList.contains('active'))a.push(parseInt(b.getAttribute('data-cgrp'),10)); }); return a.length?a:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]; }
function poolForKey(key){ const isW=key.indexOf('W:')===0; if(isW||key.indexOf('M:')===0) key=key.slice(2); const p=key.split('|');
  if(p[0]==='sent'){ const ls=parseLessons(p[1]); return LSENT.filter(function(x){return ls.indexOf(x[2])>=0;}).map(function(x){return [x[0],x[1],x[3]||'',x[1],x[0],''];}); }
  if(p[0]==='lword'){ const ls=parseLessons(p[1]); const km=(p[2]==='K'); return LWORDS.filter(function(x){return ls.indexOf(x[2])>=0;}).map(function(x){ var rd=x[4]||x[0]; var kj=x[0]; var hasK=/[\u4e00-\u9fff]/.test(kj); var kf=hasK?kj:''; var cmp=hasK?rd:kj; if(km){ var disp=kj; var ans=(disp!==rd)?(rd+'  ·  '+x[1]):x[1]; return [disp, ans, x[3]||'', x[1], cmp, kf]; } var hdisp=hasK?rd:kj; var hans=(hdisp!==rd)?(rd+'  ·  '+x[1]):x[1]; return [hdisp, hans, x[3]||'', x[1], cmp, kf]; }); }
  if(p[0]==='radical'){ return RADICALS.map(function(x){return [x[0],x[1],x[2],'',x[0],''];}); }
  if(p[0]==='kanji'){ const rw=(p[1]?p[1].split(',').map(function(z){return parseInt(z,10);}):[1,2,3,4,5,6,7,8,9,10]); return KANJIV.filter(function(x){return rw.indexOf(x[4])>=0;}).map(function(x){return [x[0], x[1]+'  ·  '+x[2], x[3], x[2], x[1], x[0]];}); }
  if(p[0]==='kanji130'){ const gs=(p[1]?p[1].split(',').map(function(z){return parseInt(z,10);}):[1,2,3,4,5,6,7,8,9,10]); return KANJI130.filter(function(x){return gs.indexOf(x[3])>=0;}).map(function(x){ var rom=kanaRomaji(x[1]); return [x[0], x[1]+'  ·  '+rom, k130Compose(x[0]), rom, x[1], x[0]]; }); }
  if(p[0]==='number'){ const ng=(p[1]?p[1].split(',').map(function(z){return parseInt(z,10);}):[1,2,3,4,5,6,7]); return NUMSET.filter(function(x){return ng.indexOf(x[4])>=0;}).map(function(x){return [x[0], x[1]+'  ·  '+x[2], '= '+x[3], x[2], x[1], x[0]];}); }
  if(p[0]==='counter'){ const cg=(p[1]?p[1].split(',').map(function(z){return parseInt(z,10);}):[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]); return COUNTSET.filter(function(x){return cg.indexOf(x[4])>=0;}).map(function(x){return [x[0], x[1]+'  ·  '+x[2], x[3], x[2], x[1], x[0]];}); }
  if(p[0]==='word'){ const s=p[1]; return WORDS.filter(function(w){ if(s==='hira')return w[2]==='H'; if(s==='kata')return w[2]==='K'; return true; }).map(function(w){return [w[0],w[1],w[3]||'',w[1],w[0],''];}); }
  const s=p[1], rg=p[2];
  if(rg==='tricky'){ const m={}; [].concat(H_BASIC,H_DAKU,K_BASIC,K_DAKU).forEach(function(z){m[z[0]]=z[1];});
    return TRICKY.filter(function(k){ const h=k.charCodeAt(0)<0x30A0; if(s==='hira')return h; if(s==='kata')return !h; return true; }).map(function(k){return [k,m[k],'',m[k],k,''];}); }
  if(s==='mix' && isW){ let hl=[].concat(H_BASIC), kl=[].concat(K_BASIC); if(rg==='full'||rg==='yoon'){ hl=hl.concat(H_DAKU); kl=kl.concat(K_DAKU); } if(rg==='yoon'){ hl=hl.concat(H_YOON); kl=kl.concat(K_YOON); } const out=[]; for(let i=0;i<hl.length;i++){ out.push([hl[i][0]+' / '+kl[i][0], hl[i][1], '', hl[i][1], hl[i][0]+kl[i][0], '']); } return out; }
  let arr=[]; if(s==='hira'||s==='mix'){ arr=arr.concat(H_BASIC); if(rg==='full'||rg==='yoon') arr=arr.concat(H_DAKU); if(rg==='yoon') arr=arr.concat(H_YOON); }
  if(s==='kata'||s==='mix'){ arr=arr.concat(K_BASIC); if(rg==='full'||rg==='yoon') arr=arr.concat(K_DAKU); if(rg==='yoon') arr=arr.concat(K_YOON); }
  return arr.map(function(x){return [x[0],x[1],x[3]||'',x[1],x[0],''];}); }
function pool(){ return poolForKey(optKey()); }
function fmt(ms){ return (ms/1000).toFixed(2)+'s'; }
function limitMs(){ let s=parseFloat($('limitSec').value); if(!s||s<0.2)s=3; return s*1000; }
function setCardButtons(state){ $('btnReveal').style.display=state==='reveal'?'block':'none'; $('btnGrade').style.display=state==='grade'?'flex':'none'; $('btnNext').style.display=state==='next'?'block':'none'; }
function clearTimer(){ if(timerId){ clearTimeout(timerId); timerId=null; } }
function startTimer(ms){ clearTimer(); if($('limitOn').checked){ const d=(ms===undefined)?limitMs():ms; if(d<=0){ doTimeout(); return; } timerId=setTimeout(doTimeout, d); } }

function updatePhaseUI(){
  if(phase==='idle'){ $('startBtn').disabled=false; $('startBtn').style.display=''; $('pauseBtn').disabled=true; $('pauseBtn').textContent='⏸ Tạm dừng'; $('stopBtn').disabled=true;
    setCardButtons('none'); $('cardPanel').classList.remove('dim'); }
  else if(phase==='running'){ $('startBtn').disabled=true; $('pauseBtn').disabled=false; $('pauseBtn').textContent='⏸ Tạm dừng'; $('stopBtn').disabled=false; $('cardPanel').classList.remove('dim'); }
  else if(phase==='paused'){ $('startBtn').disabled=true; $('pauseBtn').disabled=false; $('pauseBtn').textContent='▶ Tiếp tục'; $('stopBtn').disabled=false; $('cardPanel').classList.add('dim'); }
  $('fixBtn').disabled=(phase==='idle'||!lastAction);
}

function _bucketCur(){ return session.byOption[optKey()]||{}; }
function _seenCount(b,k){ const s=b[k]; return s?(s.c+s.w+(s.t||0)):0; }
function unseenList(p){ const b=_bucketCur(); return p.filter(function(it){ return _seenCount(b,it[0])===0; }); }
function avoidRepeat(list){ if(!list.length)return null; if(list.length===1)return list[0]; let i=Math.floor(Math.random()*list.length); if(cur && list[i][0]===cur[0]) i=(i+1)%list.length; return list[i]; }
function weightedPick(list,w){ let tot=0; for(let i=0;i<w.length;i++)tot+=w[i]; if(tot<=0)return avoidRepeat(list); let r=Math.random()*tot; let idx=list.length-1; for(let i=0;i<list.length;i++){ r-=w[i]; if(r<=0){ idx=i; break; } } if(cur && list[idx][0]===cur[0] && list.length>1) idx=(idx+1)%list.length; return list[idx]; }
function pickItem(){
  let p=pool().filter(function(it){return !isSkipped(it[0]) && !isExcluded(it[0]);}); if(!p.length){ p=pool(); } if(!p.length)return null;
  // Guaranteed coverage near session end (needs question goal on)
  if($('goalOn').checked){ const g=goalTarget(); const prog=sessionCount()/g; const remaining=g-sessionCount(); const un=unseenList(p);
    if(un.length>0){
      if(prog>=0.7 || remaining<=un.length) return avoidRepeat(un);
      if(prog>=0.4){ const push=(prog-0.4)/0.3; if(Math.random()<push) return avoidRepeat(un); }
    } }
  const algo=$('algo').value, b=_bucketCur();
  if(algo==='unseen'){ const un=unseenList(p); return avoidRepeat(un.length?un:p); }
  if(algo==='least'){ let min=Infinity; p.forEach(function(it){ const n=_seenCount(b,it[0]); if(n<min)min=n; });
    const cand=p.filter(function(it){ return _seenCount(b,it[0])===min; }); return avoidRepeat(cand); }
  if(algo==='weak'){ const w=p.map(function(it){ const s=b[it[0]]; if(!s)return 3.0; const n=s.c+s.w+(s.t||0); if(n===0)return 3.0;
      const fr=(s.w+(s.t||0))/n; const avg=(s.tn?s.ts/s.tn:0); return Math.max(0.15, 0.4 + fr*3 + Math.min(2,avg/2000)); });
    return weightedPick(p,w); }
  return avoidRepeat(p); // uniform
}
function nextCard(forced){
  clearTimer();
  const mode=$('mode').value; const dir=$('dir').value;
  let pick=forced||pickItem(); if(!pick) return;
  cur=pick; curDir=(dir==='meaning' && !(pick[2]&&pick[2].length>0))?'read':dir; const el=$('kana');
  const promptText = (curDir==='write')? pick[1] : ((curDir==='meaning')? (pick[2]||pick[1]) : pick[0]);
  el.textContent=promptText;
  if(curDir==='write'||curDir==='meaning'){ el.style.whiteSpace='normal'; el.style.lineHeight='1.35'; el.style.fontFamily=''; el.style.fontSize=(promptText.length>24?'22px':(promptText.length>12?'28px':(promptText.length>6?'36px':'48px'))); }
  else if(mode==='sent'){ el.style.fontFamily=''; el.style.whiteSpace='normal'; el.style.lineHeight='1.6'; el.style.fontSize=(pick[0].length>40?'22px':(pick[0].length>16?'26px':'32px')); }
  else { el.style.fontFamily=''; el.style.whiteSpace='nowrap'; el.style.lineHeight='1.15'; el.style.fontSize=(pick[0].length>=4?'60px':(pick[0].length===3?'78px':'100px')); }
  const rj=$('romaji'); rj.textContent=(curDir==='read')? pick[1] : pick[0]; rj.style.visibility='hidden'; $('ansKanji').style.display='none'; $('wordMeaning').textContent=''; $('timeNow').textContent='';
  typingThis = ($('typingOn').checked && (curDir==='read'||curDir==='meaning') && phase==='running'); { const showCanvas = phase==='running' && (curDir==='write' || (curDir==='meaning' && !typingThis)); if(showCanvas){ $('drawWrap').style.display='block'; clearCanvas(); } else { $('drawWrap').style.display='none'; } }
  revealed=false; timedOut=false; typeDone=false; elapsedBefore=0; t0=performance.now(); noCount=!!($('practiceOn') && $('practiceOn').checked);
  { var _eb=$('k130EditBar'); if(_eb)_eb.style.display='none'; var _ex=$('k130EditBox'); if(_ex)_ex.style.display='none'; }
  $('typeDiff').style.display='none'; $('typeDiff').innerHTML='';
  if(typingThis){ const ti=$('typeInput'); ti.style.display='block'; ti.value=''; setCardButtons('none'); setTimeout(function(){ try{ti.focus();}catch(e){} },0); }
  else { $('typeInput').style.display='none'; setCardButtons('reveal'); }
  startTimer();
}
function reveal(){ if(phase!=='running'||revealed)return; clearTimer(); revealElapsed=elapsedBefore+(performance.now()-t0); styleAnswer(); showAnsKanji(); $('romaji').style.visibility='visible'; $('wordMeaning').textContent=(curDir==='meaning')?(cur[1]||''):(cur[2]||''); $('timeNow').textContent=fmt(revealElapsed); revealed=true; setCardButtons('grade'); k130ShowEditBar(); }
function recordItem(field, ms){ const ok2=optKey(); if(!session.byOption[ok2]) session.byOption[ok2]={}; const b=session.byOption[ok2]; const k=cur[0];
  if(!b[k]) b[k]={r:cur[1],c:0,w:0,t:0,ts:0,tn:0}; if(b[k].t===undefined)b[k].t=0; if(b[k].ts===undefined){b[k].ts=0;b[k].tn=0;} b[k][field]++; if(ms!==undefined && ms>0){ b[k].ts+=ms; b[k].tn++; } }
function grade(ok){ if(phase!=='running'||!revealed||timedOut)return; if(noCount){ nextCard(); return; }
  if(ok){session.c++; recordItem('c',revealElapsed); session.streak=(session.streak||0)+1; if(session.streak>(session.best||0))session.best=session.streak;} else {session.w++; recordItem('w',revealElapsed); if(session.streak>0)session.prev=session.streak; session.streak=0;}
  lastAction={optKey:optKey(), itemKey:cur[0], romaji:cur[1], field:(ok?'c':'w'), ms:revealElapsed};
  session.times.push(revealElapsed); saveSession(); afterRecord(); if(checkGoal())return; nextCard(); }
function doTimeout(){ if(phase!=='running'||revealed||timedOut)return; clearTimer(); $('typeInput').style.display='none'; timedOut=true; revealed=true; if(noCount){ styleAnswer(); showAnsKanji(); $('romaji').style.visibility='visible'; $('wordMeaning').textContent=(curDir==='meaning')?(cur[1]||''):(cur[2]||''); $('timeNow').innerHTML='<span style="color:#9aa0a6;">⏱ Hết giờ (không tính)</span>'; setCardButtons('next'); k130ShowEditBar(); return; }
  session.to=(session.to||0)+1; recordItem('t', $('limitOn').checked?limitMs():undefined); if(session.streak>0)session.prev=session.streak; session.streak=0; lastAction={optKey:optKey(), itemKey:cur[0], romaji:cur[1], field:'t', ms:($('limitOn').checked?limitMs():undefined)}; saveSession();
  styleAnswer(); showAnsKanji(); $('romaji').style.visibility='visible'; $('wordMeaning').textContent=(curDir==='meaning')?(cur[1]||''):(cur[2]||''); $('timeNow').innerHTML='<span style="color:#ffd27a;">⏱ Hết giờ</span>'; setCardButtons('next'); afterRecord(); k130ShowEditBar(); if($('goalOn').checked && sessionCount()>=goalTarget()){ setTimeout(finishByGoal,600); } }
function exKey(k){ return optKey()+'\u00a7'+k; }
function isExcluded(k){ return session.excluded && session.excluded.indexOf(exKey(k))>=0; }
function toggleExclude(k){ if(!session.excluded)session.excluded=[]; const e=exKey(k); const i=session.excluded.indexOf(e); if(i>=0) session.excluded.splice(i,1); else session.excluded.push(e); saveSession(); }
function pickAll(inc){ const p=poolForKey(optKey()); if(!session.excluded)session.excluded=[]; p.forEach(function(it){ const e=exKey(it[0]); const i=session.excluded.indexOf(e); if(inc){ if(i>=0)session.excluded.splice(i,1); } else { if(i<0)session.excluded.push(e); } }); saveSession(); renderPickList(); updateCoverage(); refreshMas(); if(phase==='running') nextCard(); }
function _escp(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function _pmatch(it,q){ if(!q)return true; return (it[0]+' '+(it[1]||'')+' '+(it[2]||'')).toLowerCase().indexOf(q)>=0; }
function pickFiltered(inc){ const q=(($('pickSearch')&&$('pickSearch').value)||'').toLowerCase(); const items=poolForKey(optKey()).filter(function(it){return _pmatch(it,q);}); if(!session.excluded)session.excluded=[]; items.forEach(function(it){ const e=exKey(it[0]); const i=session.excluded.indexOf(e); if(inc){ if(i>=0)session.excluded.splice(i,1);} else { if(i<0)session.excluded.push(e);} }); saveSession(); renderPickList(); updateCoverage(); refreshMas(); if(phase==='running') nextCard(); }
function renderPickList(){ const box=$('pickList'); if(!box)return; const q=(($('pickSearch')&&$('pickSearch').value)||'').toLowerCase(); const items=poolForKey(optKey()); const inc=items.filter(function(x){return !isExcluded(x[0]);}).length; const shown=items.filter(function(it){return _pmatch(it,q);}); box.innerHTML='';
  shown.forEach(function(it){ const k=it[0]; const on=!isExcluded(k); const row=document.createElement('div'); row.className='pickrow'+(on?' on':'');
    row.innerHTML='<span class="pchk">'+(on?'\u2713':'')+'</span><span class="pjp">'+_escp(k)+'</span><span class="pinfo"><span class="prd">'+_escp(it[1]||'')+'</span> <span class="pmn">'+_escp(it[2]||'')+'</span></span>';
    row.addEventListener('click',function(){ toggleExclude(k); renderPickList(); updateCoverage(); refreshMas(); if(phase==='running') nextCard(); }); box.appendChild(row); });
  $('pickCount').textContent='Đang luyện '+inc+' / '+items.length+(q?(' · tìm thấy '+shown.length):''); }
function refreshPick(){ if($('pickGrp') && $('pickGrp').open) renderPickList(); }
function renderMasteryLists(){ const items=poolForKey(optKey()); const dB=$('masDoneList'), rB=$('masRemList'); if(!dB)return; dB.innerHTML=''; rB.innerHTML=''; let dn=0, rn=0;
  items.forEach(function(it){ const k=it[0]; if(isExcluded(k)) return; const row=document.createElement('div'); row.className='pickrow on'; row.innerHTML='<span class="pjp">'+_escp(k)+'</span><span class="pinfo"><span class="prd">'+_escp(it[1]||'')+'</span> <span class="pmn">'+_escp(it[2]||'')+'</span></span>';
    if(isSkipped(k)){ dn++; row.addEventListener('click',function(){ unmaster(k); }); dB.appendChild(row); }
    else { rn++; row.addEventListener('click',function(){ masterItem(k); }); rB.appendChild(row); } });
  $('masDoneN').textContent=dn; $('masRemN').textContent=rn; }
function unmaster(k){ if(!session.skip)session.skip=[]; const i=session.skip.indexOf(skipKeyFor(k)); if(i>=0){ session.skip.splice(i,1); saveSession(); } updateCoverage(); renderMasteryLists(); if($('pickGrp')&&$('pickGrp').open)renderPickList(); }
function masterItem(k){ if(!session.skip)session.skip=[]; const sk=skipKeyFor(k); if(session.skip.indexOf(sk)<0) session.skip.push(sk); if(phase==='running') recordCorrectKey(k); saveSession(); updateStats(); updateStreak(); updateCoverage(); renderMasteryLists(); if($('pickGrp')&&$('pickGrp').open) renderPickList(); if(phase==='running' && checkAllMastered()){ finishMastered(); } }
function refreshMas(){ if($('masGrp') && $('masGrp').open) renderMasteryLists(); }
function skipKeyFor(k){ return optKey()+'\u00a7'+k; }
function isSkipped(k){ return session.skip && session.skip.indexOf(skipKeyFor(k))>=0; }
function redoCard(){ if(phase!=='running'||!cur) return; const c=cur; nextCard(c); noCount=true; showFixNote('Làm lại (không tính)'); }
function recordCorrectKey(k){ const ok2=optKey(); if(!session.byOption[ok2]) session.byOption[ok2]={}; const b=session.byOption[ok2]; if(!b[k]) b[k]={r:'',c:0,w:0,t:0,ts:0,tn:0}; b[k].c=(b[k].c||0)+1; session.c=(session.c||0)+1; session.streak=(session.streak||0)+1; if(session.streak>(session.best||0))session.best=session.streak; }
function checkAllMastered(){ const p=poolForKey(optKey()); if(!p.length) return false; for(var i=0;i<p.length;i++){ var k=p[i][0]; if(!isExcluded(k) && !isSkipped(k)) return false; } return true; }
function finishMastered(){ stopSession(); $('timeNow').innerHTML='<span style="color:#6ee7a0;">\u2713 Đã thuộc hết mục này — session đã lưu</span>'; }
function skipCurrent(){ if(phase!=='running'||!cur) return; const sk=skipKeyFor(cur[0]); if(!session.skip) session.skip=[]; if(session.skip.indexOf(sk)<0) session.skip.push(sk); recordCorrectKey(cur[0]); saveSession(); showFixNote('Đã thuộc (\u2713): '+cur[0]); updateStats(); updateStreak(); updateCoverage(); refreshMas(); if($('statBox').style.display!=='none' && $('vSession').value==='cur') refreshStatView(); if(checkAllMastered()){ finishMastered(); return; } if($('goalOn').checked && sessionCount()>=goalTarget()){ finishByGoal(); return; } nextCard(); }
function showFixNote(msg){ const el=$('fixNote'); el.textContent=msg; clearTimeout(el._t); el._t=setTimeout(function(){ el.textContent=''; },1800); }
function fixPrev(){
  if(!lastAction || phase==='idle'){ showFixNote('Chưa có câu để sửa'); return; }
  if(lastAction.field==='w'){ showFixNote('Câu trước đã là Sai'); return; }
  const oa=lastAction;
  if(oa.field==='c') session.c=Math.max(0,session.c-1);
  else if(oa.field==='t') session.to=Math.max(0,(session.to||0)-1);
  session.w++;
  const b=session.byOption[oa.optKey];
  if(b && b[oa.itemKey]){ const it=b[oa.itemKey]; it[oa.field]=Math.max(0,(it[oa.field]||0)-1); it.w=(it.w||0)+1; }
  if(oa.field==='c'){ if((session.streak||0)>0)session.prev=session.streak; session.streak=0; } lastAction.field='w'; saveSession(); updateStats(); updateStreak(); updateCoverage();
  if($('statBox').style.display!=='none' && $('vSession').value==='cur') refreshStatView();
  renderPrev(); showFixNote('Đã sửa "'+oa.itemKey+'" → Sai');
}
function sessionCount(){ return session.c+session.w+(session.to||0); }
function goalTarget(){ let g=parseInt($('goalNum').value,10); if(!g||g<1)g=30; return g; }
function updateGoalProg(){ const el=$('goalProg'); if($('goalOn').checked){ el.textContent=sessionCount()+' / '+goalTarget()+' câu'; } else { el.textContent=''; } }
function checkGoal(){ if($('goalOn').checked && phase!=='idle' && sessionCount()>=goalTarget()){ finishByGoal(); return true; } return false; }
function finishByGoal(){ clearTimer(); const reached=goalTarget(); stopSession(); $('timeNow').innerHTML='<span style="color:#6ee7a0;">\u2713 Đã đạt '+reached+' câu \u2014 session đã lưu</span>'; }
function renderPrev(){
  const p=$('prevPanel');
  if(!lastAction || phase==='idle'){ p.style.display='none'; return; }
  p.style.display='block';
  $('prevKana').textContent=lastAction.itemKey;
  $('prevRomaji').textContent=lastAction.romaji||'';
  let lbl='', col='';
  if(lastAction.field==='c'){ lbl='✓ Bạn chấm: Đúng'; col='#6ee7a0'; }
  else if(lastAction.field==='w'){ lbl='✗ Bạn chấm: Sai'; col='#ff8b8b'; }
  else if(lastAction.field==='t'){ lbl='⏱ Hết giờ'; col='#ffd27a'; }
  const tm=(lastAction.ms!==undefined && lastAction.ms>0)?(' · '+fmt(lastAction.ms)):'';
  const el=$('prevResult'); el.textContent=lbl+tm; el.style.color=col;
}
function _esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function diffHtml(a,b){
  a=a||''; b=b||''; const n=a.length, m=b.length;
  const dp=[]; for(let i=0;i<=n;i++) dp.push(new Array(m+1).fill(0));
  for(let i=n-1;i>=0;i--) for(let j=m-1;j>=0;j--) dp[i][j]= a[i]===b[j]? dp[i+1][j+1]+1 : Math.max(dp[i+1][j],dp[i][j+1]);
  let i=0,j=0; const am=new Array(n).fill(false), bm=new Array(m).fill(false);
  while(i<n&&j<m){ if(a[i]===b[j]){am[i]=true;bm[j]=true;i++;j++;} else if(dp[i+1][j]>=dp[i][j+1]) i++; else j++; }
  let aH='',bH='';
  for(let k=0;k<n;k++){ aH+= am[k]? _esc(a[k]) : '<span style="background:#5a2730;color:#ffd3d3;border-radius:3px;padding:0 1px;">'+_esc(a[k])+'</span>'; }
  for(let k=0;k<m;k++){ bH+= bm[k]? _esc(b[k]) : '<span style="background:#1f4d33;color:#bff5d4;border-radius:3px;padding:0 1px;">'+_esc(b[k])+'</span>'; }
  return {aH:aH||'<span style="color:#888;">(trống)</span>', bH:bH};
}
function normR(s){ return (s||'').toLowerCase().replace(/[^a-z]/g,''); }
function checkRomaji(typed,target){ const t=normR(typed); if(!t)return false; const parts=String(target).split(/[,/]/).map(normR).filter(Boolean); return parts.indexOf(t)>=0; }
function typingSubmit(){
  if(phase!=='running'||revealed||!typingThis) return;
  clearTimer(); revealElapsed=elapsedBefore+(performance.now()-t0);
  const typed=$('typeInput').value; const cmp=cur[4]||cur[0];
  styleAnswer(); showAnsKanji(); $('romaji').style.visibility='visible'; $('wordMeaning').textContent=(curDir==='meaning')?(cur[1]||''):(cur[2]||'');
  $('typeInput').blur(); $('typeInput').style.display='none';
  const d=diffHtml(typed, cmp);
  $('typeDiff').innerHTML='<div style="font-family:Hiragino Sans,Noto Sans JP,sans-serif;"><span style="color:#9aa0a6;font-size:13px;">Bạn gõ:</span> '+d.aH+'</div><div style="font-family:Hiragino Sans,Noto Sans JP,sans-serif;"><span style="color:#9aa0a6;font-size:13px;">Đáp án:</span> '+d.bH+'</div>';
  $('typeDiff').style.display='block';
  $('timeNow').textContent=fmt(revealElapsed);
  revealed=true; setCardButtons('grade'); k130ShowEditBar();
}
function afterRecord(){ updateStats(); updateStreak(); updateCoverage(); updateGoalProg(); renderPrev(); if($('fixBtn')) $('fixBtn').disabled=(phase==='idle'||!lastAction); if($('statBox').style.display!=='none' && $('vSession').value==='cur') refreshStatView(); }
function updateStreak(){ $('streakCur').textContent=session.streak||0; $('streakPrev').textContent=session.prev||0; $('streakBest').textContent=session.best||0; }
function updateStats(){ $('sCorrect').textContent=session.c; $('sWrong').textContent=session.w; $('sTimeout').textContent=session.to||0;
  const t=session.c+session.w+(session.to||0); $('sAcc').textContent=t?Math.round(session.c/t*100)+'%':'–';
  $('sAvg').textContent=session.times.length?fmt(session.times.reduce(function(a,b){return a+b;},0)/session.times.length):'–'; }
function updateCoverage(){ const key=optKey(); const p=poolForKey(key); const b=session.byOption[key]||{}; let seen=0, mast=0, total=0;
  for(let i=0;i<p.length;i++){ const k=p[i][0]; if(isExcluded(k)) continue; total++; const s=b[k]; const sk=isSkipped(k); if(sk) mast++; if((s&&(s.c+s.w+(s.t||0)>0))||sk) seen++; } const pct=total?Math.round(seen/total*100):0;
  $('covVal').textContent=seen+' / '+total+' ('+pct+'%)';
  if($('masVal')){ $('masVal').textContent=mast; $('masRem').textContent=(total-mast); } }

function startSession(){ if(phase!=='idle')return; lastAction=null; phase='running'; updatePhaseUI(); updateGoalProg(); renderPrev(); nextCard(); $('jp').focus(); }
function pauseToggle(){
  if(phase==='running'){
    if(!revealed && !timedOut){ elapsedBefore+=performance.now()-t0; clearTimer(); }
    phase='paused'; updatePhaseUI();
    if(!revealed) $('timeNow').innerHTML='<span style="color:#ffd27a;">⏸ Đã tạm dừng</span>';
  } else if(phase==='paused'){
    phase='running'; updatePhaseUI();
    if(!revealed && !timedOut){ $('timeNow').textContent=''; t0=performance.now(); if($('limitOn').checked) startTimer(limitMs()-elapsedBefore); }
  }
}
function stopSession(){ if(phase==='idle')return; clearTimer(); archiveIfData();
  session={c:0,w:0,to:0,streak:0,best:0,prev:0,skip:[],excluded:[],times:[],byOption:{}}; saveSession();
  phase='idle'; cur=null; revealed=false; timedOut=false; lastAction=null;
  $('kana').textContent='ー'; $('kana').style.fontSize='100px'; $('romaji').style.visibility='hidden'; $('drawWrap').style.display='none'; $('timeNow').textContent='Bấm ▶ Bắt đầu để luyện';
  setCardButtons('none'); updatePhaseUI(); updateStats(); updateCoverage(); updateGoalProg(); renderPrev();
  if($('statBox').style.display!=='none'){ populateSessionSelect(); refreshStatView(); }
}
function archiveIfData(){ if((session.c+session.w+(session.to||0))>0){ const h=loadHist(); const tot=session.c+session.w+(session.to||0); const now=new Date(); const pad=function(x){return (x<10?'0':'')+x;};
  h.push({ date:now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())+' '+pad(now.getHours())+':'+pad(now.getMinutes()),
    c:session.c, w:session.w, to:(session.to||0), best:(session.best||0), acc:Math.round(session.c/tot*100),
    avg:session.times.length?fmt(session.times.reduce(function(a,b){return a+b;},0)/session.times.length):'–',
    byOption: JSON.parse(JSON.stringify(session.byOption)) }); saveHist(h); } }

function getSessionObj(sel){ if(sel==='cur') return session; const h=loadHist(); return h[parseInt(sel,10)]||null; }
function populateSessionSelect(){ const sel=$('vSession'); const prev=sel.value; sel.innerHTML='';
  let o=document.createElement('option'); o.value='cur'; o.textContent='Hiện tại'; sel.appendChild(o);
  const h=loadHist(); h.forEach(function(s,i){ const op=document.createElement('option'); op.value=String(i); op.textContent='#'+(i+1)+' · '+s.date; sel.appendChild(op); });
  if(prev && (prev==='cur'||parseInt(prev,10)<h.length)) sel.value=prev; else sel.value='cur'; }
function populateOptionSelect(){ const sess=getSessionObj($('vSession').value); const sel=$('vOption'); const prev=sel.value; sel.innerHTML='';
  const bo=(sess&&sess.byOption)?sess.byOption:{};
  const ka=Object.keys(bo).filter(function(k){ const b=bo[k]; for(const x in b){ if(b[x].c+b[x].w+(b[x].t||0)>0) return true; } return false; });
  if(!ka.length){ const op=document.createElement('option'); op.value=''; op.textContent='(chưa có dữ liệu)'; sel.appendChild(op); return; }
  const curKey=optKey(); ka.forEach(function(k){ const op=document.createElement('option'); op.value=k; op.textContent=optLabel(k); sel.appendChild(op); });
  if(prev && ka.indexOf(prev)>=0) sel.value=prev; else if(ka.indexOf(curKey)>=0) sel.value=curKey; else sel.value=ka[0]; }
function refreshStatView(){ populateOptionSelect(); renderDist(); }
function renderUnseen(okey, bucket){
  const pl=poolForKey(okey); const total=pl.length;
  const seenSet={}; for(const k in bucket){ if(bucket[k].c+bucket[k].w+(bucket[k].t||0)>0) seenSet[k]=1; }
  const missing=pl.filter(function(it){ return !seenSet[it[0]]; });
  const seen=total-missing.length; const pct=total?Math.round(seen/total*100):0;
  $('distCoverage').textContent='Đã gặp: '+seen+' / '+total+' mục ('+pct+'%)';
  $('distSummary').textContent='Còn '+missing.length+' mục CHƯA gặp:';
  const box=$('distList'); box.innerHTML='';
  if(!missing.length){ const d=document.createElement('div'); d.style.cssText='padding:10px; color:#6ee7a0; font-size:14px;'; d.textContent='✓ Đã gặp hết tất cả mục trong lựa chọn này!'; box.appendChild(d); return; }
  const grid=document.createElement('div'); grid.style.cssText='display:grid; grid-template-columns:repeat(auto-fill,minmax(82px,1fr)); gap:8px;';
  missing.forEach(function(it){ const d=document.createElement('div');
    d.style.cssText='background:#1a1d1f; border:0.5px solid #3a3f43; border-radius:8px; padding:6px 4px; text-align:center;';
    d.innerHTML='<div style="font-size:20px; color:#fff; font-family:Hiragino Sans,Noto Sans JP,sans-serif; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="'+it[0]+'">'+it[0]+'</div><div style="font-size:11px; color:#9aa0a6;">'+it[1]+'</div>';
    grid.appendChild(d); });
  box.appendChild(grid);
}
function renderDist(){ const sess=getSessionObj($('vSession').value); const okey=$('vOption').value; const box=$('distList'); box.innerHTML='';
  if(!okey){ $('distCoverage').textContent=''; $('distSummary').textContent='Chưa có dữ liệu cho lựa chọn này.'; return; }
  const bucket=(sess&&sess.byOption&&sess.byOption[okey])?sess.byOption[okey]:{};
  if(distSort==='unseen'){ renderUnseen(okey, bucket); return; }
  if(!sess||!sess.byOption||!sess.byOption[okey]){ $('distCoverage').textContent=''; $('distSummary').textContent='Chưa có dữ liệu cho lựa chọn này.'; return; }
  const arr=[];
  for(const k in bucket){ const s=bucket[k]; const tt=(s.t||0); const n=s.c+s.w+tt; const tn=(s.tn||0); const avg=tn?(s.ts/tn):0; if(n>0) arr.push({k:k,r:s.r,c:s.c,w:s.w,t:tt,n:n,fr:(s.w+tt)/n,avg:avg,tn:tn}); }
  const total=poolForKey(okey).length; const seen=arr.length; const pct=total?Math.round(seen/total*100):0;
  $('distCoverage').textContent='Đã gặp: '+seen+' / '+total+' mục ('+pct+'%)';
  let lt=0; arr.forEach(function(x){lt+=x.n;}); $('distSummary').textContent='Tổng '+lt+' lượt trên '+seen+' mục đã gặp';
  if(distSort==='count') arr.sort(function(a,b){return b.n-a.n;});
  else if(distSort==='failrate') arr.sort(function(a,b){return b.fr-a.fr || (b.w+b.t)-(a.w+a.t);});
  else if(distSort==='slow') arr.sort(function(a,b){return b.avg-a.avg;});
  else arr.sort(function(a,b){return a.k.localeCompare(b.k,'ja');});
  const maxN=arr.length?Math.max.apply(null,arr.map(function(x){return x.n;})):1;
  arr.forEach(function(x){ const acc=Math.round(x.c/x.n*100); const col=x.fr>=0.5?'#7d3743':(x.fr>0?'#8a6d3b':'#356394');
    const toStr=x.t?(' /<span style="color:#ffd27a;">'+x.t+'⏱</span>'):'';
    const avgStr=x.tn?('<span style="color:#9ecbff; min-width:48px; text-align:right;">'+fmt(x.avg)+'</span>'):'<span style="color:#555; min-width:48px; text-align:right;">–</span>';
    const d=document.createElement('div'); d.className='distrow';
    d.innerHTML='<span style="min-width:60px; font-family:Hiragino Sans,Noto Sans JP,sans-serif; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="'+x.k+'">'+x.k+'</span>'
      +'<div class="distbar" style="width:'+(x.n/maxN*80)+'px; background:'+col+';"></div>'
      +'<span style="color:#9aa0a6; min-width:26px;">'+x.n+'×</span>'
      +avgStr
      +'<span style="margin-left:auto; font-size:12px;"><span style="color:#6ee7a0;">'+x.c+'✓</span>/<span style="color:#ff8b8b;">'+x.w+'✗</span>'+toStr+' · '+acc+'%</span>';
    box.appendChild(d); }); }
function clearAll(){ saveHist([]); lsDel(LS_HIST); session={c:0,w:0,to:0,streak:0,best:0,prev:0,skip:[],excluded:[],times:[],byOption:{}}; saveSession(); lsDel(LS_CUR); lastAction=null;
  updateStats(); updateCoverage(); populateSessionSelect(); refreshStatView(); }

function syncControls(){ const mode=$('mode').value; const isChar=mode==='char'; const isWord=mode==='word'; const isLesson=(mode==='sent'||mode==='lword'); const isKanji=mode==='kanji';
  $('rangeWrap').style.opacity=isChar?'1':'0.4'; $('range').disabled=!isChar;
  $('scriptWrap').style.opacity=(isChar||isWord)?'1':'0.4'; $('script').disabled=!(isChar||isWord);
  $('baiWrap').style.display=isLesson?'block':'none'; $('krowWrap').style.display=isKanji?'block':'none'; $('kgrpWrap').style.display=(mode==='kanji130')?'block':'none'; $('ngrpWrap').style.display=(mode==='number')?'block':'none'; $('lwordFormWrap').style.display=(mode==='lword')?'block':'none'; $('cgrpWrap').style.display=(mode==='counter')?'block':'none'; }
function saveLimit(){ lsSet(LS_LIMIT, JSON.stringify({on:$('limitOn').checked, sec:$('limitSec').value, gon:$('goalOn').checked, gnum:$('goalNum').value, algo:$('algo').value, typing:$('typingOn').checked, practice:$('practiceOn').checked, lwf:$('lwordForm').value})); }

$('tipBtn').addEventListener('click',function(){ const b=$('tipBox'); const show=b.style.display==='none'; b.style.display=show?'block':'none'; $('tipBtn').textContent=show?'? Ẩn gợi ý':'? Gợi ý mốc'; });
$('dir').addEventListener('change',function(){ updateCoverage(); if(phase==='running') nextCard(); else $('drawWrap').style.display='none'; refreshPick(); refreshMas(); });
$('appW').addEventListener('input',function(){ $('appWVal').textContent=this.value+'%'; });
$('appW').addEventListener('change',function(){ setAppWidth(this.value); });
$('clearDraw').addEventListener('click',clearCanvas);
window.addEventListener('resize',function(){ if(_cv) setCanvasSize(_csize); });
document.querySelectorAll('[data-size]').forEach(function(b){ b.addEventListener('click',function(){ setCanvasSize(b.getAttribute('data-size')); }); });
$('penW').addEventListener('input',function(){ _penW=parseInt(this.value,10)||11; $('penWVal').textContent=_penW+'px'; try{lsSet('jp_reader_pen',JSON.stringify({w:_penW,color:_penColor}));}catch(e){} });
$('penColor').addEventListener('input',function(){ _penColor=this.value; try{lsSet('jp_reader_pen',JSON.stringify({w:_penW,color:_penColor}));}catch(e){} });
$('typeInput').addEventListener('keydown',function(e){ if(e.key==='Enter'){ if(e.isComposing||e.keyCode===229) return; e.preventDefault(); if(!revealed) typingSubmit(); } });
$('typingOn').addEventListener('change',function(){ saveLimit(); if(phase==='running') nextCard(); });
$('startBtn').addEventListener('click',startSession);
$('pauseBtn').addEventListener('click',pauseToggle);
$('stopBtn').addEventListener('click',stopSession);
$('primary').addEventListener('click',reveal);
$('correct').addEventListener('click',function(){grade(true);});
$('wrong').addEventListener('click',function(){grade(false);});
$('nextBtn').addEventListener('click',function(){ if(phase==='running') nextCard(); });
$('fixBtn').addEventListener('click',fixPrev);
$('skipBtn').addEventListener('click',skipCurrent);
$('redoBtn').addEventListener('click',redoCard);
$('pickAllBtn').addEventListener('click',function(){pickAll(true);});
$('pickNoneBtn').addEventListener('click',function(){pickAll(false);});
$('pickGrp').addEventListener('toggle',function(){ if($('pickGrp').open) renderPickList(); });
$('masGrp').addEventListener('toggle',function(){ if($('masGrp').open) renderMasteryLists(); });
$('pickInclResBtn').addEventListener('click',function(){pickFiltered(true);});
$('pickExclResBtn').addEventListener('click',function(){pickFiltered(false);});
$('pickSearch').addEventListener('input',renderPickList);
$('statBtn').addEventListener('click',function(){ const b=$('statBox'); const show=b.style.display==='none'; b.style.display=show?'block':'none'; $('statBtn').textContent='Xem thống kê '+(show?'(▴)':'(▾)'); if(show){ populateSessionSelect(); refreshStatView(); } });
$('vSession').addEventListener('change',refreshStatView);
$('vOption').addEventListener('change',renderDist);
$('clearAll').addEventListener('click',clearAll);
document.querySelectorAll('[data-sort]').forEach(function(b){ b.addEventListener('click',function(){ distSort=b.getAttribute('data-sort');
  document.querySelectorAll('[data-sort]').forEach(function(x){x.classList.remove('active');}); b.classList.add('active'); renderDist(); }); });
$('mode').addEventListener('change',function(){syncControls();updateCoverage(); if(phase==='running')nextCard(); refreshPick(); refreshMas();});
$('script').addEventListener('change',function(){updateCoverage(); if(phase==='running')nextCard(); refreshPick(); refreshMas();});
$('range').addEventListener('change',function(){updateCoverage(); if(phase==='running')nextCard(); refreshPick(); refreshMas();});
$('limitOn').addEventListener('change',function(){ saveLimit(); if(phase==='running'&&!revealed&&!timedOut){ t0=performance.now(); startTimer(Math.max(0,limitMs()-elapsedBefore)); } });
$('limitSec').addEventListener('change',saveLimit);
$('goalOn').addEventListener('change',function(){saveLimit();updateGoalProg();});
$('goalNum').addEventListener('change',function(){saveLimit();updateGoalProg();});
$('algo').addEventListener('change',saveLimit);
$('lwordForm').addEventListener('change',function(){ saveLimit(); updateCoverage(); if(phase==='running') nextCard(); refreshPick(); refreshMas(); });
document.querySelectorAll('[data-bai]').forEach(function(b){ b.addEventListener('click',function(){ b.classList.toggle('active'); updateCoverage(); if(phase==='running') nextCard(); refreshPick(); refreshMas(); }); });
document.querySelectorAll('[data-krow]').forEach(function(b){ b.addEventListener('click',function(){ b.classList.toggle('active'); updateCoverage(); if(phase==='running') nextCard(); refreshPick(); refreshMas(); }); });
document.querySelectorAll('[data-kgrp]').forEach(function(b){ b.addEventListener('click',function(){ b.classList.toggle('active'); updateCoverage(); if(phase==='running') nextCard(); refreshPick(); refreshMas(); }); });
$('k130EditBtn').addEventListener('click',k130OpenInline);
$('k130SaveBtn').addEventListener('click',k130SaveInline);
$('k130CancelBtn').addEventListener('click',function(){ $('k130EditBox').style.display='none'; $('k130EditBar').style.display='block'; });
$('k130mIn').addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); k130SaveInline(); } });
$('k130nIn').addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); k130SaveInline(); } });
$('k130Grp').addEventListener('toggle',function(){ if($('k130Grp').open){ renderK130List(); renderK130Hist(); } });
$('k130Search').addEventListener('input',renderK130List);
$('k130EditList').addEventListener('change',function(e){ const t=e.target; if(!t||!t.getAttribute)return; const k=t.getAttribute('data-k'); if(!k)return; if(!(t.className.indexOf('k130mEdit')>=0||t.className.indexOf('k130nEdit')>=0))return; const mEl=$('k130EditList').querySelector('.k130mEdit[data-k="'+k+'"]'); const nEl=$('k130EditList').querySelector('.k130nEdit[data-k="'+k+'"]'); k130Apply(k, mEl?mEl.value:'', nEl?nEl.value:'', false); });
$('k130HistList').addEventListener('click',function(e){ var b=e.target.closest?e.target.closest('[data-hrev]'):null; if(!b)return; k130Revert(b.getAttribute('data-hrev')); });
$('k130ResetBtn').addEventListener('click',k130ResetAll);
document.querySelectorAll('[data-ngrp]').forEach(function(b){ b.addEventListener('click',function(){ b.classList.toggle('active'); updateCoverage(); if(phase==='running') nextCard(); refreshPick(); refreshMas(); }); });
document.querySelectorAll('[data-cgrp]').forEach(function(b){ b.addEventListener('click',function(){ b.classList.toggle('active'); updateCoverage(); if(phase==='running') nextCard(); refreshPick(); refreshMas(); }); });
function renderGram(){ const n=$('gramSel').value; const arr=GRAM[n]||[]; const box=$('gramList'); box.innerHTML=''; arr.forEach(function(g){ const d=document.createElement('div'); d.style.cssText='margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid #2c2f31;'; var h='<div style="color:#cfe6ff; font-weight:600; font-size:14px;">'+g.p+'</div>'; h+='<div style="color:#c8c8c8; font-size:13px; margin-top:4px; line-height:1.5;">'+g.g+'</div>'; if(g.ex){ h+='<div style="margin-top:6px; font-size:13px;"><span style="color:#fff; font-family:Hiragino Sans,Noto Sans JP,sans-serif;">'+g.ex+'</span> <span style="color:#9ecbff;"> '+g.exr+'</span></div>'; h+='<div style="font-size:12px; color:#9aa0a6; margin-top:2px;">'+g.m+'</div>'; } d.innerHTML=h; box.appendChild(d); }); }
$('gramBtn').addEventListener('click',function(){ const b=$('gramBox'); const show=b.style.display==='none'; b.style.display=show?'block':'none'; $('gramBtn').textContent='Ngữ pháp theo bài '+(show?'(▴)':'(▾)'); if(show)renderGram(); });
$('gramSel').addEventListener('change',renderGram);
document.querySelectorAll('.keybtn').forEach(function(btn){ btn.addEventListener('click',function(){
  document.querySelectorAll('.keybtn').forEach(function(b){b.classList.remove('listening');b.textContent='gán';});
  capturing=btn.getAttribute('data-slot'); btn.classList.add('listening'); btn.textContent='nhấn phím…'; $('jp').focus(); }); });
window.addEventListener('keydown',function(e){
  if(capturing){ e.preventDefault(); keys[capturing]=e.code; lsSet(LS_KEYS,JSON.stringify(keys));
    document.querySelectorAll('.keybtn').forEach(function(b){b.classList.remove('listening');b.textContent='gán';}); capturing=null; renderKeyLabels(); return; }
  if(e.target && (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')) return;
  if(typeDone){ if(e.code==='Enter'||e.code===keys.reveal){ e.preventDefault(); nextCard(); } return; }
  if(e.code===keys.start){ e.preventDefault(); if(phase==='idle') startSession(); return; }
  if(e.code===keys.pause){ e.preventDefault(); if(phase==='running'||phase==='paused') pauseToggle(); return; }
  if(e.code===keys.stop){ e.preventDefault(); if(phase!=='idle') stopSession(); return; }
  if(e.code===keys.fix){ e.preventDefault(); fixPrev(); return; }
  if(e.code===keys.clear){ e.preventDefault(); clearCanvas(); return; }
  if(e.code===keys.penup){ e.preventDefault(); changePen(2); return; }
  if(e.code===keys.pendown){ e.preventDefault(); changePen(-2); return; }
  if(e.code===keys.skip){ e.preventDefault(); skipCurrent(); return; }
  if(e.code===keys.redo){ e.preventDefault(); redoCard(); return; }
  if(phase!=='running') return;
  if(timedOut){ if(e.code===keys.reveal||e.code===keys.correct||e.code===keys.wrong){ e.preventDefault(); nextCard(); } return; }
  if(e.code===keys.reveal){ e.preventDefault(); if(!revealed)reveal(); return; }
  if(revealed){ if(e.code===keys.correct){ e.preventDefault(); grade(true); } else if(e.code===keys.wrong){ e.preventDefault(); grade(false); } }
});
(function(){ const s=lsGet(LS_LIMIT); if(s){ try{ const o=JSON.parse(s); $('limitOn').checked=!!o.on; if(o.sec)$('limitSec').value=o.sec; $('goalOn').checked=!!o.gon; if(o.gnum)$('goalNum').value=o.gnum; if(o.algo)$('algo').value=o.algo; $('typingOn').checked=!!o.typing; $('practiceOn').checked=!!o.practice; if(o.lwf)$('lwordForm').value=o.lwf; }catch(e){} } })();
(function(){ try{ const s=lsGet('jp_reader_appw'); setAppWidth(s?s:70); }catch(e){ setAppWidth(70); } })();
initCanvas(); renderKeyLabels(); loadK130E(); syncControls(); updateStats(); updateStreak(); updateCoverage(); updateGoalProg(); updatePhaseUI(); renderPrev();
