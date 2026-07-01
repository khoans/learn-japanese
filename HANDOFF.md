# HANDOFF — quick orientation for AI sessions

Read this first, then `CLAUDE.md` for the deep architecture. This file is the
fast map + the tribal knowledge (gotchas, current state, how to verify) that
isn't obvious from the code. Last updated: **2026-07-01**.

## 30-second orientation

A single-page, **pure client-side** Japanese study/drill app (Minna no Nihongo,
Vietnamese translations). Vanilla JS, **no framework, no build step for the app,
no backend, no package manager**. Runs by opening the HTML directly (`file://`)
or via GitHub Pages. All progress lives in `localStorage`.

- Repo → GitHub Pages: `github.com/khoans/learn-japanese`, Pages from `main` `/`.
  **Deploy = `git push`.** No CI.
- Two UI shells share one engine: `kana_speed_trainer.html` (classic) and
  `kana_speed_trainer_v2.html` (azure). Both `<script src>` the **same `app.js`**.
  `index.html` is a chooser. **Any logic change goes in `app.js` once.**
- The user (khoans) is Vietnamese, learning N5. Talk to them in Vietnamese;
  write AI-facing docs/code comments in English/ASCII-safe text.

## Where things live

```
index.html                     chooser / landing (+ SW registration)
kana_speed_trainer.html         classic shell  — markup/CSS + the lesson loader block
kana_speed_trainer_v2.html      azure shell    — markup/CSS + the lesson loader block
app.js                          THE ENGINE (single source of truth for all logic)
sw.js                           service worker (offline); reads the lesson manifest
manifest.json, icon.svg         PWA
data/
  registry.js                   registerLesson() + JPLessons collector — loads FIRST
  core-data.js                  non-lesson data: kana, WORDS, KANJIV, KANJI130, NUMSET, COUNTSET, RADICALS
  lessons/
    manifest.js                 GENERATED — LEVELS + LESSON_MANIFEST (nums per level)
    <LEVEL>/lesson-NN.js         GENERATED from CSV — e.g. N5/lesson-01.js — DO NOT hand-edit
    _TEMPLATE.js                legacy JS template, unused
    csv/                        *** SOURCE OF TRUTH ***  (edit here, in Excel/Sheets)
      <LEVEL>/lesson-NN/words.csv|sentences.csv|grammar.csv
      _TEMPLATE/                copy-me folder for a new lesson
      README.md                 maintainer guide (VN)
tools/build-lessons.ps1         CSV -> generated .js + manifest.js (+ bumps sw cache)
CLAUDE.md                       full architecture (English)
HƯỚNG-DẪN.md                    maintainer guide (Vietnamese)
```

## The golden rule

**Lesson content is authored as CSV and generated into JS. Never hand-edit the
generated files.** Source of truth = `data/lessons/csv/<LEVEL>/lesson-NN/*.csv`.
After editing CSV, run the build; it regenerates `data/lessons/<LEVEL>/lesson-NN.js`
+ `manifest.js`, deletes orphaned generated files, and bumps `sw.js` cache.

Run the build (PowerShell 7, zero install):
```
pwsh -ExecutionPolicy Bypass -File tools/build-lessons.ps1
```

CSV columns (Vietnamese headers; keep the header row; UTF-8 with BOM for Excel):
- `words.csv`     → `tiengNhat, romaji, nghia, kana`  (kana blank ⇒ uses tiengNhat)
- `sentences.csv` → `cau, romaji, nghia`
- `grammar.csv`   → `mau_cau, giai_thich, vi_du, vi_du_romaji, nghia`
  (the build maps these back to the internal `p/g/ex/exr/m` keys app.js consumes —
  so app.js never changes when you touch grammar CSV headers.)

## Common tasks

- **Add sentences/words to a lesson:** edit the matching CSV under
  `csv/<LEVEL>/lesson-NN/`, run the build. When adding *sentences*, stay within
  that Minna lesson's grammar + vocabulary; write mostly hiragana (katakana for
  loanwords), space between bunsetsu, Q/A as separate rows with a leading `…` on
  the answer. Check the lesson's `grammar.csv`/`words.csv` first to stay in scope.
- **Add a lesson (e.g. N5 Bài 8):** copy `csv/_TEMPLATE/` → `csv/N5/lesson-08/`,
  fill 3 CSVs, run the build. Button + grammar appear automatically. No HTML/sw edits.
- **Add a level (N4…N1):** create `csv/N4/lesson-01/` (copy `_TEMPLATE/`), fill,
  build. UI shows a per-level group automatically. See "levels" gotcha below.
- **Change engine logic:** edit `app.js` only (both shells share it).
- **Change one UI's look:** edit that HTML's `<style>`/markup; the other is unaffected.

## How to verify (no browser needed)

Browser automation in this environment often **cannot reach loopback HTTP servers
or `file://`** — don't rely on it. Instead:

1. Syntax: `node --check <file>` on generated `.js`, `registry.js`, `manifest.js`, `sw.js`.
2. Runtime simulation (proves the whole load chain): a Node shim that sets
   `global.window = global`, evals `data/registry.js` then `data/lessons/manifest.js`,
   loops `LEVELS × LESSON_MANIFEST[lv]` eval-ing each `data/lessons/<lv>/lesson-NN.js`,
   then checks `JPLessons.words()/.sentences()/.grammar()/.levels()/.numsOf(lv)`.
   `registerLesson` accepts `("N5", N, {...})` and legacy `(N, {...})`.
3. Fidelity after a data refactor: back up the old generated `.js`, regenerate,
   deep-compare the registered objects (normalize: kana defaults to tiengNhat).
4. Final human check: ask the user to double-click the HTML once.

## Gotchas / landmines

- **PowerShell variables are case-insensitive.** In `build-lessons.ps1`, a loop var
  like `$lDir` silently aliases the base `$LDir` and corrupts output paths. Keep
  loop/base names distinct. (This bug already bit once.)
- **`document.write` loader:** each shell has an inline loader that `document.write`s
  the lesson `<script>` tags from `LEVELS`/`LESSON_MANIFEST`, in order, synchronously
  — works on `file://` (can't list a dir over `file://`, hence the manifest). It runs
  during parse; don't make those scripts async/defer or it will wipe the document.
- **Levels are half-migrated (by design).** Data + folders + manifest + `buildLessonUI`
  are level-aware (`registry.js` exposes `levels()`, `numsOf(level)`; rows carry the
  level as the last element; buttons carry `data-level`). BUT deck keys, `poolForKey`,
  and `GRAM` still key by **lesson number only** → assumes a single active level /
  unique numbers. **Cross-level mixing UI is deferred.** When N4 ships, make the
  key/selection system and `GRAM` level-qualified.
- **Never rename** (would break persisted state / external data): DOM id strings in
  `$('...')`, external data globals (`WORDS`/`KANJIV`/`KANJI130`/`NUMSET`/…), the
  session-selector literal `'cur'`, or persisted `localStorage` field names. LS keys
  are `jp_`-prefixed; `_v1`/`_v2` suffixes are schema versions — bump, don't mutate shape.
- **Row shapes (positional; level appended by registry):**
  `LWORDS` row `[display, romaji, lessonNum, nghia, kana, level]`;
  `LSENT` row `[jp, romaji, lessonNum, nghia, level]`;
  `GRAM` = `{ "<num>": [ {p,g,ex,exr,m}, … ] }`. `poolForKey` emits a uniform 6-tuple
  `[prompt, answer, extra, romaji, compareKey, kanjiForm]`.
- **CRLF:** the PS build writes CRLF; git normalizes to LF on commit (warnings are harmless).
- **sw cache:** the build auto-bumps `const CACHE = 'jp-n5-vN'`. If it drifts high from
  repeated test builds, reset to one bump over the deployed value before committing.
- **Stroke order + writing practice (hanzi-writer):** kanji/radical cards show
  **✍ Thứ tự nét** (`openStroke`, animation) and **✏️ Luyện viết** (`openWrite`,
  interactive `HanziWriter.quiz()`; in-box **Đúng/Sai** → `gradeFromWrite()` →
  `reveal()`+`grade()`, respects practice mode). Both buttons toggled by
  `showStrokeBtn()`. Lazy-loaded from CDN — **online-only**, offline fallback
  (`OFFLINE_MSG`). Data covers all N5 kanji+radicals (verified), but is
  Chinese-derived → a few kanji differ from Japanese stroke order/shape.
- **No tooling:** there is no npm/make/lint/test. Don't look for them.

## Current state (2026-07-02)

- One level, **N5**, lessons **1–7**. 329 words, 51 grammar points.
  Sentences per lesson: 1:30, 2:30, 3:23, **4:46, 5:50, 6:67**, 7:20.
- Working tree clean (all pushed to `main`).
- Recent commits: `03d5326` (group by JLPT level, per-lesson CSV folders, VN headers),
  `7912830` (add sentences to Bài 4/5/6; add this HANDOFF.md),
  `1dd07e0` (interactive stroke-writing practice for kanji & radicals).
- Deferred / not built: cross-level mixing UI; verb-conjugation drill (user said use
  sentence practice for now).
- `references/` (third-party reference HTML) is intentionally **untracked** — not
  committed/deployed.

## Deploy

`git add -A && git commit && git push origin main`. Commit both the CSV source and
the generated `.js` (Pages serves `.js`, not CSV). Only commit/push when the user asks.
