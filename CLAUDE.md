# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **New session? Read `HANDOFF.md` first** — a fast navigation map + tribal knowledge
> (gotchas, current state, how to verify without a browser). This file has the full detail.

## What this is

A single-page Japanese study/drill app (kana, vocabulary, kanji, numbers, counters, sentences, grammar) following the **Minna no Nihongo** curriculum, with Vietnamese translations. Pure client-side: vanilla JS, no framework, no build step, no backend. All progress lives in `localStorage`.

`HƯỚNG-DẪN.md` is the maintainer guide (in Vietnamese) and is the source of truth for how to add lessons.

## Running & deploying

- **Run locally:** open `index.html` (a chooser) or either UI shell directly in a browser (`file://` works — scripts are plain `<script>` tags, not ES modules, specifically so no web server is needed).
- **No build, no lint, no tests.** There is no tooling/package manager; do not look for `npm`/`make` targets.
- **Hosting:** deployed via GitHub Pages from branch `main`, `/ (root)`. `index.html` is a landing page linking to both UI versions. Deploy = `git push`; Pages rebuilds automatically.

### Two UI shells, one shared engine
There are **two interchangeable front-ends** that share the exact same logic and data:
- `kana_speed_trainer.html` — original "classic" dark blue-grey UI.
- `kana_speed_trainer_v2.html` — redesigned cool-azure UI (fonts via Google Fonts, system fallback offline).

Both `<script src>`-include the **same `app.js`** (the entire drill engine — single source of truth) and the same `data/` files, and each carries a header link to switch to the other. They share `localStorage`, so progress/keys/stats carry across both. **Any logic change goes in `app.js` once.** The only duplication is the markup (each shell has its own `<head>`/CSS/body) and the ordered list of `<script src="data/…">` includes.

## Architecture

### Load order is load-bearing
Data is split out of the HTML into `data/`, loaded by ordered `<script>` tags near the end of **each** UI shell. The order is mandatory and must be preserved:

1. `data/registry.js` — defines `registerLesson()` and the `JPLessons` collector. **Must load first.**
2. `data/core-data.js` — non-lesson data as global `const`s: kana tables (`H_BASIC`/`K_BASIC`/…), `WORDS` (N5), `KANJIV`, `KANJI130`, `NUMSET`, `COUNTSET`, `RADICALS`.
3. `data/lessons/manifest.js` — sets globals `LEVELS = ["N5",…]` (ordered easy→hard) and `LESSON_MANIFEST = { "N5": [1,2,…] }` (lesson numbers per level), plus a flat `LESSON_NUMS` for legacy. Written to `window` **and** `self` so both the page and the service worker can read it. **Auto-generated** by `tools/build-lessons.ps1`.
4. A tiny inline loader (in each shell, right after `manifest.js`) iterates `LEVELS` × `LESSON_MANIFEST[level]` and `document.write`s a `<script src="data/lessons/<LEVEL>/lesson-NN.js">` for each — synchronous, in order, so it works on `file://` (you cannot list a directory over `file://`, hence the manifest). This replaces the old hand-maintained list of per-lesson `<script>` tags.
5. `data/lessons/<LEVEL>/lesson-NN.js` — one file per lesson, each calls `registerLesson("<LEVEL>", N, {...})`. **Auto-generated from CSV** (see below) — do not hand-edit.
6. `app.js` — the app itself, which reads everything back. Loads **last**. Note: top-level `const`s in the data scripts are shared with `app.js` via the global lexical scope (plain classic scripts), so this only works in this exact order.

### Lessons are authored as CSV, not JS
The source of truth for lesson content is **CSV files in `data/lessons/csv/<LEVEL>/lesson-NN/`** — one folder per lesson, each with `words.csv` (cols `tiengNhat,romaji,nghia,kana`), `sentences.csv` (cols `cau,romaji,nghia`), `grammar.csv` (cols `mau_cau,giai_thich,vi_du,vi_du_romaji,nghia`) — editable in Excel/Sheets by non-technical maintainers (Vietnamese column headers; the build maps grammar cols back to the internal `p/g/ex/exr/m` keys). `tools/build-lessons.ps1` (PowerShell 7, zero install) reads every CSV and **generates** `data/lessons/<LEVEL>/lesson-NN.js` + `data/lessons/manifest.js`, deletes generated `.js` whose CSV was removed (CSV is the single source of truth), and bumps the `sw.js` cache version. The generated `.js` files are committed/deployed (GitHub Pages serves `.js`, not CSV — CSV can't load over `file://`), but should never be hand-edited. `data/lessons/_TEMPLATE.js` is the legacy JS template (not included by any `<script>` tag); `data/lessons/csv/_TEMPLATE/` is the current copy-me lesson folder.

### Levels (N5…N1)
Lessons are grouped by JLPT level. Only **N5** exists today; N4…N1 are added by dropping a `csv/N4/lesson-NN/` folder and rebuilding — no code change. `registry.js` exposes `JPLessons.levels()` (ordered) and `JPLessons.numsOf(level)`. `buildLessonUI()` in `app.js` renders lesson buttons grouped under a per-level label, and each `[data-bai]` button also carries `[data-level]`. **Cross-level mixing UI is not built yet** (deferred): the deck keys and `poolForKey` still filter by lesson number only, so lesson numbers are assumed unique while a single level is active. When a second level ships, the selection/key system (and `GRAM` keying, currently by number) needs to become level-qualified.

### Data flow: registry → app
- Each lesson file registers its data with level + number stated **once** in `registerLesson("N5", N, {...})` (not repeated per row). `registerLesson` also accepts the legacy 2-arg `(N, {...})` form (treated as N5).
- `registry.js` normalizes and concatenates all lessons. `app.js` pulls them at startup into the globals it uses everywhere: `LWORDS = JPLessons.words()`, `LSENT = JPLessons.sentences()`, `GRAM = JPLessons.grammar()`, `ALL_LESSONS = JPLessons.nums()`. `registry.js` also re-shapes rows (injects the lesson number, fills missing kana, **appends the level** as the last element) into the tuple shapes the app expects — when changing a row format, update both the lesson files **and** the mapping functions in `registry.js`.

### Lesson row formats (positional arrays — order matters; level appended last)
```js
words:     [ chu_hien_thi, romaji, nghia_tiengviet, kana ]   // registry → [..., lesson, nghia, kana, level]
sentences: [ cau_nhat, romaji, nghia_tiengviet ]            // registry → [..., lesson, nghia, level]
grammar:   { p: mau_cau, g: giai_thich, ex: vi_du, exr: vi_du_romaji, m: nghia }
```

### Practice-deck system (`poolForKey`)
Every drill mode is selected by a string "key" parsed in `poolForKey()` (in `app.js`). Format: an optional `W:`/`M:` prefix (input vs. multiple-choice mode) + `type|args` where `type` is one of `sent`, `lword`, `radical`, `kanji`, `kanji130`, `number`, `counter`. `poolForKey` filters the relevant global dataset by the args and maps each entry into a uniform 6-element row `[prompt, answer, extra, romajiAnswer, compareKey, kanjiForm]` that the drill engine consumes. Adding a new drill category = adding a `p[0]===...` branch here plus its dataset in `core-data.js`.

### Stroke order & writing practice (hanzi-writer)
Kanji and radical cards get two on-demand overlays in the shared `#strokeBox`, driven by [hanzi-writer](https://hanziwriter.org) lazy-loaded from CDN (`ensureHanziWriter()` in `app.js`) — **online-only**, with a Vietnamese offline fallback (`OFFLINE_MSG`):
- **✍ Thứ tự nét** (`openStroke`): loops the stroke-order animation for each CJK char in `card[5] || card[0]` (`kanjiChars()` extracts them).
- **✏️ Luyện viết** (`openWrite`): interactive `HanziWriter.quiz()` — user draws each stroke, validated per-stroke (hint after 2 misses). The in-box **Đúng ✓ / Sai ✕** buttons call `gradeFromWrite()` → `reveal()` + the normal `grade()` (so it respects `dontScore`/practice mode) and advance to the next card.

Both `<button>`s (`strokeBtn`/`writeBtn`) live in each shell's markup and are toggled together by `showStrokeBtn()`. hanzi-writer data covers **all** current N5 kanji + radicals (verified), but is Chinese-derived — a few kanji show Chinese stroke order/shape rather than Japanese (acceptable for N5; KanjiVG would be the JP-accurate alternative).

### State / persistence
All state is `localStorage`, keys prefixed `jp_`: current deck & progress (`jp_reader_cur_v2`), history (`jp_reader_history_v2`), saved shortcut keys (`jp_reader_keys_v2`), limits (`jp_reader_limit_v1`), Kanji130 user edits (`jp_kanji130_edits_v1`), and UI prefs (`jp_reader_appw`/`_csize`/`_pen`). Access only through the `lsGet`/`lsSet`/`lsDel` wrappers (they swallow exceptions for `file://`/private-mode). The `_v1`/`_v2` suffixes are schema versions — bump the suffix rather than silently changing a stored value's shape.

## Common changes

**Add a new lesson (e.g. Bài 8 of N5):**
1. Copy the folder `data/lessons/csv/_TEMPLATE/` → `data/lessons/csv/N5/lesson-08/`, fill in `words.csv` / `sentences.csv` / `grammar.csv` (Excel/Sheets, keep the header row, save as UTF-8 CSV).
2. Run `tools/build-lessons.ps1`. It generates `data/lessons/N5/lesson-08.js`, updates `manifest.js` (so the loader in both shells picks it up), and bumps `sw.js`'s cache. **No HTML or `sw.js` edits needed** — the manifest is the single source of the file list, read by both the page loader and the SW's `importScripts`.
3. Nothing else — the lesson button and its grammar section appear automatically.

**Add a new level (e.g. N4):** create `data/lessons/csv/N4/lesson-01/` (copy `_TEMPLATE/`), fill it in, run the build. The level and its lessons appear automatically (grouped under an "N4" label). See the *Levels* note above for the cross-level-mixing limitation.

**Add words/sentences/grammar to an existing lesson:** edit the matching CSV in `data/lessons/csv/<LEVEL>/lesson-NN/` (e.g. `N5/lesson-06/words.csv`), then run `tools/build-lessons.ps1`. Do **not** edit the generated `data/lessons/<LEVEL>/lesson-NN.js` directly — it will be overwritten on the next build.
