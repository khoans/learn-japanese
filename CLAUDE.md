# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **New session? Read `HANDOFF.md` first** — a fast navigation map + tribal knowledge
> (gotchas, current state, how to verify without a browser). This file has the full detail.

## What this is

A single-page Japanese study/drill app (kana, vocabulary, kanji, numbers, counters, sentences, grammar) following the **Minna no Nihongo** curriculum, with Vietnamese translations. Pure client-side: vanilla JS, no framework, no build step, no backend. All progress lives in `localStorage`.

`README.md` is the maintainer guide (in Vietnamese) and is the source of truth for how to add lessons.

## Running & deploying

- **Run locally:** open `index.html` directly in a browser (`file://` works — scripts are plain `<script>` tags, not ES modules, specifically so no web server is needed).
- **No build, no lint, no tests.** There is no tooling/package manager; do not look for `npm`/`make` targets.
- **Hosting:** deployed via GitHub Pages from branch `main`, `/ (root)`. Deploy = `git push`; Pages rebuilds automatically.

### Repo layout
```
index.html      the app — UI markup + CSS + the ordered <script> includes
report.html     standalone vocabulary index (own page at root; reuses the SAME data
                <script> chain as index.html, so it auto-updates on rebuild). Linked
                from the in-app "🔍 Tra từ" tab; also cached by sw.js for offline.
sw.js           service worker (MUST stay at root for its scope); reads the lesson manifest
manifest.json   PWA manifest
assets/         static assets (icon.svg)
js/             the engine, split by concern (7 ordered classic scripts)
data/           content data (registry, core-data, radicals, themes, generated lessons, CSV source)
tools/          build-lessons.ps1 (CSV → generated lesson .js, radicals.js, themes.js)
```

### The engine is `js/` (split classic scripts, shared global scope)
`index.html` is the single UI; its logic lives in **seven ordered `<script src="js/…">` files** — plain classic scripts (NOT ES modules, so it runs on `file://`) sharing one global lexical scope. Split by concern, **load order matters**:
`js/core.js` (data globals + JSDoc typedefs + utils) → `js/input-kana.js` (romaji→kana) → `js/kanji130.js` → `js/decks.js` (`$`, deck selection, `poolForKey`, canvas) → `js/drill.js` (card flow, speech, notes) → `js/stats.js` (summary, stats, preview) → `js/tools-init.js` (tab bar, stroke/writing, **all event wiring + init + PWA registration**).
**Every top-level immediate-execution / init lives in `js/tools-init.js` (last)** so there are no cross-file hoisting hazards — keep it that way when editing. Any change to shared logic goes in the relevant `js/` file. *(History: this was one big `app.js`; earlier still there was a second "classic" HTML shell — both removed.)*

## Architecture

### Load order is load-bearing
Data is split out of the HTML into `data/`, loaded by ordered `<script>` tags near the end of `index.html`. The order is mandatory and must be preserved:

1. `data/registry.js` — defines `registerLesson()` and the `JPLessons` collector. **Must load first.**
2. `data/core-data.js` — non-lesson data as global `const`s: kana tables (`H_BASIC`/`K_BASIC`/…), `WORDS` (N5), `KANJIV`, `KANJI130`, `NUMSET`, `COUNTSET`. Then `data/radicals.js` (GENERATED from `data/lessons/csv/radicals.csv` by the build) defines `RADICALS` — the 214 Kangxi radicals, each `[char, meaning, info, group, common]`; the radical drill filters by `group` (theme) and a "common only" toggle.
3. `data/lessons/manifest.js` — sets globals `LEVELS = ["N5",…]` (ordered easy→hard) and `LESSON_MANIFEST = { "N5": [1,2,…] }` (lesson numbers per level), plus a flat `LESSON_NUMS` for legacy. Written to `window` **and** `self` so both the page and the service worker can read it. **Auto-generated** by `tools/build-lessons.ps1`.
4. A tiny inline loader (in the HTML, right after `manifest.js`) iterates `LEVELS` × `LESSON_MANIFEST[level]` and `document.write`s a `<script src="data/lessons/<LEVEL>/lesson-NN.js">` for each — synchronous, in order, so it works on `file://` (you cannot list a directory over `file://`, hence the manifest). This replaces the old hand-maintained list of per-lesson `<script>` tags.
5. `data/lessons/<LEVEL>/lesson-NN.js` — one file per lesson, each calls `registerLesson("<LEVEL>", N, {...})`. **Auto-generated from CSV** (see below) — do not hand-edit.
6. The engine — `js/core.js` → `input-kana.js` → `kanji130.js` → `decks.js` → `drill.js` → `stats.js` → `js/tools-init.js`, in that order, **last**. Note: top-level `const`s in the data scripts are shared with the `js/` files via the global lexical scope (plain classic scripts), so this only works in this exact order.

### Writing convention for N5 content (learner reads kana, not raw kanji)
The user is studying **N5** and cannot yet read most kanji. When authoring or editing
lesson content — **grammar `vi_du`/`giai_thich` examples and `sentences.csv`** — write the
Japanese **in kana** (hiragana, with katakana for loanwords), *not* bare kanji, so the
reading is always visible. Either replace the kanji with its kana form (preferred, matching
the existing Bài 1–7 style, e.g. `ごはんを たべます` not `ご飯を食べます`) or, if a kanji must
appear, follow it with its reading. **`words.csv` is the exception** — it intentionally shows
the kanji form in `tiengNhat` *and* the reading in the `kana` column, so keep the kanji there.
The rule is about the running-text examples the learner drills on.

### Lessons are authored as CSV, not JS
The source of truth for lesson content is **CSV files in `data/lessons/csv/<LEVEL>/lesson-NN/`** — one folder per lesson, each with `words.csv` (cols `tiengNhat,romaji,nghia,kana,phuluc` — `phuluc` optional, see *Appendix vocabulary* below), `sentences.csv` (cols `cau,romaji,nghia`), `grammar.csv` (cols `mau_cau,giai_thich,vi_du,vi_du_romaji,nghia`), `reading.csv` + `conversation.csv` (see *Reading & conversation* below) — editable in Excel/Sheets by non-technical maintainers (Vietnamese column headers; the build maps grammar cols back to the internal `p/g/ex/exr/m` keys). `tools/build-lessons.ps1` (PowerShell 7, zero install) reads every CSV and **generates** `data/lessons/<LEVEL>/lesson-NN.js` + `data/lessons/manifest.js`, deletes generated `.js` whose CSV was removed (CSV is the single source of truth), and bumps the `sw.js` cache version. The generated `.js` files are committed/deployed (GitHub Pages serves `.js`, not CSV — CSV can't load over `file://`), but should never be hand-edited. `data/lessons/csv/_TEMPLATE/` is the copy-me lesson folder for new lessons.

### Levels (N5…N1)
Lessons are grouped by JLPT level. Only **N5** exists today; N4…N1 are added by dropping a `csv/N4/lesson-NN/` folder and rebuilding — no code change. `registry.js` exposes `JPLessons.levels()` (ordered) and `JPLessons.numsOf(level)`. `buildLessonUI()` in `js/decks.js` renders lesson buttons grouped under a per-level label, and each `[data-bai]` button also carries `[data-level]`. **Cross-level mixing UI is not built yet** (deferred): the deck keys and `poolForKey` still filter by lesson number only, so lesson numbers are assumed unique while a single level is active. When a second level ships, the selection/key system (and `GRAM` keying, currently by number) needs to become level-qualified.

### Data flow: registry → app
- Each lesson file registers its data with level + number stated **once** in `registerLesson("N5", N, {...})` (not repeated per row). `registerLesson` also accepts the legacy 2-arg `(N, {...})` form (treated as N5).
- `registry.js` normalizes and concatenates all lessons. `js/core.js` pulls them at startup into the globals the engine uses everywhere: `LWORDS = JPLessons.words()`, `LSENT = JPLessons.sentences()`, `GRAM = JPLessons.grammar()`, `ALL_LESSONS = JPLessons.nums()`. `registry.js` also re-shapes rows (injects the lesson number, fills missing kana, **appends the level** as the last element) into the tuple shapes the app expects — when changing a row format, update both the lesson files **and** the mapping functions in `registry.js`.

### Lesson row formats (positional arrays — order matters; level appended last)
```js
words:     [ chu_hien_thi, romaji, nghia_tiengviet, kana, phuluc? ]  // registry → [..., lesson, nghia, kana, level, phuluc(0|1)]
sentences: [ cau_nhat, romaji, nghia_tiengviet ]            // registry → [..., lesson, nghia, level]
grammar:   { p: mau_cau, g: giai_thich, ex: vi_du, exr: vi_du_romaji, m: nghia }
readings:      { t: tieu_de, jp: "câu|câu|…", vi: "nghĩa|nghĩa|…", q: [[cau_hoi, dap_an], …] }
conversations: { t: tieu_de, s: boi_canh, jp: "Tên：lượt|Tên：lượt|…", vi: "nghĩa|nghĩa|…" }
```
*(Unlike words/sentences/grammar, these two keep their objects intact; `registry.js` only stamps `bai` + `level` on each and groups them by lesson number.)*

### Practice-deck system (`poolForKey`)
Every drill mode is selected by a string "key" parsed in `poolForKey()` (in `js/decks.js`). Format: an optional `W:`/`M:` prefix (input vs. multiple-choice mode) + `type|args` where `type` is one of `sent`, `lword`, `theme` (vocabulary by topic, from `data/themes.js`), `radical`, `kanji`, `kanji130`, `number`, `counter`. `poolForKey` filters the relevant global dataset by the args and maps each entry into a uniform 6-element row `[prompt, answer, extra, romajiAnswer, compareKey, kanjiForm]` that the drill engine consumes. Adding a new drill category = adding a `p[0]===...` branch here plus its dataset in `core-data.js`.

### Stroke order & writing practice (hanzi-writer)
Kanji and radical cards get two on-demand overlays in the shared `#strokeBox`, driven by [hanzi-writer](https://hanziwriter.org) lazy-loaded from CDN (`ensureHanziWriter()` in `js/tools-init.js`) — **online-only**, with a Vietnamese offline fallback (`OFFLINE_MSG`):
- **✍ Thứ tự nét** (`openStroke`): loops the stroke-order animation for each CJK char in `card[5] || card[0]` (`kanjiChars()` extracts them).
- **✏️ Luyện viết** (`openWrite`): interactive `HanziWriter.quiz()` — user draws each stroke, validated per-stroke (hint after 2 misses). The in-box **Đúng ✓ / Sai ✕** buttons call `gradeFromWrite()` → `reveal()` + the normal `grade()` (so it respects `dontScore`/practice mode) and advance to the next card.

Both `<button>`s (`strokeBtn`/`writeBtn`) live in the shell's markup and are toggled together by `showStrokeBtn()`. hanzi-writer data covers **all** current N5 kanji + radicals (verified), but is Chinese-derived — a few kanji show Chinese stroke order/shape rather than Japanese (acceptable for N5; KanjiVG would be the JP-accurate alternative).

### State / persistence
All state is `localStorage`, keys prefixed `jp_`: current deck & progress (`jp_reader_cur_v2`), history (`jp_reader_history_v2`), saved shortcut keys (`jp_reader_keys_v2`), limits (`jp_reader_limit_v1`), Kanji130 user edits (`jp_kanji130_edits_v1`), **permanent-mastered store** (`jp_mastered_v1`), **handwrite-practice tags** (`jp_handwrite_v2`, array of `{k,r,m}`), the report page's theme (`jp_report_theme`), and UI prefs (`jp_reader_appw`/`_csize`/`_pen`). Access only through the `lsGet`/`lsSet`/`lsDel` wrappers (they swallow exceptions for `file://`/private-mode). The `_v1`/`_v2` suffixes are schema versions — bump the suffix rather than silently changing a stored value's shape.

### Study aids (mastery buckets · handwrite tag · vocab lookup · report page)
Layered on top of the drill; all persist in `localStorage` and are wired in `js/drill.js` + `js/stats.js`, tabs registered in `TOOL_IDS` (`js/tools-init.js`).
- **Two "Đã thuộc" (mastered) buckets — 3-column transfer** (`masGrp`, `makeTriTransfer` in `js/drill.js`): *Chưa thuộc* | *Đã thuộc (session)* | *Đã thuộc (cố định)*, mutually exclusive, moved via `setMasteryState(keys,'rem'|'ses'|'perm')`. **session** = `session.skip` (in `jp_reader_cur_v2`, cleared by `stopSession`), keyed `deckKey() § cardKey` (`skipKeyFor`) → deck-scoped; **permanent** = `mastered` global in its own `jp_mastered_v1` (survives resets), keyed by the **word itself** (`card[0]`, NOT deck-scoped — like the handwrite tag; old deck-scoped keys are migrated on load in `js/decks.js`) so "đã ghi nhớ" follows the word across every deck/direction. Both drop the card from the pool (`isSkipped`/`isMastered` in `pickItem`/`checkAllMastered`/`updateCoverage`); the mastery strip shows **Đã thuộc** (session) · **Còn lại** · **Đã ghi nhớ** (permanent). Card buttons/keys: **✓ Đã thuộc (bỏ qua)** = `M` → `skipCurrent()`; **📌 Thuộc cố định** = `L` → `masterCurrent()`.
- **Handwrite tag** (“nên luyện viết tay trên giấy”): `handwrite` global in `jp_handwrite_v2`, keyed by the **word itself** (`card[0]`, NOT deck-scoped → follows the word across decks/modes). Toggle = **✍️ button / key `W`** → `toggleHandwrite()`; a gold badge (`#hwTag`) shows on tagged cards; the **✍️ Cần viết tay** tab (`hwGrp`, `renderHwList`) lists all tags with per-word remove.
- **Vocab lookup + card origin** (`js/core.js`): `CARD_ORIGIN` maps a word's display **and** its kana reading → `{bai,level}` (or `{theme}`); both keys are registered because `poolForKey` shows kana in default mode and kanji in `K` mode. `originLabel(card[0])` powers the on-card badge (`#originTag`, `showOriginTag()`), the **🔍 Tra từ** tab (`lookupGrp`, `renderLookup`, searchable/filterable over `LWORDS`+`THEMEWORDS`), and the origin column in "Xem trước".
- **Typing reference tab (⌨️ Cách gõ)** — `imeBox` panel + `IME_NOTES`/`renderIme()` in `js/input-kana.js`: searchable table of tricky romaji input (foreign-sound katakana ティ/ジェ/ヴァ…, small kana, っ/ん, long vowel, MS-IME F6–F10 and punctuation). Add rows by editing the `IME_NOTES` array; it mirrors what the mini-IME's `ROMA2KANA` accepts, so update both together.
- **Appendix vocabulary (`phuluc`)** — Minna's 参考語彙 blocks (jobs, station, city places, symptoms, body parts, ATM labels) are reference lists, not required memorization. Mark them with a `1` in the optional 5th `words.csv` column `phuluc`; the build emits a 5th element on the word row, `registry.js` passes it through as `[6]`, and `js/core.js` builds `APPENDIX` + `isAppendix(key)`. `originLabel()` appends ` · 📎 phụ lục` (so the on-card `#originTag` and the "Xem trước" column get it for free); "🔍 Tra từ" and `report.html` render their own 📎 badge from the row's own flag. `APPENDIX` is keyed by the word (like the handwrite tag), so a word that is *core* in any lesson is never badged, even if it also appears in another lesson's appendix block.
- **Reading & conversation (📖 Đọc hiểu · 💬 Hội thoại)** — two read-only practice tabs (`readBox`/`convBox`, `renderRead`/`renderConv` in `js/stats.js`), fed by `READ`/`CONV` in `js/core.js` (`JPLessons.readings()`/`.conversations()`, keyed by lesson number like `GRAM`). Authored per lesson in `reading.csv` (`tieu_de,doan_van,nghia,cau_hoi1..3,dap_an1..3`) and `conversation.csv` (`tieu_de,boi_canh,hoi_thoai,nghia`). **Both files split lines with `|`** — `doan_van`/`hoi_thoai` and their `nghia` must have the **same number of `|`-parts, in the same order**, or lines mis-pair; each `hoi_thoai` turn is `TênNgười：câu nói` (the speaker prefix is parsed out by `/^([^：:]{1,12})[：:]/` and shown in blue). Vietnamese meaning and reading answers are hidden behind the panel's toggle buttons (`readShowVi`/`readShowAns`/`convShowVi`, wired in `js/tools-init.js`); every line has a 🔊 button and is click-to-speak via `speak()`, and each passage/dialogue has a **🔊 Nghe cả bài** button that plays the whole thing (dialogues have the speaker labels stripped first). **Furigana:** a reading written in square brackets right after a kanji run (`私[わたし]は 学生[がくせい]です。`) is turned into `<ruby>…<rt>…</rt></ruby>` by `furiHtml()` (regex `FURI_RE` in `js/stats.js`); CSS in `index.html` keeps `rt` at `opacity:0` until `ruby:hover`/`:active`, and the `ふ Luôn hiện furigana` button pins them by toggling `.furi-on` on the list container (survives re-render since the class sits on `#readList`/`#convList`, not the cards). `plainJp()` strips the brackets before anything is spoken or compared — always speak `plainJp(x)`, never the raw string. Kana-only lines pass through untouched, so the two notations mix freely in one lesson (N5 Bài 1 has 5 short kana readings plus 10 long kanji+furigana ones). Lesson selects are filled by `fillLessonSelect()` in `js/decks.js`, which lists **only lessons that actually have data**.
- **Kanji radical tooltip (`js/kanji-tip.js` + `data/kanji-parts.js`)** — hovering a kanji shows the radicals it is built from. `data/lessons/csv/kanji-parts.csv` (cols `kanji,am_han_viet,nghia,bo_thu`) generates `KANJI_PARTS[char] = {hv, ngh, parts:[[char, ownMeaning, isMainRadical], …]}`; in `bo_thu`, components are `|`-separated, `*` marks the Kangxi radical, and `char=nghĩa` supplies a meaning for components that aren't among the 214 (otherwise the meaning is looked up in `RADICALS`, through a variant map 亻→人, 刂→刀, 攵→攴, 礻→示 … in `kanji-tip.js`). **Authored per lesson — N5 Bài 1 (35 kanji) is done, later lessons get added incrementally**, so `KANJI_PARTS` is expected to be incomplete: `kanjiTipHtml()` silently leaves un-covered kanji as plain text. The module is deliberately **engine-independent** (only needs `RADICALS` + `KANJI_PARTS`) and injects its own CSS, because `report.html` loads it too. It exposes `kanjiTipHtml(text)` (escapes, then wraps), `wrapKanjiInHtml(html)` (wraps without escaping — for strings that already contain markup, e.g. report.html's `<mark>` highlight), and `tipifyEl(el)` (re-wraps an element's existing textContent). One delegated listener on `document` drives a single floating `#kjTipBox`, so late-rendered content needs no re-binding. Wired into: 🔍 Tra từ + 👁 Xem trước (`js/stats.js`), `report.html`, and the drill card via `tipifyCard()` in `js/decks.js` — called from `showAnsKanji()` so tips exist **only after the card is flipped** (otherwise the tooltip would give the answer away; `nextCard()` rewrites `textContent`, which drops the wrappers again).
- **`report.html`** — full-page vocabulary index grouped Trình độ → Bài (+ themes), built at runtime by `buildDATA()` from `JPLessons.words()`+`THEME_LIST`/`THEMEWORDS`, so it tracks the live data. Opened from the "🔍 Tra từ" tab's **↗ Trang báo cáo** link.

## Common changes

**Add a new lesson (e.g. Bài 8 of N5):**
1. Copy the folder `data/lessons/csv/_TEMPLATE/` → `data/lessons/csv/N5/lesson-08/`, fill in `words.csv` / `sentences.csv` / `grammar.csv` (Excel/Sheets, keep the header row, save as UTF-8 CSV).
2. Run `tools/build-lessons.ps1`. It generates `data/lessons/N5/lesson-08.js`, updates `manifest.js` (so the page loader picks it up), and bumps `sw.js`'s cache. **No HTML or `sw.js` edits needed** — the manifest is the single source of the file list, read by both the page loader and the SW's `importScripts`.
3. Nothing else — the lesson button and its grammar section appear automatically.

**Add a new level (e.g. N4):** create `data/lessons/csv/N4/lesson-01/` (copy `_TEMPLATE/`), fill it in, run the build. The level and its lessons appear automatically (grouped under an "N4" label). See the *Levels* note above for the cross-level-mixing limitation.

**Add words/sentences/grammar to an existing lesson:** edit the matching CSV in `data/lessons/csv/<LEVEL>/lesson-NN/` (e.g. `N5/lesson-06/words.csv`), then run `tools/build-lessons.ps1`. Do **not** edit the generated `data/lessons/<LEVEL>/lesson-NN.js` directly — it will be overwritten on the next build.
