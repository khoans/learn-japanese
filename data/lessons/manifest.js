// TU DONG SINH boi tools/build-lessons.ps1 -- DUNG SUA TAY.
// Danh sach trinh do va so bai moi trinh do. Ca trang HTML lan service worker (sw.js)
// deu doc, nen them bai/trinh do KHONG con phai sua file HTML hay sw.js nua.
(function (g) {
  g.LEVELS = ["N5"];
  g.LESSON_MANIFEST = {
    "N5": [1, 2, 3, 4, 5, 6, 7]
  };
  g.LESSON_NUMS = [1, 2, 3, 4, 5, 6, 7]; // gop phang (tuong thich cu)
})(typeof window !== 'undefined' ? window : self);