<#
  build-lessons.ps1  —  Sinh du lieu bai hoc tu CSV.

  DANH CHO NGUOI BIEN SOAN (khong can biet lap trinh):
    1. Vao  data\lessons\csv\<GIAO_TRINH>\<TRINH_DO>\lesson-NN\
       (vi du: csv\MINNA\N5\lesson-07\  hoac  csv\GUNGUN\N5\lesson-01\),
       mo cac file  words.csv / sentences.csv / grammar.csv  bang Excel / Google Sheets.
    2. Them / sua tu vung, cau, ngu phap. Luu lai (giu dinh dang CSV, ma UTF-8).
       - Them BAI moi: chep ca thu muc mau  csv\_TEMPLATE\  thanh
         csv\MINNA\N5\lesson-08\  (dat dung giao trinh + trinh do + so bai) roi dien vao.
       - Them TRINH DO moi (N4, N3...): tao thu muc  csv\MINNA\N4\  roi bo cac lesson-NN vao.
       - Them GIAO TRINH moi: tao thu muc  csv\<TEN_MA>\<TRINH_DO>\lesson-NN\  va
         them 1 dong vao  csv\courses.csv  (id, ten, ten_ngan, donvi, thutu).
         "donvi" = cach goi mot bai tren giao dien: "Bài" (Minna) hay "Chương" (Gungun).
    3. Chay file nay: chuot phai -> "Run with PowerShell"
       (hoac:  ./tools/build-lessons.ps1 ).
    4. Xong! Mo lai app, bai moi tu dong hien ra. Khong sua file HTML nao ca.

  Cot (dong tieu de) trong CSV:
    words.csv     : tiengNhat, romaji, nghia, kana, phuluc (cot phuluc KHONG bat buoc:
                    dien 1 / x neu do la tu PHU LUC - tham khao, khong bat buoc thuoc;
                    de trong neu la tu chinh cua bai)
    sentences.csv : cau, romaji, nghia
    grammar.csv   : mau_cau, giai_thich, vi_du, vi_du_romaji, nghia
    reading.csv   : tieu_de, doan_van, nghia, cau_hoi1, dap_an1, ... cau_hoi3, dap_an3
                    (doan_van = bai doc, TACH TUNG CAU bang dau  |  ; nghia = ban dich
                     tieng Viet, cung tach bang  |  theo DUNG thu tu cau. Cot cau hoi
                     KHONG bat buoc, toi da 3 cau hoi moi bai doc.)
    conversation.csv : tieu_de, boi_canh, hoi_thoai, nghia
                    (hoi_thoai = tung luot noi tach bang  |  , moi luot ghi
                     "TenNguoi：cau noi"; nghia = ban dich, tach bang  |  theo dung
                     thu tu luot noi. boi_canh = mo ta tinh huong bang tieng Viet.)

  Script sinh:  data\lessons\<GIAO_TRINH>\<TRINH_DO>\lesson-NN.js  va  data\lessons\manifest.js
  va tu tang so phien ban cache trong  sw.js .
#>

$ErrorActionPreference = 'Stop'

$Root   = Split-Path -Parent $PSScriptRoot
$LDir   = Join-Path $Root 'data\lessons'
$CsvDir = Join-Path $LDir 'csv'
if (-not (Test-Path $CsvDir)) { throw "Khong tim thay thu muc CSV: $CsvDir" }

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Esc([object]$v) {
  if ($null -eq $v) { $v = '' }
  $s = [string]$v
  $s = $s.Replace('\', '\\').Replace('"', '\"').Replace("`r", '').Replace("`n", '\n').Replace("`t", '\t')
  return '"' + $s + '"'
}
function ImportCsvSafe($path) {
  if (Test-Path $path) { return @(Import-Csv -Path $path -Encoding utf8) }
  return @()
}
# Xep trinh do: N5 (de) -> N1 (kho); cac ten khac dua xuong cuoi.
function LevelRank([string]$lv) {
  if ($lv -match '^N(\d+)$') { return -[int]$Matches[1] } # N5 => -5 (dung truoc), N1 => -1
  return 100
}
# Lay gia tri mot cot CSV an toan (cot co the khong ton tai trong file cu).
function Col($row, [string]$name) {
  if ($row.PSObject.Properties[$name]) { return [string]$row.$name }
  return ''
}

# --- Danh sach GIAO TRINH (csv\courses.csv) ---
# Moi giao trinh la MOT thu muc con cua csv\ (tru _TEMPLATE / themes). courses.csv chi bo
# sung ten hien thi + cach goi don vi bai; thieu dong nao thi lay mac dinh (ten = id, "Bài").
$coursesCsv = Join-Path $CsvDir 'courses.csv'
$courseMeta = [ordered]@{}
if (Test-Path $coursesCsv) {
  foreach ($c in @(Import-Csv -Path $coursesCsv -Encoding utf8)) {
    $cid = ([string]$c.id).Trim()
    if (-not $cid) { continue }
    $ord = 0; [void][int]::TryParse(([string]$c.thutu).Trim(), [ref]$ord)
    $courseMeta[$cid] = @{
      ten     = $(if ([string]::IsNullOrWhiteSpace($c.ten)) { $cid } else { ([string]$c.ten).Trim() })
      tenNgan = $(if ([string]::IsNullOrWhiteSpace((Col $c 'ten_ngan'))) { '' } else { ((Col $c 'ten_ngan')).Trim() })
      donvi   = $(if ([string]::IsNullOrWhiteSpace((Col $c 'donvi'))) { 'Bài' } else { ((Col $c 'donvi')).Trim() })
      thutu   = $ord
    }
  }
}
function CourseRank([string]$id) {
  if ($courseMeta.Contains($id)) { return [int]$courseMeta[$id].thutu }
  return 999
}

# --- Thu thap: giao trinh -> trinh do -> danh sach so bai (theo thu tu) ---
$courseDirs = Get-ChildItem -Path $CsvDir -Directory | Where-Object { $_.Name -ne '_TEMPLATE' -and $_.Name -ne 'themes' }
$courses = $courseDirs | Sort-Object @{ Expression = { CourseRank $_.Name } }, Name
if ($courses.Count -eq 0) { throw "Khong thay thu muc giao trinh nao trong $CsvDir (vi du: csv\MINNA\N5\)" }

$manifest = [ordered]@{}   # giao trinh -> (trinh do -> mang so bai)
$lessonFiles = @()         # duong dan tuong doi cac file .js sinh ra (cho loader + service worker)
$totW = 0; $totS = 0; $totG = 0; $totR = 0; $totC = 0
$totLessons = 0

foreach ($cDir in $courses) {
 $course = $cDir.Name
 $levels = Get-ChildItem -Path $cDir.FullName -Directory | Sort-Object @{ Expression = { LevelRank $_.Name } }, Name
 $byLevel = [ordered]@{}

 foreach ($lvDir in $levels) {
  $level = $lvDir.Name
  # Ten thu muc bai:  lesson-01        (bai/chuong khong chia phan)
  #                   lesson-01A       (PHAN A cua chuong 1 - giao trinh Gungun)
  $lessonDirs = Get-ChildItem -Path $lvDir.FullName -Directory |
    Where-Object { $_.Name -match '^lesson-(\d+)([A-Za-z0-9]*)$' } |
    Sort-Object @{ Expression = { [int]([regex]::Match($_.Name, '^lesson-(\d+)').Groups[1].Value) } },
                @{ Expression = { ([regex]::Match($_.Name, '^lesson-\d+(.*)$').Groups[1].Value).ToUpper() } }
  if ($lessonDirs.Count -eq 0) { continue }

  $outDir = Join-Path $LDir (Join-Path $course $level)
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null
  $nums = @()

  foreach ($lessonDir in $lessonDirs) {
    $num  = [int]([regex]::Match($lessonDir.Name, '^lesson-(\d+)').Groups[1].Value)
    $part = ([regex]::Match($lessonDir.Name, '^lesson-\d+(.*)$').Groups[1].Value).ToUpper()
    $nn   = ('{0:D2}' -f $num) + $part
    $nums += ('"' + $num + $part + '"')

    $words     = ImportCsvSafe (Join-Path $lessonDir.FullName 'words.csv')
    $sentences = ImportCsvSafe (Join-Path $lessonDir.FullName 'sentences.csv')
    $grammar   = ImportCsvSafe (Join-Path $lessonDir.FullName 'grammar.csv')
    $readings  = ImportCsvSafe (Join-Path $lessonDir.FullName 'reading.csv')
    $convs     = ImportCsvSafe (Join-Path $lessonDir.FullName 'conversation.csv')

    $wLines = foreach ($r in $words) {
      $kana = if ([string]::IsNullOrWhiteSpace($r.kana)) { $r.tiengNhat } else { $r.kana }
      # Cot "phuluc" khong bat buoc: co gia tri (1/x/co...) => danh dau tu PHU LUC (tham khao).
      $pl = ''
      if ($r.PSObject.Properties['phuluc'] -and -not [string]::IsNullOrWhiteSpace($r.phuluc)) { $pl = ', 1' }
      '    [' + (Esc $r.tiengNhat) + ', ' + (Esc $r.romaji) + ', ' + (Esc $r.nghia) + ', ' + (Esc $kana) + $pl + ']'
    }
    $sLines = foreach ($r in $sentences) {
      '    [' + (Esc $r.cau) + ', ' + (Esc $r.romaji) + ', ' + (Esc $r.nghia) + ']'
    }
    # CSV dung ten cot tieng Viet cho de doc; ben trong app van dung khoa p/g/ex/exr/m.
    $gLines = foreach ($r in $grammar) {
      '    {"p": ' + (Esc $r.mau_cau) + ', "g": ' + (Esc $r.giai_thich) + ', "ex": ' + (Esc $r.vi_du) + ', "exr": ' + (Esc $r.vi_du_romaji) + ', "m": ' + (Esc $r.nghia) + '}'
    }
    # Bai doc hieu: cau van / ban dich tach bang "|", kem toi da 3 cau hoi.
    $rdLines = foreach ($r in $readings) {
      $qs = @()
      foreach ($i in 1, 2, 3) {
        $q = (Col $r "cau_hoi$i").Trim()
        if ($q) { $qs += '[' + (Esc $q) + ', ' + (Esc (Col $r "dap_an$i")) + ']' }
      }
      '    {"t": ' + (Esc $r.tieu_de) + ', "jp": ' + (Esc $r.doan_van) + ', "vi": ' + (Esc $r.nghia) + ', "q": [' + ($qs -join ', ') + ']}'
    }
    # Hoi thoai: tung luot noi tach bang "|", moi luot "TenNguoi：cau noi".
    $cvLines = foreach ($r in $convs) {
      '    {"t": ' + (Esc $r.tieu_de) + ', "s": ' + (Esc (Col $r 'boi_canh')) + ', "jp": ' + (Esc $r.hoi_thoai) + ', "vi": ' + (Esc $r.nghia) + '}'
    }

    $partArg = if ($part) { ', "' + $part + '"' } else { '' }
    $partTxt = if ($part) { " - Phan $part" } else { '' }
    $js = @"
// ===== $course - $level - Bai $num$partTxt =====
// TU DONG SINH tu  data/lessons/csv/$course/$level/lesson-$nn/*.csv  boi  tools/build-lessons.ps1
// DUNG SUA TRUC TIEP FILE NAY -- moi thay doi se bi ghi de. Hay sua CSV roi chay lai script.
// words: [ chu_hien_thi, romaji, nghia_tiengviet, kana, (1 = tu phu luc) ]
// sentences: [ cau_nhat, romaji, nghia_tiengviet ]
// grammar: { p: mau_cau, g: giai_thich, ex: vi_du, exr: vi_du_romaji, m: nghia }
// readings: { t: tieu_de, jp: cau|cau|..., vi: nghia|nghia|..., q: [[cau_hoi, dap_an], ...] }
// conversations: { t: tieu_de, s: boi_canh, jp: luot|luot|..., vi: nghia|nghia|... }
// Tham so cuoi (neu co) = PHAN cua chuong, vd "A".
registerLesson("$course", "$level", $num, {
  words: [
$($wLines -join ",`r`n")
  ],
  sentences: [
$($sLines -join ",`r`n")
  ],
  grammar: [
$($gLines -join ",`r`n")
  ],
  readings: [
$($rdLines -join ",`r`n")
  ],
  conversations: [
$($cvLines -join ",`r`n")
  ]
}$partArg);
"@
    [System.IO.File]::WriteAllText((Join-Path $outDir "lesson-$nn.js"), $js, $Utf8NoBom)
    $lessonFiles += "$course/$level/lesson-$nn.js"
    $totW += $words.Count; $totS += $sentences.Count; $totG += $grammar.Count
    $totR += $readings.Count; $totC += $convs.Count; $totLessons++
    Write-Host ("{0}/{1}/lesson-{2}: {3} tu, {4} cau, {5} ngu phap, {6} bai doc, {7} hoi thoai" -f $course, $level, $nn, $words.Count, $sentences.Count, $grammar.Count, $readings.Count, $convs.Count)
  }
  $byLevel[$level] = $nums
 }
 if ($byLevel.Count -gt 0) { $manifest[$course] = $byLevel }
 else { Write-Host ("{0}: chua co bai nao (bo qua)" -f $course) -ForegroundColor Yellow }
}

# --- Don file/thu muc "mo coi" (CSV da bi xoa) -> CSV la nguon duy nhat ---
# Xoa sach moi thu muc sinh ra roi giu lai dung nhung file vua ghi o tren.
$keepFiles = @{}; foreach ($f in $lessonFiles) { $keepFiles[(Join-Path $LDir ($f -replace '/', '\'))] = $true }
Get-ChildItem -Path $LDir -Directory | Where-Object { $_.Name -ne 'csv' } | ForEach-Object {
  Get-ChildItem -Path $_.FullName -Recurse -Filter 'lesson-*.js' -File | ForEach-Object {
    if (-not $keepFiles[$_.FullName]) {
      Remove-Item $_.FullName -Force
      Write-Host ("Da xoa (khong con CSV): {0}" -f $_.FullName.Substring($LDir.Length + 1)) -ForegroundColor Yellow
    }
  }
  # Don thu muc rong con lai (trinh do / giao trinh da bi xoa khoi CSV).
  Get-ChildItem -Path $_.FullName -Recurse -Directory | Sort-Object { $_.FullName.Length } -Descending | ForEach-Object {
    if (-not (Get-ChildItem -Path $_.FullName -Force)) { Remove-Item $_.FullName -Force }
  }
  if (-not (Get-ChildItem -Path $_.FullName -Force)) {
    Remove-Item $_.FullName -Force
    Write-Host ("Da xoa giao trinh (khong con CSV): {0}" -f $_.Name) -ForegroundColor Yellow
  }
}

# --- Sinh data/radicals.js tu csv/radicals.csv (bo thu) ---
$radCsv = Join-Path $CsvDir 'radicals.csv'
if (Test-Path $radCsv) {
  $rads = @(Import-Csv -Path $radCsv -Encoding utf8)
  $rLines = foreach ($r in $rads) {
    $info = 'Hán Việt: ' + $r.hanViet + ' · ' + $r.docNhat
    $common = if ($r.phoBien -match '\S') { 'true' } else { 'false' }
    '    [' + (Esc $r.boThu) + ', ' + (Esc $r.nghia) + ', ' + (Esc $info) + ', ' + (Esc $r.nhom) + ', ' + $common + ']'
  }
  $radJs = @"
// TU DONG SINH tu  data/lessons/csv/radicals.csv  boi  tools/build-lessons.ps1 -- DUNG SUA TAY.
// Moi bo thu: [ chu, nghia, info (Han Viet + am Nhat), nhom, phoBien(bool) ]
const RADICALS = [
$($rLines -join ",`r`n")
];
"@
  [System.IO.File]::WriteAllText((Join-Path $Root 'data\radicals.js'), $radJs, $Utf8NoBom)
  Write-Host ("radicals.js: {0} bo thu" -f $rads.Count)
}

# --- Sinh data/kanji-parts.js tu csv/kanji-parts.csv (bo thu cau tao nen tung chu kanji) ---
$kpCsv = Join-Path $CsvDir 'kanji-parts.csv'
if (Test-Path $kpCsv) {
  $kps = @(Import-Csv -Path $kpCsv -Encoding utf8)
  $kpLines = foreach ($r in $kps) {
    $k = ([string]$r.kanji).Trim()
    if (-not $k) { continue }
    # Cot bo_thu: cac thanh phan cach nhau bang "|". Dau "*" = bo thu CHINH (bo Khang Hy).
    # Dang "chu=nghia" de tu ghi nghia cho thanh phan KHONG nam trong 214 bo thu.
    $parts = @()
    foreach ($p in ([string]$r.bo_thu -split '\|')) {
      $p = $p.Trim()
      if (-not $p) { continue }
      $main = $false
      if ($p.StartsWith('*')) { $main = $true; $p = $p.Substring(1) }
      $ch = $p; $ngh = ''
      $eq = $p.IndexOf('=')
      if ($eq -ge 0) { $ch = $p.Substring(0, $eq); $ngh = $p.Substring($eq + 1) }
      $parts += '[' + (Esc $ch) + ', ' + (Esc $ngh) + ', ' + $(if ($main) { 'true' } else { 'false' }) + ']'
    }
    '  ' + (Esc $k) + ': {"hv": ' + (Esc $r.am_han_viet) + ', "ngh": ' + (Esc $r.nghia) +
      ', "on": ' + (Esc (Col $r 'am_on')) + ', "kun": ' + (Esc (Col $r 'am_kun')) +
      ', "parts": [' + ($parts -join ', ') + ']}'
  }
  $kpJs = @"
// TU DONG SINH tu  data/lessons/csv/kanji-parts.csv  boi  tools/build-lessons.ps1 -- DUNG SUA TAY.
// Bo thu cau tao nen tung chu kanji (dung cho tooltip khi ro chuot vao chu).
// KANJI_PARTS[chu] = { hv: am_han_viet, ngh: nghia, on: am_On, kun: am_Kun,
//                      parts: [ [chu_thanh_phan, nghia_tu_ghi, la_bo_chinh], ... ] }
// nghia_tu_ghi de trong => tra trong RADICALS (214 bo thu).
const KANJI_PARTS = {
$($kpLines -join ",`r`n")
};
"@
  [System.IO.File]::WriteAllText((Join-Path $Root 'data\kanji-parts.js'), $kpJs, $Utf8NoBom)
  Write-Host ("kanji-parts.js: {0} chu kanji" -f $kps.Count)
}

# --- Sinh data/themes.js tu csv/themes/ (tu vung theo CHU DE, tach roi he thong N5/N4) ---
$themesRoot = Join-Path $CsvDir 'themes'
$thList = @(); $thWords = @(); $thCount = 0
if (Test-Path $themesRoot) {
  $themesCsv = Join-Path $themesRoot 'themes.csv'
  $themeDefs = if (Test-Path $themesCsv) { @(Import-Csv -Path $themesCsv -Encoding utf8) } else { @() }
  foreach ($t in $themeDefs) {
    $id = ([string]$t.id).Trim()
    if (-not $id) { continue }
    $ws = ImportCsvSafe (Join-Path $themesRoot (Join-Path $id 'words.csv'))
    if ($ws.Count -eq 0) { Write-Host ("themes/{0}: 0 tu (bo qua)" -f $id) -ForegroundColor Yellow; continue }
    $thList += '    [' + (Esc $id) + ', ' + (Esc $t.ten) + ']'
    foreach ($r in $ws) {
      $kana = if ([string]::IsNullOrWhiteSpace($r.kana)) { $r.tiengNhat } else { $r.kana }
      $thWords += '    [' + (Esc $r.tiengNhat) + ', ' + (Esc $r.romaji) + ', ' + (Esc $r.nghia) + ', ' + (Esc $kana) + ', ' + (Esc $id) + ']'
    }
    $thCount += $ws.Count
    Write-Host ("themes/{0}: {1} tu" -f $id, $ws.Count)
  }
}
$themesJs = @"
// TU DONG SINH tu  data/lessons/csv/themes/  boi  tools/build-lessons.ps1 -- DUNG SUA TAY.
// Tu vung theo CHU DE, tach roi hoan toan he thong trinh do N5/N4.
// THEME_LIST: [ [id, ten_hien_thi], ... ]
// THEMEWORDS: [ [chu_hien_thi, romaji, nghia, kana, themeId], ... ]
const THEME_LIST = [
$($thList -join ",`r`n")
];
const THEMEWORDS = [
$($thWords -join ",`r`n")
];
"@
[System.IO.File]::WriteAllText((Join-Path $Root 'data\themes.js'), $themesJs, $Utf8NoBom)
Write-Host ("themes.js: {0} chu de, {1} tu" -f $thList.Count, $thCount)

# --- Sinh manifest.js (trang + service worker deu doc) ---
$courseNames = @($manifest.Keys)
$coursesJs = foreach ($c in $courseNames) {
  $m = if ($courseMeta.Contains($c)) { $courseMeta[$c] } else { @{ ten = $c; tenNgan = ''; donvi = 'Bài' } }
  $short = if ($m.tenNgan) { $m.tenNgan } else { $m.ten }
  '    { id: ' + (Esc $c) + ', ten: ' + (Esc $m.ten) + ', tenNgan: ' + (Esc $short) + ', donvi: ' + (Esc $m.donvi) + ' }'
}
$manLines = foreach ($c in $courseNames) {
  $lvLines = foreach ($lv in @($manifest[$c].Keys)) { '      "' + $lv + '": [' + (($manifest[$c][$lv]) -join ', ') + ']' }
  '    "' + $c + '": {' + "`r`n" + ($lvLines -join ",`r`n") + "`r`n" + '    }'
}
$fileLines = ($lessonFiles | ForEach-Object { '    "' + $_ + '"' }) -join ",`r`n"
# Tuong thich cu: danh sach trinh do (gop tat ca giao trinh) + danh sach so bai phang.
$allLevels = @(); foreach ($c in $courseNames) { foreach ($lv in @($manifest[$c].Keys)) { if ($allLevels -notcontains $lv) { $allLevels += $lv } } }
$allLevels = $allLevels | Sort-Object @{ Expression = { LevelRank $_ } }, { $_ }
$levelsJs = ($allLevels | ForEach-Object { '"' + $_ + '"' }) -join ', '
$flatNums = (@(foreach ($c in $courseNames) { foreach ($lv in @($manifest[$c].Keys)) {
  foreach ($n in $manifest[$c][$lv]) { [int]([regex]::Match($n, '\d+').Value) } } }) | Sort-Object -Unique) -join ', '
$manifestJs = @"
// TU DONG SINH boi tools/build-lessons.ps1 -- DUNG SUA TAY.
// Danh sach GIAO TRINH -> TRINH DO -> so bai. Ca trang HTML lan service worker (sw.js)
// deu doc, nen them bai/trinh do/giao trinh KHONG con phai sua file HTML hay sw.js nua.
(function (g) {
  // Giao trinh: id (= ten thu muc), ten hien thi, ten ngan (badge), don vi bai ("Bài"/"Chương").
  g.COURSES = [
$($coursesJs -join ",`r`n")
  ];
  g.LESSON_MANIFEST = {
$($manLines -join ",`r`n")
  };
  // Duong dan cac file bai (tuong doi voi data/lessons/) - loader va sw.js dung truc tiep.
  g.LESSON_FILES = [
$fileLines
  ];
  g.LEVELS = [$levelsJs];        // gop tat ca giao trinh (tuong thich cu)
  g.LESSON_NUMS = [$flatNums];   // gop phang (tuong thich cu)
})(typeof window !== 'undefined' ? window : self);
"@
[System.IO.File]::WriteAllText((Join-Path $LDir 'manifest.js'), $manifestJs, $Utf8NoBom)

# --- Tang phien ban cache trong sw.js ---
$swPath = Join-Path $Root 'sw.js'
if (Test-Path $swPath) {
  $sw = Get-Content -Path $swPath -Raw -Encoding utf8
  $m = [regex]::Match($sw, "const CACHE = 'jp-n5-v(\d+)'")
  if ($m.Success) {
    $ver = [int]$m.Groups[1].Value + 1
    $sw = [regex]::Replace($sw, "const CACHE = 'jp-n5-v\d+'", "const CACHE = 'jp-n5-v$ver'")
    [System.IO.File]::WriteAllText($swPath, $sw, $Utf8NoBom)
    Write-Host "sw.js: cache -> jp-n5-v$ver"
  }
}

Write-Host ""
Write-Host ("XONG. {0} giao trinh, {1} bai | {2} tu, {3} cau, {4} ngu phap, {5} bai doc, {6} hoi thoai." -f $courseNames.Count, $totLessons, $totW, $totS, $totG, $totR, $totC) -ForegroundColor Green
foreach ($c in $courseNames) {
  $ten = if ($courseMeta.Contains($c)) { $courseMeta[$c].ten } else { $c }
  Write-Host ("  {0} ({1}):" -f $ten, $c)
  foreach ($lv in @($manifest[$c].Keys)) { Write-Host ("    {0}: bai {1}" -f $lv, (($manifest[$c][$lv]) -join ', ')) }
}
