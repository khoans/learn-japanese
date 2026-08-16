// ============================================================
//  Lesson registry  (load file nay TRUOC tat ca cac file bai)
//  Moi file bai goi:  registerLesson(giao_trinh, trinh_do, so_bai, { words, ... }, phan?)
//  App goi:           JPLessons.words() / .sentences() / .grammar() / .nums()
//                     .courses() / .levelsOf(course) / .lessonsOf(course, level) / .lidsOf(course)
//
//  KHOA BAI ("lid") = "<GIAO_TRINH>:<so_bai><PHAN>", vd "MINNA:3", "GUNGUN:1A".
//  Vi hai giao trinh deu danh so bai tu 1 nen MOI cho dung so bai lam khoa (ngu phap,
//  bai doc, hoi thoai, khoa bo de) deu phai dung lid, khong dung so bai tran.
//
//  PHAN (A/B/C...): giao trinh Gungun chia moi CHUONG thanh nhieu PHAN, moi phan co tu
//  vung + ngu phap rieng -> moi phan la MOT don vi hoc doc lap (lid rieng). Bai khong
//  chia phan thi phan = '' (Minna).
// ============================================================
(function (global) {
  var LESSONS = [];   // [{ course, level, num, part, lid, words, sentences, grammar }, ...]

  // Thong tin giao trinh do manifest.js dat san (g.COURSES). Giao trinh khong khai bao
  // trong courses.csv van chay duoc: ten = id, don vi bai = "Bài".
  function courseMeta(id) {
    var list = global.COURSES || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return { id: id, ten: id, tenNgan: id, donvi: 'Bài' };
  }

  function registerLesson(course, level, num, data, part) {
    // Tuong thich nguoc:
    //   registerLesson(num, data)               -> MINNA / N5
    //   registerLesson(level, num, data)        -> MINNA
    if (typeof course === 'number') { data = level; num = course; level = 'N5'; course = 'MINNA'; }
    else if (typeof level === 'number') { data = num; num = level; level = course; course = 'MINNA'; }
    data = data || {};
    part = (part == null ? '' : String(part).toUpperCase());
    LESSONS.push({
      course: course,
      level: level,
      num: num,
      part: part,
      lid: course + ':' + num + part,
      words:     data.words     || [],
      sentences: data.sentences || [],
      grammar:   data.grammar   || [],
      readings:      data.readings      || [],
      conversations: data.conversations || []
    });
  }

  // N5 (de) -> N1 (kho); ten khac dua xuong cuoi.
  function levelRank(lv) {
    var m = /^N(\d+)$/.exec(lv);
    return m ? -parseInt(m[1], 10) : 100;
  }
  // Thu tu giao trinh: theo dung thu tu trong manifest (courses.csv), la khac dua xuong cuoi.
  function courseRank(id) {
    var list = global.COURSES || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return i;
    return 999;
  }

  // Danh sach giao trinh THUC SU co bai, theo thu tu manifest.
  function courses() {
    var seen = {}, out = [];
    LESSONS.forEach(function (L) { if (!seen[L.course]) { seen[L.course] = true; out.push(L.course); } });
    out.sort(function (a, b) { return courseRank(a) - courseRank(b) || (a < b ? -1 : a > b ? 1 : 0); });
    return out.map(courseMeta);
  }
  function courseName(id)  { return courseMeta(id).ten; }
  function courseShort(id) { var m = courseMeta(id); return m.tenNgan || m.ten; }
  function unitLabel(id)   { return courseMeta(id).donvi || 'Bài'; }

  // "MINNA:3" -> { course:"MINNA", num:3, part:"" } ; "GUNGUN:1A" -> { ..., part:"A" }
  function parseLid(lid) {
    var s = String(lid == null ? '' : lid), i = s.indexOf(':');
    var course = 'MINNA', rest = s;
    if (i >= 0) { course = s.slice(0, i); rest = s.slice(i + 1); }   // khong co ":" = khoa cu (chi so bai)
    var m = /^(\d+)(.*)$/.exec(rest) || [];
    return { course: course, num: parseInt(m[1], 10), part: (m[2] || '').toUpperCase() };
  }
  /** Nhan ngan: "Bài 3" / "Chương 1 · Phần A". */
  function lessonLabel(lid) {
    var p = parseLid(lid);
    return unitLabel(p.course) + ' ' + p.num + (p.part ? ' · Phần ' + p.part : '');
  }
  /** Nhan day du kem ten giao trinh: "Minna · Bài 3" / "Gungun · Chương 1 · Phần A". */
  function lessonLabelFull(lid) {
    var p = parseLid(lid);
    return courseShort(p.course) + ' · ' + lessonLabel(lid);
  }
  /** Nhan cuc gon cho nut chon: "3" / "1A". */
  function lessonShort(lid) {
    var p = parseLid(lid);
    return p.num + p.part;
  }

  function levels() {   // gop tat ca giao trinh (tuong thich cu)
    var seen = {}, out = [];
    LESSONS.forEach(function (L) { if (!seen[L.level]) { seen[L.level] = true; out.push(L.level); } });
    return out.sort(function (a, b) { return levelRank(a) - levelRank(b) || (a < b ? -1 : a > b ? 1 : 0); });
  }
  function levelsOf(course) {
    var seen = {}, out = [];
    LESSONS.forEach(function (L) {
      if (L.course === course && !seen[L.level]) { seen[L.level] = true; out.push(L.level); }
    });
    return out.sort(function (a, b) { return levelRank(a) - levelRank(b) || (a < b ? -1 : a > b ? 1 : 0); });
  }

  // Cac bai theo dung thu tu giao trinh -> trinh do -> so bai -> phan (A, B, C...).
  function ordered() {
    return LESSONS.slice().sort(function (a, b) {
      return courseRank(a.course) - courseRank(b.course)
        || levelRank(a.level) - levelRank(b.level)
        || a.num - b.num
        || (a.part < b.part ? -1 : a.part > b.part ? 1 : 0);
    });
  }

  /** Cac bai (ke ca tung PHAN) cua mot giao trinh: [{lid, num, part, level}, ...] dung thu tu. */
  function lessonsOf(course, level) {
    return ordered().filter(function (L) { return L.course === course && (!level || L.level === level); })
      .map(function (L) { return { lid: L.lid, num: L.num, part: L.part, level: L.level }; });
  }

  /** So bai/chuong (KHONG lap lai khi chuong co nhieu phan) cua mot giao trinh. */
  function numsOf(course, level) {
    var seen = {}, out = [];
    ordered().forEach(function (L) {
      if (L.course !== course || (level && L.level !== level)) return;
      if (!seen[L.num]) { seen[L.num] = true; out.push(L.num); }
    });
    return out;
  }
  /** Khoa bai ("MINNA:1"...) cua mot giao trinh, theo thu tu trinh do roi so bai. */
  function lidsOf(course, level) {
    return ordered().filter(function (L) { return L.course === course && (!level || L.level === level); })
      .map(function (L) { return L.lid; });
  }
  /** TAT CA khoa bai cua moi giao trinh, dung thu tu. */
  function lids() {
    return ordered().map(function (L) { return L.lid; });
  }

  // Gop phang tat ca so bai (tuong thich cu - KHONG phan biet giao trinh).
  function nums() {
    var s = {}, out = [];
    LESSONS.forEach(function (L) { if (!s[L.num]) { s[L.num] = true; out.push(L.num); } });
    return out.sort(function (a, b) { return a - b; });
  }

  // -> [[display, romaji, lesson, meaning, kana, level, phuluc, course, lid], ...]
  //    [5]=level, [6]=1 neu la tu PHU LUC (tham khao, khong bat buoc thuoc) / 0 neu tu chinh,
  //    [7]=giao trinh, [8]=khoa bai "GIAOTRINH:so".
  function words() {
    var out = [];
    ordered().forEach(function (L) {
      L.words.forEach(function (w) {
        out.push([w[0], w[1], L.num, (w[2] != null ? w[2] : ''), (w[3] != null ? w[3] : w[0]), L.level, (w[4] ? 1 : 0), L.course, L.lid]);
      });
    });
    return out;
  }

  // -> [[jp, romaji, lesson, meaning, level, course, lid], ...]  ([4]=level, [5]=giao trinh, [6]=lid)
  function sentences() {
    var out = [];
    ordered().forEach(function (L) {
      L.sentences.forEach(function (s) {
        out.push([s[0], s[1], L.num, (s[2] != null ? s[2] : ''), L.level, L.course, L.lid]);
      });
    });
    return out;
  }

  // -> { "MINNA:1": [ {p,g,ex,exr,m}, ... ], ... }  (khoa theo LID, khong phai so bai)
  function grammar() {
    var out = {};
    ordered().forEach(function (L) {
      if (L.grammar && L.grammar.length) out[L.lid] = (out[L.lid] || []).concat(L.grammar);
    });
    return out;
  }

  // Bai doc hieu / hoi thoai -> { "MINNA:1": [ {t,jp,vi,q,course,level,bai,lid}, ... ], ... }
  function byLid(field) {
    var out = {};
    ordered().forEach(function (L) {
      var rows = L[field];
      if (!rows || !rows.length) return;
      out[L.lid] = (out[L.lid] || []).concat(rows.map(function (r) {
        var o = {};
        for (var k in r) if (Object.prototype.hasOwnProperty.call(r, k)) o[k] = r[k];
        o.bai = L.num; o.phan = L.part; o.level = L.level; o.course = L.course; o.lid = L.lid;
        return o;
      }));
    });
    return out;
  }
  function readings()      { return byLid('readings'); }
  function conversations() { return byLid('conversations'); }

  global.registerLesson = registerLesson;             // tien cho cac file bai
  global.JPLessons = {
    register: registerLesson,
    nums: nums, words: words, sentences: sentences, grammar: grammar,
    readings: readings, conversations: conversations,
    levels: levels, levelsOf: levelsOf, numsOf: numsOf, lessonsOf: lessonsOf,
    courses: courses, courseName: courseName, courseShort: courseShort, unitLabel: unitLabel,
    lids: lids, lidsOf: lidsOf, parseLid: parseLid,
    lessonLabel: lessonLabel, lessonLabelFull: lessonLabelFull, lessonShort: lessonShort,
    _raw: LESSONS
  };
})(window);
