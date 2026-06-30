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
3. `data/lessons/lesson-NN.js` — one file per lesson, each calls `registerLesson(N, {...})`.
4. `app.js` — the app itself, which reads everything back. Loads **last**. Note: top-level `const`s in the data scripts are shared with `app.js` via the global lexical scope (plain classic scripts), so this only works in this exact order.

`data/lessons/_TEMPLATE.js` is a copy-me template and is intentionally **not** included by any `<script>` tag.

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
1. Copy `data/lessons/_TEMPLATE.js` → `data/lessons/lesson-08.js`, set `registerLesson(8, {...})`, fill data.
2. Add `<script src="data/lessons/lesson-08.js"></script>` in the "THÊM BÀI Ở ĐÂY" block, in ascending order — **in BOTH `kana_speed_trainer.html` and `kana_speed_trainer_v2.html`** (the include list is the one thing duplicated across the two shells).
3. Nothing else — the lesson button and its grammar section appear automatically from `ALL_LESSONS`/`GRAM`.

**Add words/sentences/grammar to an existing lesson:** edit the array in that `data/lessons/lesson-NN.js`; no HTML change needed.
