// ============================================================
//  Lesson registry  (load file nay TRUOC tat ca cac file bai)
//  Moi file bai goi:  registerLesson(so_bai, { words, sentences, grammar })
//  App goi:           JPLessons.words() / .sentences() / .grammar() / .nums()
// ============================================================
(function (global) {
  var LESSONS = {};               // so_bai -> { words, sentences, grammar }

  function registerLesson(num, data) {
    data = data || {};
    LESSONS[num] = {
      words:     data.words     || [],
      sentences: data.sentences || [],
      grammar:   data.grammar   || []
    };
  }

  function nums() {
    return Object.keys(LESSONS).map(Number).sort(function (a, b) { return a - b; });
  }

  // -> [[display, romaji, lesson, meaning, hiragana], ...]  (dung format ma app can)
  function words() {
    var out = [];
    nums().forEach(function (n) {
      LESSONS[n].words.forEach(function (w) {
        out.push([w[0], w[1], n, (w[2] != null ? w[2] : ''), (w[3] != null ? w[3] : w[0])]);
      });
    });
    return out;
  }

  // -> [[jp, romaji, lesson, meaning], ...]
  function sentences() {
    var out = [];
    nums().forEach(function (n) {
      LESSONS[n].sentences.forEach(function (s) {
        out.push([s[0], s[1], n, (s[2] != null ? s[2] : '')]);
      });
    });
    return out;
  }

  // -> { "1": [ {p,g,ex,exr,m}, ... ], ... }
  function grammar() {
    var out = {};
    nums().forEach(function (n) {
      if (LESSONS[n].grammar && LESSONS[n].grammar.length) out[String(n)] = LESSONS[n].grammar;
    });
    return out;
  }

  global.registerLesson = registerLesson;             // tien cho cac file bai
  global.JPLessons = {
    register: registerLesson,
    nums: nums, words: words, sentences: sentences, grammar: grammar,
    _raw: LESSONS
  };
})(window);
