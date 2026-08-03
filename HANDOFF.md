# HANDOFF — quick orientation for AI sessions

Read this first, then `CLAUDE.md` for the deep architecture. This file is the
fast map + the tribal knowledge (gotchas, current state, how to verify) that
isn't obvious from the code. Last updated: **2026-08-04**.

## 30-second orientation

A single-page, **pure client-side** Japanese study/drill app (Minna no Nihongo,
Vietnamese translations). Vanilla JS, **no framework, no build step for the app,
no backend, no package manager**. Runs by opening the HTML directly (`file://`)
or via GitHub Pages. All progress lives in `localStorage`.

- Repo → GitHub Pages: `github.com/khoans/learn-japanese`, Pages from `main` `/`.
  **Deploy = `git push`.** No CI.
- One UI: `index.html` `<script src>`s the eight `js/*.js` engine files in order.
  **All logic is in `js/` (was one `app.js`, now split by concern).** *(A former second
  "classic" HTML shell was also removed.)*
- The user (khoans) is Vietnamese, learning N5. Talk to them in Vietnamese;
  write AI-facing docs/code comments in English/ASCII-safe text.

## Where things live

```
index.html                     THE app — UI markup/CSS + lesson loader + ordered <script> includes
report.html                    standalone vocab index page (root); reuses the same data <script>
                               chain -> auto-updates on rebuild. Linked from the "🔍 Tra từ" tab.
sw.js                          service worker (MUST be at root for scope); reads the lesson manifest
manifest.json                  PWA manifest
assets/icon.svg                static assets
js/                            THE ENGINE, split by concern (classic scripts, shared global scope):
  kanji-tip.js                   hover-a-kanji radical tooltip — standalone, ALSO loaded by report.html
  core.js                        data globals (LWORDS/LSENT/GRAM/READ/CONV/KANJI_LESSON) + utils
  input-kana.js                  romaji → kana + the "⌨️ Cách gõ" reference table
  kanji130.js                    edit meaning/notes for the 130 kanji
  decks.js                       $, deck selection, poolForKey, canvas
  drill.js                       card flow (nextCard/reveal/grade), speech, notes
  stats.js                       session summary, stats/chart, preview, lookup, đọc hiểu/hội thoại
  tools-init.js                  tab bar, stroke/writing, ALL event wiring + init + PWA  — loads last
data/
  registry.js                   registerLesson() + JPLessons collector — loads FIRST
  core-data.js                  non-lesson data: kana, WORDS, KANJIV, KANJI130, NUMSET, COUNTSET
  radicals.js                   GENERATED from csv/radicals.csv — RADICALS (214 Kangxi: [char,meaning,info,group,common])
  kanji-parts.js                GENERATED from csv/kanji-parts.csv — KANJI_PARTS (kanji -> its component radicals)
  themes.js                     GENERATED from csv/themes/ — THEME_LIST + THEMEWORDS (vocab by topic, no JLPT level)
  lessons/
    manifest.js                 GENERATED — LEVELS + LESSON_MANIFEST (nums per level)
    <LEVEL>/lesson-NN.js         GENERATED from CSV — e.g. N5/lesson-01.js — DO NOT hand-edit
    csv/                        *** SOURCE OF TRUTH ***  (edit here, in Excel/Sheets)
      <LEVEL>/lesson-NN/words.csv|sentences.csv|grammar.csv|reading.csv|conversation.csv
      _TEMPLATE/                copy-me folder for a new lesson
      README.md                 maintainer guide (VN)
tools/build-lessons.ps1         CSV -> generated .js + manifest.js (+ bumps sw cache)
CLAUDE.md                       full architecture (English)
README.md                       maintainer guide (Vietnamese)
```

## What the app actually does (feature map)

**Drill modes** — every mode is a string key parsed by `poolForKey()` (`js/decks.js`), built by
`deckKey()` from the `#mode` select + its per-mode picker, optionally prefixed `W:` (viết) or
`M:` (nghĩa→kana). Adding a mode = a branch in `poolForKey` + `deckKey` + `deckLabel` +
`syncControls` visibility + an `<option>`:

| key | UI name | source data |
|-----|---------|-------------|
| `char` | Ký tự rời | kana tables in `core-data.js` |
| `word` | Đọc từ (N5) | `WORDS` |
| `lword` | Từ theo bài | `LWORDS` (+ flags `K` kanji-front, `C` từ chính, `A` phụ lục) |
| `lkanji` | Kanji theo bài | `KANJI_LESSON` (`C` chữ rời) / `LWORDS` (`W` từ ghép) |
| `theme` | Từ theo chủ đề | `THEMEWORDS` (+ `K`) |
| `sent` | Câu theo bài | `LSENT` |
| `radical` | Bộ thủ | `RADICALS` (by group, `C` = phổ biến) |
| `kanji` / `kanji130` | Kanji N5 | `KANJIV` / `KANJI130` |
| `number` / `counter` | Số đếm / Đơn vị đếm | `NUMSET` / `COUNTSET` |

**Tool tabs** (`TOOL_IDS` in `js/tools-init.js`, rendered by `renderTool`): ⚙ Tùy chọn ·
✓ Chọn từ · 🎯 Đã thuộc (3-column transfer) · ✍️ Cần viết tay · 🔍 Tra từ · ✎ Sửa nghĩa ·
📊 Thống kê · 文 Ngữ pháp · **📖 Đọc hiểu** · **💬 Hội thoại** · あ Bảng kana · ⌨️ Cách gõ ·
👁 Xem trước. Plus the standalone `report.html`.

**On-card aids:** furigana hint, 🔊 speech, personal note, 📎 phụ lục + Bài·Trình độ badge,
✍️ handwrite tag, ✍ Thứ tự nét / ✏️ Luyện viết (hanzi-writer), and — after the card is
flipped — the hover-a-kanji radical tooltip.

## The other golden rule: vocabulary is added COMPLETE, never partially

**Stated by the user on 2026-08-04 and it applies from now on, to every session.** Any time
you add or touch vocabulary — a whole new lesson, a theme, or two stray words in an existing
`words.csv` — you must fill in *every* field that word is entitled to, in the same change:

1. `words.csv`: `tiengNhat` carries the **proper kanji form** (never substitute kana for a word
   that has kanji), plus `romaji`, `nghia`, and a correct `kana` reading — **katakana for
   loanwords** (`アメリカ`, not `あめりか`) — and `phuluc` when it's a 参考語彙 entry.
2. `csv/kanji-parts.csv`: **one row for every kanji character that word introduces** — radical
   breakdown with `*` on the Kangxi radical, âm Hán Việt, nghĩa, `am_on`, `am_kun`. This is what
   feeds the hover tooltip **and** the `lkanji` drill mode; skip it and the character is silently
   inert everywhere.
3. Rebuild, then re-check: no kanji of that lesson missing from `KANJI_PARTS`, exactly one `*`
   per row, `am_on` or `am_kun` present, every component resolving to a meaning.

The `/add-vocab` and `/add-theme` skills both open with this rule and carry the ready-made
"list the missing kanji" one-liner (step 4b of `add-vocab`) — use them rather than re-deriving.
Historically this repo was filled in layer by layer (kanji forms, then appendix flags, then
readings, then radicals), which is exactly the drift this rule exists to stop.

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
  (the build maps these back to the internal `p/g/ex/exr/m` keys the engine consumes —
  so the `js/` code never changes when you touch grammar CSV headers.)
- `reading.csv`   → `tieu_de, doan_van, nghia, cau_hoi1, dap_an1, cau_hoi2, dap_an2, cau_hoi3, dap_an3`
- `conversation.csv` → `tieu_de, boi_canh, hoi_thoai, nghia`
  **Gotcha for these two:** lines are split on `|`, and `nghia` must have exactly as many
  `|`-parts as `doan_van`/`hoi_thoai`, in the same order — otherwise the Vietnamese pairs
  with the wrong Japanese line (the build does NOT check this). Each `hoi_thoai` turn must
  start with `TênNgười：` (full-width or ASCII colon) or the speaker label won't render.
  Both files are optional — a lesson without them just shows "chưa có bài đọc/hội thoại".
  **Furigana** = reading in square brackets right after the kanji (`私[わたし]は`) → `<ruby>`;
  shown on hover (CSS), pinned by the `ふ` button. `plainJp()` strips brackets before TTS —
  if you add code that speaks or compares these strings, run it through `plainJp()` first.
- `csv/kanji-parts.csv` → `kanji, am_han_viet, nghia, bo_thu, am_on, am_kun` (one row per kanji; components
  `|`-separated, `*` = Kangxi radical, `char=nghĩa` for components outside the 214 radicals)
  → generates `data/kanji-parts.js` (`KANJI_PARTS`). Powers the hover-a-kanji-see-its-radicals
  tooltip (`js/kanji-tip.js`, loaded by index.html **and** report.html). **Filled in lesson by
  lesson — Bài 1–3 (90 kanji) so far**; kanji missing from it just render without a tooltip.
  It also feeds the **"Kanji theo bài" drill mode** (`lkanji`), which has **two card kinds**
  picked by the `#lkanjiForm` select → deck key `lkanji|<lessons>|C` or `|W`:
  • **`C` = chữ rời** (single characters). Pool = `KANJI_LESSON` (built in `js/core.js`), which
    pins each kanji to the **first** lesson whose vocabulary uses it, so 日 is studied once.
    A kanji missing from `kanji-parts.csv` simply doesn't appear yet.
  • **`W` = từ ghép** (compound words: 病院, 会社員…). Pool = the lesson's `LWORDS` rows that
    contain any kanji; the extra line glosses each character (`病 Bệnh · bệnh, ốm` …), which
    degrades gracefully to the bare character when that kanji isn't in `kanji-parts.csv` yet.
  Both put the kanji in `card[5]`, so ✍ Thứ tự nét / ✏️ Luyện viết work on them.
  Old saved keys without the flag (`lkanji|1`) fall through to `C` — keep that fallback.

## Common tasks

- **Add sentences/words to a lesson:** edit the matching CSV under
  `csv/<LEVEL>/lesson-NN/`, run the build. When adding *sentences*, stay within
  that Minna lesson's grammar + vocabulary; write mostly hiragana (katakana for
  loanwords), space between bunsetsu, Q/A as separate rows with a leading `…` on
  the answer. Check the lesson's `grammar.csv`/`words.csv` first to stay in scope.
- **N5 = write kana, not raw kanji (learner can't read kanji yet).** In grammar
  `vi_du`/`giai_thich` examples **and** `sentences.csv`, write the Japanese in kana
  (hiragana; katakana for loanwords) — e.g. `ごはんを たべます`, NOT `ご飯を食べます` — or
  append the reading if a kanji must appear. This keeps every example readable at N5.
  **Exception:** `words.csv` deliberately keeps the kanji in `tiengNhat` and the reading
  in the `kana` column — leave the kanji there. Rule applies to the drill running-text.
- **Add a lesson (e.g. N5 Bài 8):** copy `csv/_TEMPLATE/` → `csv/N5/lesson-08/`,
  fill the 5 CSVs, run the build. Button + grammar appear automatically. No HTML/sw edits.
- **Add a level (N4…N1):** create `csv/N4/lesson-01/` (copy `_TEMPLATE/`), fill,
  build. UI shows a per-level group automatically. See "levels" gotcha below.
- **Extend the kanji data to the next lesson** (the user asks for this lesson by lesson,
  e.g. "thêm bộ thủ cho bài 4"): list the lesson's kanji that aren't in `KANJI_PARTS` yet
  (walk `JPLessons.words()` for rows of that lesson, match `/[一-鿿々]/`), append one row per
  kanji to `csv/kanji-parts.csv` with radicals **and** `am_on`/`am_kun`, rebuild, then
  validate that every component resolves (either an explicit `=nghĩa` or a hit in `RADICALS`
  possibly via the variant map) and that every row marks exactly one `*` main radical.
  This single file powers both the hover tooltip and the `lkanji` deck.
- **Change engine logic:** edit the relevant `js/*.js` file. Keep all top-level
  wiring/init in `js/tools-init.js` (last-loaded) to avoid cross-file hoisting bugs.
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
4. **Run the real render code on a fake DOM** — this has caught more than syntax checks.
   Slice the function(s) out of the `js/` file by *marker string* (never hard-coded line
   numbers — they drift), `vm.runInContext` them next to the real generated data with a
   minimal `El`/`document` stub, and print the resulting HTML / card tuples. Two gotchas
   learned the hard way: `eval`'d `let`/`const` do **not** leak into the surrounding scope
   (use `vm.runInContext` on concatenated sources so classic-script scope is reproduced),
   and `poolForKey`'s branches share text with `deckLabel`'s — search **after**
   `indexOf('function poolForKey')`.
5. Content sanity for `reading.csv`/`conversation.csv`: assert `jp.split('|').length ===
   vi.split('|').length` per row, and that every dialogue turn matches `/^[^：:]{1,12}[：:]/`.
   For `kanji-parts.csv`: every row has exactly one `*`, has `am_on` or `am_kun`, and every
   component resolves (explicit `=nghĩa`, or `RADICALS` directly / via the variant map).
6. Final human check: ask the user to double-click the HTML once. **Browser automation
   (claude-in-chrome) has been unavailable in every session so far** — assume you cannot
   see the page and say so plainly instead of implying you verified it visually.

## Gotchas / landmines

- **PowerShell variables are case-insensitive.** In `build-lessons.ps1`, a loop var
  like `$lDir` silently aliases the base `$LDir` and corrupts output paths. Keep
  loop/base names distinct. (This bug already bit once.)
- **`document.write` loader:** the shell has an inline loader that `document.write`s
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
  `LWORDS` row `[display, romaji, lessonNum, nghia, kana, level, phuluc(0|1)]`;
  `LSENT` row `[jp, romaji, lessonNum, nghia, level]`;
  `GRAM` = `{ "<num>": [ {p,g,ex,exr,m}, … ] }`;
  `READ`/`CONV` = `{ "<num>": [ {t,jp,vi,q?,s?,bai,level}, … ] }` (objects, not tuples —
  the registry only stamps `bai`/`level` on them). `poolForKey` emits a uniform 6-tuple
  `[prompt, answer, extra, romaji, compareKey, kanjiForm]`. `card[2]` (extra) is rendered
  into `#wordMeaning`, which is `white-space:pre-line` — so `\n` in it makes real lines.
- **Two "Đã thuộc" (mastered) buckets — session vs. permanent.** The mastery panel
  (`masGrp`) is a **3-column transfer** (`makeTriTransfer` in `js/drill.js`):
  *Chưa thuộc* | *Đã thuộc (session)* | *Đã thuộc (cố định)* — three **mutually
  exclusive** states, moved via `setMasteryState(keys, 'rem'|'ses'|'perm')`.
  • **session** = `session.skip` (lives in `jp_reader_cur_v2`), **cleared by `stopSession`**.
  • **permanent** = the `mastered` global persisted to its **own** store **`jp_mastered_v1`**
  (loaded/saved in `js/decks.js` via `saveMastered`) — **NOT** touched by session reset;
  survives across every session until moved back. **session** is keyed `deckKey() § cardKey`
  (`skipKeyFor`, deck-scoped); **permanent** is keyed by the **word itself** (`card[0]`, NOT
  deck-scoped — like the handwrite tag; old deck-scoped keys migrated on load in `js/decks.js`)
  so "đã ghi nhớ" follows the word across every deck/direction. Both remove the card from the
  drill: see `isSkipped`/`isMastered` in `pickItem` (pool filter), `checkAllMastered`,
  `updateCoverage` (which shows **Đã thuộc** / **Còn lại** / **Đã ghi nhớ** counts).
  Card actions: **✓ Đã thuộc (bỏ qua)** = key `M` → `skipCurrent()` (session);
  **📌 Thuộc cố định** = key `L` → `masterCurrent()` (permanent). Key slots are generic
  (`data-slot` + `keys.*`), so a new shortcut = add to both `keys` defaults + a label row.
- **Handwrite tag + vocab lookup + report page (all this session).**
  • **Handwrite tag** ("nên luyện viết tay"): `handwrite` global in **`jp_handwrite_v2`** (`{k,r,m}`),
  keyed by the **word itself** (`card[0]`, NOT deck-scoped — unlike mastery) so it follows the word
  everywhere. Toggle = **✍️ button / key `W`** → `toggleHandwrite()`; gold `#hwTag` badge on tagged
  cards; **✍️ Cần viết tay** tab (`hwGrp`/`renderHwList`) lists+removes. Does NOT affect the pool.
  • **Card origin + lookup:** `CARD_ORIGIN` in `js/core.js` maps a word's display **and** its kana
  reading → `{bai,level}` / `{theme}` (both keys, because `poolForKey` shows kana in default mode,
  kanji in `K` mode). `originLabel(card[0])` drives the on-card `#originTag` badge, the **🔍 Tra từ**
  tab (`lookupGrp`/`renderLookup`, search+filter over `LWORDS`+`THEMEWORDS`), and the "Xem trước" column.
  • **Appendix tag (📎 phụ lục):** optional 5th `words.csv` column **`phuluc`** (`1` = từ tham khảo,
  không bắt buộc thuộc — các bảng 参考語彙 nghề nghiệp / nhà ga / địa điểm / triệu chứng / cơ thể / ATM).
  Build → word row gets a 5th element → `registry.js` exposes it as `[6]` → `js/core.js` builds
  `APPENDIX`/`isAppendix()` and `originLabel()` appends ` · 📎 phụ lục` (card badge + "Xem trước" free).
  Lookup + `report.html` badge off the row's own flag. `APPENDIX` skips any word that is core elsewhere.
  • **`report.html`** builds its data at runtime via `buildDATA()` from `JPLessons.words()`+themes →
  stays live; opened from the "🔍 Tra từ" tab's **↗ Trang báo cáo** link; in `sw.js` CORE for offline.
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
- **`js/` split (classic scripts, ONE shared global scope):** the 7 engine files
  concatenate to the old `app.js`. No `import`/`export`; **load order is fixed**. Only
  top-level *immediate-execution* code is order-sensitive, and all of it (event wiring,
  `initCanvas()`/`renderKeyLabels()`/… init calls, IIFEs, tool-relocation, PWA) lives in
  `js/tools-init.js` (last). Put new wiring/init there. Verify a refactor with a Node
  boot-sim (stub DOM, load registry+core-data+manifest+lessons + the 7 files in order).
- **Kanji tooltip vs. the 214-radical table:** `RADICALS` stores **traditional** forms
  (戶, 攴, 艸, 示…). Components written in the Japanese/abbreviated form must go through
  the `VARIANT` map in `js/kanji-tip.js` (亻→人, 刂→刀, 攵→攴, 礻→示, 糹→糸, 戸→戶, 広→廣…).
  If a new kanji's component "khong tra duoc nghia", either add the variant there or give
  it an explicit `=nghĩa` in the CSV — don't invent a new radical row.
- **Source data has genuine typos.** Two number-kanji homophone mix-ups have been found and
  fixed so far: Bài 1 `三` (should be `さん`, the polite suffix) and Bài 2 `五` (should be
  `語`). When touching a lesson's `words.csv`, glance for more of this kind.
- **No tooling:** there is no npm/make/lint/test. Don't look for them.

## Current state (2026-08-04)

- One level, **N5**, lessons **1–17** (run `tools/build-lessons.ps1` — it prints the live
  totals: ~1312 từ · 943 câu · 133 ngữ pháp · 95 bài đọc · 85 hội thoại).
- Single UI is **`index.html`**; engine split into `js/` (8 files); static layout
  (`assets/`, `js/`, `data/`, `tools/`).
- **Content completeness by lesson** — the two things that are filled in *incrementally*
  and are the usual "add the next lesson" request:
  • **Đọc hiểu + hội thoại:** all 17 lessons have **5 + 5**; Bài 1 additionally has
    **10 long kanji+furigana readings** (no questions).
  • **`kanji-parts.csv`** (radical breakdown + On/Kun): **Bài 1–3 done, 90 kanji.**
    Bài 4+ not started → those kanji have no tooltip and don't show in the `lkanji` deck.
- **Shipped recently** (newest first): `lkanji` split into *chữ rời* / *từ ghép*;
  Bài 3 kanji data; "Kanji theo bài" mode; hover-kanji radical tooltip
  (`js/kanji-tip.js` + `kanji-parts.csv`, also in `report.html`); furigana-on-hover +
  "🔊 Nghe cả bài" + 10 long readings for Bài 1; 📖 Đọc hiểu / 💬 Hội thoại tabs with
  `reading.csv` / `conversation.csv`; Bài 1–2 kanji fixes (`三`→`さん`, `五`→`語`,
  missing kanji forms, katakana readings for loanwords).
- Deferred / not built: cross-level mixing UI; verb-conjugation drill (user said use
  sentence practice for now); kanji data for Bài 4–17.
- **Known wart:** mastery/handwrite stores key on `card[0]`, so a one-character word
  (私) and its kanji card collide — marking one mastered hides the other.
- `references/` (third-party reference HTML) is intentionally **untracked** — not
  committed/deployed.

## Deploy

`git add -A && git commit && git push origin main`. Commit both the CSV source and
the generated `.js` (Pages serves `.js`, not CSV). Only commit/push when the user asks.
