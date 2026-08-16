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
3. `data/lessons/manifest.js` — sets globals `COURSES = [{id,ten,tenNgan,donvi},…]` (the textbooks, in `courses.csv` order), `LESSON_MANIFEST = { "MINNA": { "N5": [1,2,…] }, "GUNGUN": {…} }` (course → level → lesson numbers) and `LESSON_FILES = ["MINNA/N5/lesson-01.js",…]`, plus legacy `LEVELS`/`LESSON_NUMS`. Written to `window` **and** `self` so both the page and the service worker can read it. **Auto-generated** by `tools/build-lessons.ps1`.
4. A tiny inline loader (in the HTML, right after `manifest.js`) `document.write`s a `<script src="data/lessons/<file>">` for each entry of `LESSON_FILES` — synchronous, in order, so it works on `file://` (you cannot list a directory over `file://`, hence the manifest). This replaces the old hand-maintained list of per-lesson `<script>` tags.
5. `data/lessons/<COURSE>/<LEVEL>/lesson-NN.js` — one file per lesson, each calls `registerLesson("<COURSE>", "<LEVEL>", N, {...})`. **Auto-generated from CSV** (see below) — do not hand-edit. (`registerLesson` still accepts the legacy `(level, num, data)` and `(num, data)` forms, treated as course `MINNA`.)
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
The source of truth for lesson content is **CSV files in `data/lessons/csv/<COURSE>/<LEVEL>/lesson-NN/`** — one folder per lesson, each with `words.csv` (cols `tiengNhat,romaji,nghia,kana,phuluc` — `phuluc` optional, see *Appendix vocabulary* below), `sentences.csv` (cols `cau,romaji,nghia`), `grammar.csv` (cols `mau_cau,giai_thich,vi_du,vi_du_romaji,nghia`), `reading.csv` + `conversation.csv` (see *Reading & conversation* below) — editable in Excel/Sheets by non-technical maintainers (Vietnamese column headers; the build maps grammar cols back to the internal `p/g/ex/exr/m` keys). `tools/build-lessons.ps1` (PowerShell 7, zero install) reads every CSV and **generates** `data/lessons/<COURSE>/<LEVEL>/lesson-NN.js` + `data/lessons/manifest.js`, deletes generated `.js` (and now-empty dirs) whose CSV was removed (CSV is the single source of truth), and bumps the `sw.js` cache version. The generated `.js` files are committed/deployed (GitHub Pages serves `.js`, not CSV — CSV can't load over `file://`), but should never be hand-edited. `data/lessons/csv/_TEMPLATE/` is the copy-me lesson folder for new lessons.

### Courses (giáo trình) × Levels (N5…N1)
Content is split **by textbook first**: `MINNA` (Minna no Nihongo) and `GUNGUN` (Gungun), declared in `data/lessons/csv/courses.csv` (`id,ten,ten_ngan,donvi,thutu`; `donvi` = what one lesson is called — "Bài" for Minna, "Chương" for Gungun). Inside a course, lessons are still grouped by JLPT level (only **N5** today). New course = new `csv/<ID>/<LEVEL>/lesson-NN/` folder + a row in `courses.csv`; new level = `csv/MINNA/N4/…`. No code change either way.

**Parts (phần A/B/C).** A Gungun chapter is split into parts, each with its own vocabulary and grammar, so **the unit of study is the part, not the chapter**. A part is authored as its own lesson folder `lesson-01A/`, `lesson-01B/` (build regex `^lesson-(\d+)([A-Za-z0-9]*)$`) and registered as `registerLesson("GUNGUN","N5",1,{...},"A")` — the optional 5th arg. Lessons without a part (all of Minna) keep `part: ''`. `buildLessonUI` renders a "Chương N" row label followed by one **Phần A/B/C** button per part; everything downstream (deck keys, `GRAM`, selects, badges) treats a part exactly like a lesson.

**The lesson key is `lid = "<COURSE>:<num><PART>"`** (`"MINNA:3"`, `"GUNGUN:1A"`) — both books number from 1, so anything keyed by lesson uses the lid, never the bare number: `GRAM`/`READ`/`CONV` keys, deck keys (`lword|MINNA:1,MINNA:2`), `[data-lid]` on lesson buttons, the `<select>` values in the grammar/reading/conversation panels, `LWORDS[8]`/`LSENT[6]`, `KANJI_LESSON[].lid`, and report.html's card keys. `normLid()` in `js/decks.js` upgrades legacy bare numbers ("1,2") to the first course, so old saved deck keys/history still resolve.

`registry.js` exposes `courses()`, `levelsOf(course)`, **`lessonsOf(course, level)`** (→ `[{lid,num,part,level}]`, the list to iterate for UI), `numsOf(course, level)` (chapter numbers, parts collapsed), `lidsOf(course)`, `lids()`, `parseLid(lid)` → `{course,num,part}`, `lessonLabel(lid)` → "Bài 3" / "Chương 1 · Phần A", `lessonLabelFull(lid)` → "Gungun · Chương 1 · Phần A", `lessonShort(lid)` → "1A". `ALL_LESSONS` in `js/core.js` is now an array of **lids**, not numbers.

**One course at a time (by design).** `#courseTabs` (built by `buildLessonUI()` in `js/decks.js`, click handled by delegation in `js/stats.js`) switches the active course; `getCourse()`/`setCourse()` persist it in `localStorage` under `jp_course_v1` and rebuild the lesson buttons + all three lesson `<select>`s. Cross-course (and cross-level) mixing in one deck is deliberately not offered — `poolForKey` would handle it fine, but no UI produces such a key. Because the buttons are rebuilt on every course switch, **event handlers for lesson buttons must be delegated** on `#baiBtns`, never bound per button.

### Data flow: registry → app
- Each lesson file registers its data with course + level + number stated **once** in `registerLesson("MINNA", "N5", N, {...})` (not repeated per row).
- `registry.js` normalizes and concatenates all lessons. `js/core.js` pulls them at startup into the globals the engine uses everywhere: `LWORDS = JPLessons.words()`, `LSENT = JPLessons.sentences()`, `GRAM = JPLessons.grammar()`, `ALL_LESSONS = JPLessons.lids()`. `registry.js` also re-shapes rows (injects the lesson number, fills missing kana, **appends level + course + lid**) into the tuple shapes the app expects — when changing a row format, update both the lesson files **and** the mapping functions in `registry.js`.

### Lesson row formats (positional arrays — order matters; level appended last)
```js
words:     [ chu_hien_thi, romaji, nghia_tiengviet, kana, phuluc? ]  // registry → [..., lesson, nghia, kana, level, phuluc(0|1), course, lid]
sentences: [ cau_nhat, romaji, nghia_tiengviet ]            // registry → [..., lesson, nghia, level, course, lid]
grammar:   { p: mau_cau, g: giai_thich, ex: vi_du, exr: vi_du_romaji, m: nghia }
readings:      { t: tieu_de, jp: "câu|câu|…", vi: "nghĩa|nghĩa|…", q: [[cau_hoi, dap_an], …] }
conversations: { t: tieu_de, s: boi_canh, jp: "Tên：lượt|Tên：lượt|…", vi: "nghĩa|nghĩa|…" }
```
*(Unlike words/sentences/grammar, these two keep their objects intact; `registry.js` only stamps `bai` + `level` + `course` + `lid` on each and groups them by lid.)*

### Practice-deck system (`poolForKey`)
Every drill mode is selected by a string "key" parsed in `poolForKey()` (in `js/decks.js`). Format: an optional `W:`/`M:` prefix (input vs. multiple-choice mode) + `type|args` where `type` is one of `sent`, `lword`, `lkanji`, `theme` (vocabulary by topic, from `data/themes.js`), `radical`, `kanji`, `kanji130`, `number`, `counter`.

**`lkanji` — kanji by lesson** (UI: mode "Kanji theo bài", reuses the same lesson buttons as `sent`/`lword`, so `syncControls` treats it as a lesson mode). Its pool comes from `KANJI_LESSON` in `js/core.js`, which walks `LWORDS` and assigns each kanji to the **first lesson its vocabulary uses it in** (so 日 is studied once, in Bài 1, not again in every later lesson) together with up to 4 example words from that lesson. This index is computed **per course** — a kanji already introduced in Minna still shows up in the first Gungun chapter that uses it, since the two books are separate study tracks. Only kanji present in `KANJI_PARTS` appear — that file is authored lesson by lesson, so the deck grows as `kanji-parts.csv` does. Card: front = the kanji, answer = `On / Kun · nghĩa`, extra line = Hán Việt + component radicals + the lesson words containing it, `card[5]` = the kanji, which is what makes **✍ Thứ tự nét / ✏️ Luyện viết work on these cards**. The typing/compare string takes the first reading with okurigana parens flattened (`や(める)` → `やめる`) and falls back to the On reading converted to hiragana via `kataToHira()` for kanji with no kun. Note the mastery stores are keyed by `card[0]`, so marking a single-character word (e.g. 私) mastered also hides the corresponding kanji card, and vice versa. `poolForKey` filters the relevant global dataset by the args and maps each entry into a uniform 6-element row `[prompt, answer, extra, romajiAnswer, compareKey, kanjiForm]` that the drill engine consumes. Adding a new drill category = adding a `p[0]===...` branch here plus its dataset in `core-data.js`.

### Stroke order & writing practice (hanzi-writer)
Kanji and radical cards get two on-demand overlays in the shared `#strokeBox`, driven by [hanzi-writer](https://hanziwriter.org) lazy-loaded from CDN (`ensureHanziWriter()` in `js/tools-init.js`) — **online-only**, with a Vietnamese offline fallback (`OFFLINE_MSG`):
- **✍ Thứ tự nét** (`openStroke`): loops the stroke-order animation for each CJK char in `card[5] || card[0]` (`kanjiChars()` extracts them).
- **✏️ Luyện viết** (`openWrite`): interactive `HanziWriter.quiz()` — user draws each stroke, validated per-stroke (hint after 2 misses). The in-box **Đúng ✓ / Sai ✕** buttons call `gradeFromWrite()` → `reveal()` + the normal `grade()` (so it respects `dontScore`/practice mode) and advance to the next card.

Both `<button>`s (`strokeBtn`/`writeBtn`) live in the shell's markup and are toggled together by `showStrokeBtn()`. hanzi-writer data covers **all** current N5 kanji + radicals (verified), but is Chinese-derived — a few kanji show Chinese stroke order/shape rather than Japanese (acceptable for N5; KanjiVG would be the JP-accurate alternative).

### State / persistence
All state is `localStorage`, keys prefixed `jp_`: current deck & progress (`jp_reader_cur_v2`), history (`jp_reader_history_v2`), saved shortcut keys (`jp_reader_keys_v2`), limits (`jp_reader_limit_v1`), Kanji130 user edits (`jp_kanji130_edits_v1`), **permanent-mastered store** (`jp_mastered_v1`), **handwrite-practice tags** (`jp_handwrite_v2`, array of `{k,r,m}`), the **active course** (`jp_course_v1`), the report page's theme (`jp_report_theme`), and UI prefs (`jp_reader_appw`/`_csize`/`_pen`). Access only through the `lsGet`/`lsSet`/`lsDel` wrappers (they swallow exceptions for `file://`/private-mode). The `_v1`/`_v2` suffixes are schema versions — bump the suffix rather than silently changing a stored value's shape.

### Study aids (mastery buckets · handwrite tag · vocab lookup · report page)
Layered on top of the drill; all persist in `localStorage` and are wired in `js/drill.js` + `js/stats.js`, tabs registered in `TOOL_IDS` (`js/tools-init.js`).
- **Two "Đã thuộc" (mastered) buckets — 3-column transfer** (`masGrp`, `makeTriTransfer` in `js/drill.js`): *Chưa thuộc* | *Đã thuộc (session)* | *Đã thuộc (cố định)*, mutually exclusive, moved via `setMasteryState(keys,'rem'|'ses'|'perm')`. **session** = `session.skip` (in `jp_reader_cur_v2`, cleared by `stopSession`), keyed `deckKey() § cardKey` (`skipKeyFor`) → deck-scoped; **permanent** = `mastered` global in its own `jp_mastered_v1` (survives resets), keyed by the **word itself** (`card[0]`, NOT deck-scoped — like the handwrite tag; old deck-scoped keys are migrated on load in `js/decks.js`) so "đã ghi nhớ" follows the word across every deck/direction. Both drop the card from the pool (`isSkipped`/`isMastered` in `pickItem`/`checkAllMastered`/`updateCoverage`); the mastery strip shows **Đã thuộc** (session) · **Còn lại** · **Đã ghi nhớ** (permanent). Card buttons/keys: **✓ Đã thuộc (bỏ qua)** = `M` → `skipCurrent()`; **📌 Thuộc cố định** = `L` → `masterCurrent()`.
- **Handwrite tag** (“nên luyện viết tay trên giấy”): `handwrite` global in `jp_handwrite_v2`, keyed by the **word itself** (`card[0]`, NOT deck-scoped → follows the word across decks/modes). Toggle = **✍️ button / key `W`** → `toggleHandwrite()`; a gold badge (`#hwTag`) shows on tagged cards; the **✍️ Cần viết tay** tab (`hwGrp`, `renderHwList`) lists all tags with per-word remove.
- **Vocab lookup + card origin** (`js/core.js`): `CARD_ORIGIN` maps a word's display **and** its kana reading → `{bai,level,course,lid}` (or `{theme}`); `CARD_ORIGIN_ALL` keeps **every** origin of that word and `originLabel()` prefers the one in the active course (words like 水 appear in both textbooks); both keys are registered because `poolForKey` shows kana in default mode and kanji in `K` mode. `originLabel(card[0])` powers the on-card badge (`#originTag`, `showOriginTag()`), the **🔍 Tra từ** tab (`lookupGrp`, `renderLookup`, searchable/filterable over `LWORDS`+`THEMEWORDS`), and the origin column in "Xem trước".
- **Typing reference tab (⌨️ Cách gõ)** — `imeBox` panel + `IME_NOTES`/`renderIme()` in `js/input-kana.js`: searchable table of tricky romaji input (foreign-sound katakana ティ/ジェ/ヴァ…, small kana, っ/ん, long vowel, MS-IME F6–F10 and punctuation). Add rows by editing the `IME_NOTES` array; it mirrors what the mini-IME's `ROMA2KANA` accepts, so update both together.
- **Appendix vocabulary (`phuluc`)** — Minna's 参考語彙 blocks (jobs, station, city places, symptoms, body parts, ATM labels) are reference lists, not required memorization. Mark them with a `1` in the optional 5th `words.csv` column `phuluc`; the build emits a 5th element on the word row, `registry.js` passes it through as `[6]`, and `js/core.js` builds `APPENDIX` + `isAppendix(key)`. `originLabel()` appends ` · 📎 phụ lục` (so the on-card `#originTag` and the "Xem trước" column get it for free); "🔍 Tra từ" and `report.html` render their own 📎 badge from the row's own flag. `APPENDIX` is keyed by the word (like the handwrite tag), so a word that is *core* in any lesson is never badged, even if it also appears in another lesson's appendix block.
- **Reading & conversation (📖 Đọc hiểu · 💬 Hội thoại)** — two read-only practice tabs (`readBox`/`convBox`, `renderRead`/`renderConv` in `js/stats.js`), fed by `READ`/`CONV` in `js/core.js` (`JPLessons.readings()`/`.conversations()`, keyed by **lid** like `GRAM`). Authored per lesson in `reading.csv` (`tieu_de,doan_van,nghia,cau_hoi1..3,dap_an1..3`) and `conversation.csv` (`tieu_de,boi_canh,hoi_thoai,nghia`). **Both files split lines with `|`** — `doan_van`/`hoi_thoai` and their `nghia` must have the **same number of `|`-parts, in the same order**, or lines mis-pair; each `hoi_thoai` turn is `TênNgười：câu nói` (the speaker prefix is parsed out by `/^([^：:]{1,12})[：:]/` and shown in blue). Vietnamese meaning and reading answers are hidden behind the panel's toggle buttons (`readShowVi`/`readShowAns`/`convShowVi`, wired in `js/tools-init.js`); every line has a 🔊 button and is click-to-speak via `speak()`, and each passage/dialogue has a **🔊 Nghe cả bài** button that plays the whole thing (dialogues have the speaker labels stripped first). **Furigana:** a reading written in square brackets right after a kanji run (`私[わたし]は 学生[がくせい]です。`) is turned into `<ruby>…<rt>…</rt></ruby>` by `furiHtml()` (regex `FURI_RE` in `js/stats.js`); CSS in `index.html` keeps `rt` at `opacity:0` until `ruby:hover`/`:active`, and the `ふ Luôn hiện furigana` button pins them by toggling `.furi-on` on the list container (survives re-render since the class sits on `#readList`/`#convList`, not the cards). `plainJp()` strips the brackets before anything is spoken or compared — always speak `plainJp(x)`, never the raw string. Kana-only lines pass through untouched, so the two notations mix freely in one lesson (N5 Bài 1 has 5 short kana readings plus 10 long kanji+furigana ones). Lesson selects are filled by `fillLessonSelect()` in `js/decks.js`, which lists **only lessons of the active course that actually have data** (option value = lid).
- **Kanji radical tooltip (`js/kanji-tip.js` + `data/kanji-parts.js`)** — hovering a kanji shows the radicals it is built from. `data/lessons/csv/kanji-parts.csv` (cols `kanji,am_han_viet,nghia,bo_thu`) generates `KANJI_PARTS[char] = {hv, ngh, parts:[[char, ownMeaning, isMainRadical], …]}`; in `bo_thu`, components are `|`-separated, `*` marks the Kangxi radical, and `char=nghĩa` supplies a meaning for components that aren't among the 214 (otherwise the meaning is looked up in `RADICALS`, through a variant map 亻→人, 刂→刀, 攵→攴, 礻→示 … in `kanji-tip.js`). **Authored per lesson — N5 Bài 1–6 (218 kanji) are done, later lessons get added incrementally**, so `KANJI_PARTS` is expected to be incomplete: `kanjiTipHtml()` silently leaves un-covered kanji as plain text. The module is deliberately **engine-independent** (only needs `RADICALS` + `KANJI_PARTS`) and injects its own CSS, because `report.html` loads it too. It exposes `kanjiTipHtml(text)` (escapes, then wraps), `wrapKanjiInHtml(html)` (wraps without escaping — for strings that already contain markup, e.g. report.html's `<mark>` highlight), and `tipifyEl(el)` (re-wraps an element's existing textContent). One delegated listener on `document` drives a single floating `#kjTipBox`, so late-rendered content needs no re-binding. Wired into: 🔍 Tra từ + 👁 Xem trước (`js/stats.js`), `report.html`, and the drill card via `tipifyCard()` in `js/decks.js` — called from `showAnsKanji()` so tips exist **only after the card is flipped** (otherwise the tooltip would give the answer away; `nextCard()` rewrites `textContent`, which drops the wrappers again).
- **`report.html`** — full-page vocabulary index grouped Giáo trình · Trình độ → Bài (+ themes), built at runtime by `buildDATA()` from `JPLessons.words()`+`THEME_LIST`/`THEMEWORDS`, so it tracks the live data. Opened from the "🔍 Tra từ" tab's **↗ Trang báo cáo** link.

## Common changes

**Add a new lesson (e.g. Bài 8 of Minna N5):**
1. Copy the folder `data/lessons/csv/_TEMPLATE/` → `data/lessons/csv/MINNA/N5/lesson-08/` (Gungun: `csv/GUNGUN/N5/lesson-02/`), fill in `words.csv` / `sentences.csv` / `grammar.csv` (Excel/Sheets, keep the header row, save as UTF-8 CSV).
2. Run `tools/build-lessons.ps1`. It generates `data/lessons/MINNA/N5/lesson-08.js`, updates `manifest.js` (so the page loader picks it up), and bumps `sw.js`'s cache. **No HTML or `sw.js` edits needed** — the manifest is the single source of the file list, read by both the page loader and the SW's `importScripts`.
3. Nothing else — the lesson button and its grammar section appear automatically.

**Add a Gungun chapter/part (e.g. Chương 2, phần A):** copy `_TEMPLATE/` → `data/lessons/csv/GUNGUN/N5/lesson-02A/` (one folder per part: `lesson-02A`, `lesson-02B`, …), fill `words.csv` + `grammar.csv` (+ the others if the part has them), run the build. A chapter with no parts is just `lesson-02/`.

**Add a new course (e.g. a third textbook):** create `data/lessons/csv/<ID>/<LEVEL>/lesson-01/` (copy `_TEMPLATE/`) and add a row to `data/lessons/csv/courses.csv` (`id,ten,ten_ngan,donvi,thutu`), then run the build. The course button appears automatically. A course folder with no lesson yet is skipped (with a warning) and does not show up.

**Add a new level (e.g. N4 of Minna):** create `data/lessons/csv/MINNA/N4/lesson-01/` (copy `_TEMPLATE/`), fill it in, run the build. The level and its lessons appear automatically (grouped under an "N4" label inside that course). See the *Courses × Levels* note above for the cross-level/cross-course-mixing limitation.

**Adding vocabulary — decide the textbook first.** Vocabulary belongs to exactly one place: Minna (`csv/MINNA/N5/lesson-NN/`, the default when the user just says "Bài N"), a Gungun **part** (`csv/GUNGUN/N5/lesson-NN<PART>/`, when they say chương/phần or paste Gungun content — one folder per part), or a course-less theme (`csv/themes/<id>/`). Ask when it's ambiguous. Minna vocabulary may be fetched/reconstructed from the standard syllabus and uses `phuluc=1` for 参考語彙; **Gungun has no web source** — its content must come from what the user pastes, so ask and wait rather than inventing a list. HANDOFF.md has the full table and `/add-vocab` encodes both flows.

**Adding vocabulary — always complete, never partial (user rule, 2026-08-04):** whenever you add
or edit vocabulary (new lesson, new theme, or a couple of words in an existing `words.csv`), fill
in everything that word is entitled to in the same change: the proper **kanji form** in
`tiengNhat` (don't substitute kana), `romaji`, `nghia`, a correct `kana` reading (**katakana for
loanwords**), `phuluc` if it's 参考語彙 — **and a row in `data/lessons/csv/kanji-parts.csv` for every
kanji character it introduces** (radicals with `*` on the Kangxi radical, âm Hán Việt, nghĩa,
`am_on`, `am_kun`), since that file drives both the hover tooltip and the `lkanji` drill mode.
Then rebuild and verify no kanji of that lesson is missing from `KANJI_PARTS`. The `/add-vocab`
and `/add-theme` skills encode this rule and the "list missing kanji" snippet.

**Add words/sentences/grammar to an existing lesson:** edit the matching CSV in `data/lessons/csv/<COURSE>/<LEVEL>/lesson-NN/` (e.g. `MINNA/N5/lesson-06/words.csv`), then run `tools/build-lessons.ps1`. Do **not** edit the generated `data/lessons/<COURSE>/<LEVEL>/lesson-NN.js` directly — it will be overwritten on the next build.
