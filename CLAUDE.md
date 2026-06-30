# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page Japanese study/drill app (kana, vocabulary, kanji, numbers, counters, sentences, grammar) following the **Minna no Nihongo** curriculum, with Vietnamese translations. Pure client-side: vanilla JS, no framework, no build step, no backend. All progress lives in `localStorage`.

`HƯỚNG-DẪN.md` is the maintainer guide (in Vietnamese) and is the source of truth for how to add lessons.

## Running & deploying

- **Run locally:** open `kana_speed_trainer.html` directly in a browser (`file://` works — scripts are plain `<script>` tags, not ES modules, specifically so no web server is needed).
- **No build, no lint, no tests.** There is no tooling/package manager; do not look for `npm`/`make` targets.
- **Hosting:** deployed via GitHub Pages from branch `main`, `/ (root)`. `index.html` is a meta-refresh redirect into `kana_speed_trainer.html` (the real app) so the Pages root URL opens the app. Keep that redirect intact. Deploy = `git push`; Pages rebuilds automatically.

## Architecture

### Load order is load-bearing
Data is split out of the HTML into `data/`, loaded by ordered `<script>` tags in `kana_speed_trainer.html` (around line 345). The order is mandatory and must be preserved:

1. `data/registry.js` — defines `registerLesson()` and the `JPLessons` collector. **Must load first.**
2. `data/core-data.js` — non-lesson data as global `const`s: kana tables (`H_BASIC`/`K_BASIC`/…), `WORDS` (N5), `KANJIV`, `KANJI130`, `NUMSET`, `COUNTSET`, `RADICALS`.
3. `data/lessons/lesson-NN.js` — one file per lesson, each calls `registerLesson(N, {...})`.
4. The inline `<script>` in the HTML (the app itself), which reads everything back.

`data/lessons/_TEMPLATE.js` is a copy-me template and is intentionally **not** included by any `<script>` tag.

### Data flow: registry → app
- Each lesson file registers its data with the lesson number stated **once** in `registerLesson(N, {...})` (not repeated per row).
- `registry.js` normalizes and concatenates all lessons. The app pulls them at startup (HTML ~line 357) into the globals it uses everywhere: `LWORDS = JPLessons.words()`, `LSENT = JPLessons.sentences()`, `GRAM = JPLessons.grammar()`, `ALL_LESSONS = JPLessons.nums()`. `registry.js` also re-shapes rows (e.g. injects the lesson number and fills missing hiragana) into the tuple shapes the app expects — when changing a row format, update both the lesson files **and** the mapping functions in `registry.js`.

### Lesson row formats (positional arrays — order matters)
```js
words:     [ chu_hien_thi, romaji, nghia_tiengviet, hiragana ]
sentences: [ cau_nhat, romaji, nghia_tiengviet ]
grammar:   { p: tieu_de, g: giai_thich, ex: vi_du_nhat, exr: romaji, m: nghia }
```

### Practice-deck system (`poolForKey`)
Every drill mode is selected by a string "key" parsed in `poolForKey()` (HTML ~line 496). Format: an optional `W:`/`M:` prefix (input vs. multiple-choice mode) + `type|args` where `type` is one of `sent`, `lword`, `radical`, `kanji`, `kanji130`, `number`, `counter`. `poolForKey` filters the relevant global dataset by the args and maps each entry into a uniform 6-element row `[prompt, answer, extra, romajiAnswer, compareKey, kanjiForm]` that the drill engine consumes. Adding a new drill category = adding a `p[0]===...` branch here plus its dataset in `core-data.js`.

### State / persistence
All state is `localStorage`, keys prefixed `jp_`: current deck & progress (`jp_reader_cur_v2`), history (`jp_reader_history_v2`), saved deck keys (`jp_reader_keys_v1`), limits (`jp_reader_limit_v1`), Kanji130 user edits (`jp_kanji130_edits_v1`), and UI prefs (`jp_reader_appw`/`_csize`/`_pen`). Access only through the `lsGet`/`lsSet`/`lsDel` wrappers (they swallow exceptions for `file://`/private-mode). The `_v1`/`_v2` suffixes are schema versions — bump the suffix rather than silently changing a stored value's shape.

## Common changes

**Add a new lesson (e.g. Bài 7):**
1. Copy `data/lessons/_TEMPLATE.js` → `data/lessons/lesson-07.js`, set `registerLesson(7, {...})`, fill data.
2. Add `<script src="data/lessons/lesson-07.js"></script>` to `kana_speed_trainer.html` in the "THÊM BÀI Ở ĐÂY" block, in ascending order.
3. Nothing else — the lesson button and its grammar section appear automatically from `ALL_LESSONS`/`GRAM`.

**Add words/sentences/grammar to an existing lesson:** edit the array in that `data/lessons/lesson-NN.js`; no HTML change needed.
