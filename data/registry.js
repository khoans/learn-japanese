// ============================================================
//  Lesson registry  (load file nay TRUOC tat ca cac file bai)
//  Moi file bai goi:  registerLesson(trinh_do, so_bai, { words, sentences, grammar })
//  App goi:           JPLessons.words() / .sentences() / .grammar() / .nums()
//                     .levels() / .numsOf(level)
// ============================================================
(function (global) {
  var LESSONS = [];   // [{ level, num, words, sentences, grammar }, ...]

  function registerLesson(level, num, data) {
    // Tuong thich nguoc: neu goi kieu cu registerLesson(num, data) thi coi la N5.
    if (typeof level === 'number') { data = num; num = level; level = 'N5'; }
    data = data || {};
    LESSONS.push({
      level: level,
      num: num,
      words:     data.words     || [],
      sentences: data.sentences || [],
      grammar:   data.grammar   || []
    });
  }

  // N5 (de) -> N1 (kho); ten khac dua xuong cuoi.
  function levelRank(lv) {
    var m = /^N(\d+)$/.exec(lv);
    return m ? -parseInt(m[1], 10) : 100;
  }
  function levels() {
    var seen = {}, out = [];
    LESSONS.forEach(function (L) { if (!seen[L.level]) { seen[L.level] = true; out.push(L.level); } });
    return out.sort(function (a, b) { return levelRank(a) - levelRank(b) || (a < b ? -1 : a > b ? 1 : 0); });
  }

  // Cac bai theo dung thu tu trinh do roi so bai (dung cho vong lap noi bo).
  function ordered() {
    var byLevel = {};
    LESSONS.forEach(function (L) { (byLevel[L.level] = byLevel[L.level] || []).push(L); });
    var out = [];
    levels().forEach(function (lv) {
      byLevel[lv].sort(function (a, b) { return a.num - b.num; }).forEach(function (L) { out.push(L); });
    });
    return out;
  }

  function numsOf(level) {
    return LESSONS.filter(function (L) { return L.level === level; })
      .map(function (L) { return L.num; })
      .sort(function (a, b) { return a - b; });
  }

  // Gop phang tat ca so bai (tuong thich phan app hien chi 1 trinh do).
  function nums() {
    var s = {}, out = [];
    LESSONS.forEach(function (L) { if (!s[L.num]) { s[L.num] = true; out.push(L.num); } });
    return out.sort(function (a, b) { return a - b; });
  }

  // -> [[display, romaji, lesson, meaning, kana, level], ...]  (dung format ma app can; [5]=level)
  function words() {
    var out = [];
    ordered().forEach(function (L) {
      L.words.forEach(function (w) {
        out.push([w[0], w[1], L.num, (w[2] != null ? w[2] : ''), (w[3] != null ? w[3] : w[0]), L.level]);
      });
    });
    return out;
  }

  // -> [[jp, romaji, lesson, meaning, level], ...]  ([4]=level)
  function sentences() {
    var out = [];
    ordered().forEach(function (L) {
      L.sentences.forEach(function (s) {
        out.push([s[0], s[1], L.num, (s[2] != null ? s[2] : ''), L.level]);
      });
    });
    return out;
  }

  // -> { "1": [ {p,g,ex,exr,m}, ... ], ... }  (khoa theo so bai; hien app chi 1 trinh do)
  function grammar() {
    var out = {};
    ordered().forEach(function (L) {
      if (L.grammar && L.grammar.length) out[String(L.num)] = L.grammar;
    });
    return out;
  }

  global.registerLesson = registerLesson;             // tien cho cac file bai
  global.JPLessons = {
    register: registerLesson,
    nums: nums, words: words, sentences: sentences, grammar: grammar,
    levels: levels, numsOf: numsOf,
    _raw: LESSONS
  };
})(window);
