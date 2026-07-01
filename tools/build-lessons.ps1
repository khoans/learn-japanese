<#
  build-lessons.ps1  —  Sinh du lieu bai hoc tu CSV.

  DANH CHO NGUOI BIEN SOAN (khong can biet lap trinh):
    1. Vao thu muc  data\lessons\csv\  , mo file CSV bang Excel / Google Sheets.
    2. Them / sua tu vung, cau, ngu phap. Luu lai (giu dinh dang CSV, ma UTF-8).
       - Them bai moi: chep 3 file mau  _TEMPLATE-*.csv  thanh
         lesson-08-words.csv , lesson-08-sentences.csv , lesson-08-grammar.csv
         (doi 08 cho dung so bai) roi dien vao.
    3. Chay file nay: chuot phai -> "Run with PowerShell"
       (hoac mo PowerShell trong thu muc goc va go:  ./tools/build-lessons.ps1 )
    4. Xong! Mo lai app, bai moi tu dong hien ra. Khong can sua file HTML nao ca.

  Script se sinh:  data\lessons\lesson-NN.js  va  data\lessons\manifest.js
  va tu tang so phien ban cache trong  sw.js  (de ban offline cung cap nhat).
#>

$ErrorActionPreference = 'Stop'

# --- Xac dinh thu muc goc du an (script nam trong  tools\ ) ---
$Root   = Split-Path -Parent $PSScriptRoot
$LDir   = Join-Path $Root 'data\lessons'
$CsvDir = Join-Path $LDir 'csv'

if (-not (Test-Path $CsvDir)) { throw "Khong tim thay thu muc CSV: $CsvDir" }

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# --- Bien 1 chuoi thanh chuoi literal JS an toan ("...") ---
function Esc([object]$v) {
  if ($null -eq $v) { $v = '' }
  $s = [string]$v
  $s = $s.Replace('\', '\\').Replace('"', '\"').Replace("`r", '').Replace("`n", '\n').Replace("`t", '\t')
  return '"' + $s + '"'
}

# --- Tim tat ca so bai co file CSV ---
$nums = @()
Get-ChildItem -Path $CsvDir -Filter 'lesson-*.csv' -File | ForEach-Object {
  if ($_.Name -match '^lesson-(\d+)-(words|sentences|grammar)\.csv$') {
    $nums += [int]$Matches[1]
  }
}
$nums = $nums | Sort-Object -Unique
if ($nums.Count -eq 0) { throw "Khong thay file CSV nao dang lesson-NN-*.csv trong $CsvDir" }

$pad = { param($n) '{0:D2}' -f [int]$n }

function ImportCsvSafe($path) {
  if (Test-Path $path) { return @(Import-Csv -Path $path -Encoding utf8) }
  return @()
}

$totW = 0; $totS = 0; $totG = 0

foreach ($n in $nums) {
  $nn = & $pad $n
  $words     = ImportCsvSafe (Join-Path $CsvDir "lesson-$nn-words.csv")
  $sentences = ImportCsvSafe (Join-Path $CsvDir "lesson-$nn-sentences.csv")
  $grammar   = ImportCsvSafe (Join-Path $CsvDir "lesson-$nn-grammar.csv")

  $wLines = foreach ($r in $words) {
    $kana = if ([string]::IsNullOrWhiteSpace($r.kana)) { $r.jp } else { $r.kana }
    '    [' + (Esc $r.jp) + ', ' + (Esc $r.romaji) + ', ' + (Esc $r.vi) + ', ' + (Esc $kana) + ']'
  }
  $sLines = foreach ($r in $sentences) {
    '    [' + (Esc $r.jp) + ', ' + (Esc $r.romaji) + ', ' + (Esc $r.vi) + ']'
  }
  $gLines = foreach ($r in $grammar) {
    '    {"p": ' + (Esc $r.p) + ', "g": ' + (Esc $r.g) + ', "ex": ' + (Esc $r.ex) + ', "exr": ' + (Esc $r.exr) + ', "m": ' + (Esc $r.m) + '}'
  }

  $wBody = ($wLines -join ",`r`n")
  $sBody = ($sLines -join ",`r`n")
  $gBody = ($gLines -join ",`r`n")

  $js = @"
// ===== Minna no Nihongo - Bai $n =====
// TU DONG SINH tu  data/lessons/csv/lesson-$nn-*.csv  boi  tools/build-lessons.ps1
// DUNG SUA TRUC TIEP FILE NAY -- moi thay doi se bi ghi de. Hay sua CSV roi chay lai script.
// words: [ chu_hien_thi, romaji, nghia_tiengviet, hiragana ]
// sentences: [ cau_nhat, romaji, nghia_tiengviet ]
// grammar: { p: tieu_de, g: giai_thich, ex: vi_du_nhat, exr: romaji, m: nghia }
registerLesson($n, {
  words: [
$wBody
  ],
  sentences: [
$sBody
  ],
  grammar: [
$gBody
  ]
});
"@

  $outPath = Join-Path $LDir "lesson-$nn.js"
  [System.IO.File]::WriteAllText($outPath, $js, $Utf8NoBom)

  $totW += $words.Count; $totS += $sentences.Count; $totG += $grammar.Count
  Write-Host ("Bai {0}: {1} tu, {2} cau, {3} ngu phap" -f $n, $words.Count, $sentences.Count, $grammar.Count)
}

# --- Xoa file lesson-NN.js "mo coi" (CSV da bi xoa) -> CSV la nguon duy nhat ---
$numSet = @{}
foreach ($n in $nums) { $numSet["$n"] = $true }
Get-ChildItem -Path $LDir -Filter 'lesson-*.js' -File | ForEach-Object {
  if ($_.Name -match '^lesson-(\d+)\.js$' -and -not $numSet["$([int]$Matches[1])"]) {
    Remove-Item $_.FullName -Force
    Write-Host ("Da xoa (khong con CSV): {0}" -f $_.Name) -ForegroundColor Yellow
  }
}

# --- Sinh manifest.js (ca trang va service worker deu doc) ---
$listJs = ($nums -join ', ')
$manifest = @"
// TU DONG SINH boi tools/build-lessons.ps1 -- DUNG SUA TAY.
// Danh sach so bai. Ca trang HTML lan service worker (sw.js) deu doc bien nay,
// nen them bai KHONG con phai sua file HTML hay sw.js nua.
(function (g) { g.LESSON_NUMS = [$listJs]; })(typeof window !== 'undefined' ? window : self);
"@
[System.IO.File]::WriteAllText((Join-Path $LDir 'manifest.js'), $manifest, $Utf8NoBom)

# --- Tang phien ban cache trong sw.js (de ban offline duoc cap nhat) ---
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
Write-Host ("XONG. {0} bai | {1} tu, {2} cau, {3} ngu phap." -f $nums.Count, $totW, $totS, $totG) -ForegroundColor Green
Write-Host ("Cac bai: {0}" -f ($nums -join ', '))
