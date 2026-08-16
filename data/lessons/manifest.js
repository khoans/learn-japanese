// TU DONG SINH boi tools/build-lessons.ps1 -- DUNG SUA TAY.
// Danh sach GIAO TRINH -> TRINH DO -> so bai. Ca trang HTML lan service worker (sw.js)
// deu doc, nen them bai/trinh do/giao trinh KHONG con phai sua file HTML hay sw.js nua.
(function (g) {
  // Giao trinh: id (= ten thu muc), ten hien thi, ten ngan (badge), don vi bai ("Bài"/"Chương").
  g.COURSES = [
    { id: "MINNA", ten: "Minna no Nihongo", tenNgan: "Minna", donvi: "Bài" },
    { id: "GUNGUN", ten: "Gungun", tenNgan: "Gungun", donvi: "Chương" }
  ];
  g.LESSON_MANIFEST = {
    "MINNA": {
      "N5": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17"]
    },
    "GUNGUN": {
      "N5": ["1A", "1B", "1C"]
    }
  };
  // Duong dan cac file bai (tuong doi voi data/lessons/) - loader va sw.js dung truc tiep.
  g.LESSON_FILES = [
    "MINNA/N5/lesson-01.js",
    "MINNA/N5/lesson-02.js",
    "MINNA/N5/lesson-03.js",
    "MINNA/N5/lesson-04.js",
    "MINNA/N5/lesson-05.js",
    "MINNA/N5/lesson-06.js",
    "MINNA/N5/lesson-07.js",
    "MINNA/N5/lesson-08.js",
    "MINNA/N5/lesson-09.js",
    "MINNA/N5/lesson-10.js",
    "MINNA/N5/lesson-11.js",
    "MINNA/N5/lesson-12.js",
    "MINNA/N5/lesson-13.js",
    "MINNA/N5/lesson-14.js",
    "MINNA/N5/lesson-15.js",
    "MINNA/N5/lesson-16.js",
    "MINNA/N5/lesson-17.js",
    "GUNGUN/N5/lesson-01A.js",
    "GUNGUN/N5/lesson-01B.js",
    "GUNGUN/N5/lesson-01C.js"
  ];
  g.LEVELS = ["N5"];        // gop tat ca giao trinh (tuong thich cu)
  g.LESSON_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];   // gop phang (tuong thich cu)
})(typeof window !== 'undefined' ? window : self);