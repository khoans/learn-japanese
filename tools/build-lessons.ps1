<#
  build-lessons.ps1  —  Sinh du lieu bai hoc tu CSV.

  DANH CHO NGUOI BIEN SOAN (khong can biet lap trinh):
    1. Vao  data\lessons\csv\<TRINH_DO>\lesson-NN\  (vi du: csv\N5\lesson-07\),
       mo cac file  words.csv / sentences.csv / grammar.csv  bang Excel / Google Sheets.
    2. Them / sua tu vung, cau, ngu phap. Luu lai (giu dinh dang CSV, ma UTF-8).
       - Them BAI moi: chep ca thu muc mau  csv\_TEMPLATE\  thanh
         csv\N5\lesson-08\  (dat dung trinh do + so bai) roi dien vao.
       - Them TRINH DO moi (N4, N3...): tao thu muc  csv\N4\  roi bo cac lesson-NN vao.
    3. Chay file nay: chuot phai -> "Run with PowerShell"
       (hoac:  ./tools/build-lessons.ps1 ).
    4. Xong! Mo lai app, bai moi tu dong hien ra. Khong sua file HTML nao ca.

  Cot (dong tieu de) trong CSV:
    words.csv     : tiengNhat, romaji, nghia, kana
    sentences.csv : cau, romaji, nghia
    grammar.csv   : mau_cau, giai_thich, vi_du, vi_du_romaji, nghia

  Script sinh:  data\lessons\<TRINH_DO>\lesson-NN.js  va  data\lessons\manifest.js
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

# --- Thu thap: trinh do -> danh sach so bai (theo thu tu) ---
$levelDirs = Get-ChildItem -Path $CsvDir -Directory | Where-Object { $_.Name -ne '_TEMPLATE' }
$levels = $levelDirs | Sort-Object @{ Expression = { LevelRank $_.Name } }, Name
if ($levels.Count -eq 0) { throw "Khong thay thu muc trinh do nao trong $CsvDir (vi du: csv\N5\)" }

$manifest = [ordered]@{}   # ten trinh do -> mang so bai
$totW = 0; $totS = 0; $totG = 0

foreach ($lvDir in $levels) {
  $level = $lvDir.Name
  $lessonDirs = Get-ChildItem -Path $lvDir.FullName -Directory |
    Where-Object { $_.Name -match '^lesson-(\d+)$' } |
    Sort-Object @{ Expression = { [int]([regex]::Match($_.Name, '\d+').Value) } }
  if ($lessonDirs.Count -eq 0) { continue }

  $outDir = Join-Path $LDir $level
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null
  $nums = @()

  foreach ($lessonDir in $lessonDirs) {
    $num = [int]([regex]::Match($lessonDir.Name, '\d+').Value)
    $nn  = '{0:D2}' -f $num
    $nums += $num

    $words     = ImportCsvSafe (Join-Path $lessonDir.FullName 'words.csv')
    $sentences = ImportCsvSafe (Join-Path $lessonDir.FullName 'sentences.csv')
    $grammar   = ImportCsvSafe (Join-Path $lessonDir.FullName 'grammar.csv')

    $wLines = foreach ($r in $words) {
      $kana = if ([string]::IsNullOrWhiteSpace($r.kana)) { $r.tiengNhat } else { $r.kana }
      '    [' + (Esc $r.tiengNhat) + ', ' + (Esc $r.romaji) + ', ' + (Esc $r.nghia) + ', ' + (Esc $kana) + ']'
    }
    $sLines = foreach ($r in $sentences) {
      '    [' + (Esc $r.cau) + ', ' + (Esc $r.romaji) + ', ' + (Esc $r.nghia) + ']'
    }
    # CSV dung ten cot tieng Viet cho de doc; ben trong app van dung khoa p/g/ex/exr/m.
    $gLines = foreach ($r in $grammar) {
      '    {"p": ' + (Esc $r.mau_cau) + ', "g": ' + (Esc $r.giai_thich) + ', "ex": ' + (Esc $r.vi_du) + ', "exr": ' + (Esc $r.vi_du_romaji) + ', "m": ' + (Esc $r.nghia) + '}'
    }

    $js = @"
// ===== $level - Bai $num =====
// TU DONG SINH tu  data/lessons/csv/$level/lesson-$nn/*.csv  boi  tools/build-lessons.ps1
// DUNG SUA TRUC TIEP FILE NAY -- moi thay doi se bi ghi de. Hay sua CSV roi chay lai script.
// words: [ chu_hien_thi, romaji, nghia_tiengviet, kana ]
// sentences: [ cau_nhat, romaji, nghia_tiengviet ]
// grammar: { p: mau_cau, g: giai_thich, ex: vi_du, exr: vi_du_romaji, m: nghia }
registerLesson("$level", $num, {
  words: [
$($wLines -join ",`r`n")
  ],
  sentences: [
$($sLines -join ",`r`n")
  ],
  grammar: [
$($gLines -join ",`r`n")
  ]
});
"@
    [System.IO.File]::WriteAllText((Join-Path $outDir "lesson-$nn.js"), $js, $Utf8NoBom)
    $totW += $words.Count; $totS += $sentences.Count; $totG += $grammar.Count
    Write-Host ("{0}/lesson-{1}: {2} tu, {3} cau, {4} ngu phap" -f $level, $nn, $words.Count, $sentences.Count, $grammar.Count)
  }
  $manifest[$level] = $nums
}

# --- Don file/thu muc "mo coi" (CSV da bi xoa) -> CSV la nguon duy nhat ---
Get-ChildItem -Path $LDir -Directory | Where-Object { $_.Name -ne 'csv' } | ForEach-Object {
  $lv = $_.Name
  if ($manifest.Contains($lv)) {
    $keep = @{}; foreach ($n in $manifest[$lv]) { $keep["$n"] = $true }
    Get-ChildItem -Path $_.FullName -Filter 'lesson-*.js' -File | ForEach-Object {
      if ($_.Name -match '^lesson-(\d+)\.js$' -and -not $keep["$([int]$Matches[1])"]) {
        Remove-Item $_.FullName -Force
        Write-Host ("Da xoa (khong con CSV): {0}/{1}" -f $lv, $_.Name) -ForegroundColor Yellow
      }
    }
  } else {
    Remove-Item $_.FullName -Recurse -Force
    Write-Host ("Da xoa trinh do (khong con CSV): {0}" -f $lv) -ForegroundColor Yellow
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

# --- Sinh manifest.js (trang + service worker deu doc) ---
$levelNames = @($manifest.Keys)
$levelsJs = ($levelNames | ForEach-Object { '"' + $_ + '"' }) -join ', '
$manLines = foreach ($lv in $levelNames) { '    "' + $lv + '": [' + (($manifest[$lv]) -join ', ') + ']' }
$flatNums = ($manifest.Values | ForEach-Object { $_ } | Sort-Object -Unique) -join ', '
$manifestJs = @"
// TU DONG SINH boi tools/build-lessons.ps1 -- DUNG SUA TAY.
// Danh sach trinh do va so bai moi trinh do. Ca trang HTML lan service worker (sw.js)
// deu doc, nen them bai/trinh do KHONG con phai sua file HTML hay sw.js nua.
(function (g) {
  g.LEVELS = [$levelsJs];
  g.LESSON_MANIFEST = {
$($manLines -join ",`r`n")
  };
  g.LESSON_NUMS = [$flatNums]; // gop phang (tuong thich cu)
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
Write-Host ("XONG. {0} trinh do, {1} bai | {2} tu, {3} cau, {4} ngu phap." -f $levelNames.Count, ($manifest.Values | ForEach-Object { $_.Count } | Measure-Object -Sum).Sum, $totW, $totS, $totG) -ForegroundColor Green
foreach ($lv in $levelNames) { Write-Host ("  {0}: bai {1}" -f $lv, (($manifest[$lv]) -join ', ')) }
