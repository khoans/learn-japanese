# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
3. `data/lessons/manifest.js` — sets a global `LESSON_NUMS = [1,2,…]` (written to `window` **and** `self` so both the page and the service worker can read it). **Auto-generated** by `tools/build-lessons.ps1`.
4. A tiny inline loader (in each shell, right after `manifest.js`) iterates `LESSON_NUMS` and `document.write`s a `<script src="data/lessons/lesson-NN.js">` for each — synchronous, in order, so it works on `file://` (you cannot list a directory over `file://`, hence the manifest). This replaces the old hand-maintained list of per-lesson `<script>` tags.
5. `data/lessons/lesson-NN.js` — one file per lesson, each calls `registerLesson(N, {...})`. **Auto-generated from CSV** (see below) — do not hand-edit.
6. `app.js` — the app itself, which reads everything back. Loads **last**. Note: top-level `const`s in the data scripts are shared with `app.js` via the global lexical scope (plain classic scripts), so this only works in this exact order.

### Lessons are authored as CSV, not JS
The source of truth for lesson content is **CSV files in `data/lessons/csv/`** (`lesson-NN-words.csv` cols `jp,romaji,vi,kana`; `-sentences.csv` cols `jp,romaji,vi`; `-grammar.csv` cols `p,g,ex,exr,m`) — editable in Excel/Sheets by non-technical maintainers. `tools/build-lessons.ps1` (PowerShell 7, zero install) reads every CSV and **generates** `data/lessons/lesson-NN.js` + `data/lessons/manifest.js`, and bumps the `sw.js` cache version. The generated `.js` files are committed/deployed (GitHub Pages serves `.js`, not CSV — CSV can't load over `file://`), but should never be hand-edited. `data/lessons/_TEMPLATE.js` is the legacy JS template (still not included by any `<script>` tag); the CSV `_TEMPLATE-*.csv` files are the current copy-me starting point.

### Data flow: registry → app
- Each lesson file registers its data with the lesson number stated **once** in `registerLesson(N, {...})` (not repeated per row).
- `registry.js` normalizes and concatenates all lessons. `app.js` pulls them at startup into the globals it uses everywhere: `LWORDS = JPLessons.words()`, `LSENT = JPLessons.sentences()`, `GRAM = JPLessons.grammar()`, `ALL_LESSONS = JPLessons.nums()`. `registry.js` also re-shapes rows (e.g. injects the lesson number and fills missing hiragana) into the tuple shapes the app expects — when changing a row format, update both the lesson files **and** the mapping functions in `registry.js`.

### Lesson row formats (positional arrays — order matters)
```js
words:     [ chu_hien_thi, romaji, nghia_tiengviet, hiragana ]
sentences: [ cau_nhat, romaji, nghia_tiengviet ]
grammar:   { p: tieu_de, g: giai_thich, ex: vi_du_nhat, exr: romaji, m: nghia }
```

### Practice-deck system (`poolForKey`)
Every drill mode is selected by a string "key" parsed in `poolForKey()` (in `app.js`). Format: an optional `W:`/`M:` prefix (input vs. multiple-choice mode) + `type|args` where `type` is one of `sent`, `lword`, `radical`, `kanji`, `kanji130`, `number`, `counter`. `poolForKey` filters the relevant global dataset by the args and maps each entry into a uniform 6-element row `[prompt, answer, extra, romajiAnswer, compareKey, kanjiForm]` that the drill engine consumes. Adding a new drill category = adding a `p[0]===...` branch here plus its dataset in `core-data.js`.

### State / persistence
All state is `localStorage`, keys prefixed `jp_`: current deck & progress (`jp_reader_cur_v2`), history (`jp_reader_history_v2`), saved shortcut keys (`jp_reader_keys_v2`), limits (`jp_reader_limit_v1`), Kanji130 user edits (`jp_kanji130_edits_v1`), and UI prefs (`jp_reader_appw`/`_csize`/`_pen`). Access only through the `lsGet`/`lsSet`/`lsDel` wrappers (they swallow exceptions for `file://`/private-mode). The `_v1`/`_v2` suffixes are schema versions — bump the suffix rather than silently changing a stored value's shape.

## Common changes

**Add a new lesson (e.g. Bài 8):**
1. In `data/lessons/csv/`, copy `_TEMPLATE-words.csv` / `_TEMPLATE-sentences.csv` / `_TEMPLATE-grammar.csv` → `lesson-08-words.csv` / `lesson-08-sentences.csv` / `lesson-08-grammar.csv`, fill in the rows (Excel/Sheets, keep the header row, save as UTF-8 CSV).
2. Run `tools/build-lessons.ps1`. It regenerates `lesson-08.js`, updates `manifest.js` (so the loader in both shells picks it up), and bumps `sw.js`'s cache. **No HTML or `sw.js` edits needed** — the manifest is the single source of the file list, read by both the page loader and the SW's `importScripts`.
3. Nothing else — the lesson button and its grammar section appear automatically from `ALL_LESSONS`/`GRAM`.

**Add words/sentences/grammar to an existing lesson:** edit the matching CSV in `data/lessons/csv/` (e.g. `lesson-06-words.csv`), then run `tools/build-lessons.ps1`. Do **not** edit the generated `data/lessons/lesson-NN.js` directly — it will be overwritten on the next build.
