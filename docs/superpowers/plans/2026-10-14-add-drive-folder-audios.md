# Add Drive Folder Audios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Append all ~31 audio files from Google Drive folder `1ikypoU1Dz4F-y_2Hi39_fDTLsB-RCUgu` to `dhammaAudios` in `src/data/audios.js` as `practice` tracks with Drive download URLs.

**Architecture:** One-time data addition only. Fetch public Drive file ids + names from the shared folder, map each to the existing audio object shape, append at the end of `dhammaAudios`. No UI, download, or player changes.

**Tech Stack:** React Native app data module (`src/data/audios.js`), Jest (`__tests__/audios.driveFolder.test.js`), shell/`curl`/`node` to list Drive folder contents.

## Global Constraints

- Category for every new entry: `"practice"`
- URL format: `https://drive.usercontent.google.com/download?id=<FILE_ID>&export=download&confirm=t`
- `minutes: 0` for all new entries
- Touch only `src/data/audios.js` for production data (plus a small Jest test file)
- Do not add dependencies, committed helper scripts, or new data modules
- Source folder: https://drive.google.com/drive/u/2/folders/1ikypoU1Dz4F-y_2Hi39_fDTLsB-RCUgu
- Spec: `docs/superpowers/specs/2026-10-14-add-drive-folder-audios-design.md`

---

## File Structure

| File | Role |
|------|------|
| `src/data/audios.js` | Sole production change: append ~31 objects to `dhammaAudios` |
| `__tests__/audios.driveFolder.test.js` | Schema/uniqueness/count checks for the new batch |
| `/tmp/drive-folder-audios.json` | Scratch mapping from Task 1 (not committed) |

No other files change.

---

### Task 1: Fetch Drive file id → name mapping

**Files:**
- Create (scratch, do not commit): `/tmp/drive-folder-audios.json`
- Reference: folder id `1ikypoU1Dz4F-y_2Hi39_fDTLsB-RCUgu`

**Interfaces:**
- Consumes: public Drive folder URL
- Produces: JSON array `[{ "id": "<driveFileId>", "name": "<filename>" }, ...]` with ~31 entries (all `.m4a` files in the folder)

- [ ] **Step 1: List folder files via public Drive page HTML**

Run:

```bash
FOLDER_ID=1ikypoU1Dz4F-y_2Hi39_fDTLsB-RCUgu
curl -sL "https://drive.google.com/drive/folders/${FOLDER_ID}" -o /tmp/drive-folder.html
node <<'NODE'
const fs = require('fs');
const html = fs.readFileSync('/tmp/drive-folder.html', 'utf8');
const files = [];
const re = /\["([a-zA-Z0-9_-]{20,})",[^\]]*?"([^"]+\.m4a)"/gi;
let m;
while ((m = re.exec(html))) {
  files.push({ id: m[1], name: m[2] });
}
if (files.length < 20) {
  const nameRe = /"([^"]+\.m4a)"/gi;
  const names = [...html.matchAll(nameRe)].map(x => x[1]);
  const idRe = /\["(1[a-zA-Z0-9_-]{20,})"/g;
  const ids = [...html.matchAll(idRe)].map(x => x[1]);
  console.error('primary parse count=', files.length, 'names=', names.length, 'ids=', ids.length);
  console.error('Tighten parser against /tmp/drive-folder.html if needed.');
}
const uniq = [];
const seen = new Set();
for (const f of files) {
  if (seen.has(f.id)) continue;
  seen.add(f.id);
  uniq.push(f);
}
fs.writeFileSync('/tmp/drive-folder-audios.json', JSON.stringify(uniq, null, 2));
console.log('wrote', uniq.length, 'files to /tmp/drive-folder-audios.json');
NODE
```

Expected: console prints `wrote N files` where `N` is about **31** (at least 28).

If parse count is too low (sign-in wall or HTML shape changed), retry with:

```bash
curl -sL "https://drive.google.com/embeddedfolderview?id=1ikypoU1Dz4F-y_2Hi39_fDTLsB-RCUgu#list" -o /tmp/drive-embedded.html
```

Then adjust the node regex against that file until every `.m4a` has an id. Do **not** commit HTML/JSON scratch files.

- [ ] **Step 2: Sanity-check the mapping**

Run:

```bash
node -e '
const files = require("/tmp/drive-folder-audios.json");
console.log("count", files.length);
console.log(files.slice(0,3));
const bad = files.filter(f => !f.id || !f.name || !/\.m4a$/i.test(f.name));
console.log("bad", bad.length);
'
```

Expected: `count` ≈ 31, `bad` = 0, sample names look like Burmese titles ending in `.m4a`.

- [ ] **Step 3: Commit nothing for this task**

Scratch only. Proceed to Task 2.

---

### Task 2: Failing test for new Drive-folder batch

**Files:**
- Create: `__tests__/audios.driveFolder.test.js`

**Interfaces:**
- Consumes: `dhammaAudios` from `../src/data/audios`
- Produces: Jest assertions that fail until Task 3 appends entries

- [ ] **Step 1: Write the failing test**

Create `__tests__/audios.driveFolder.test.js`:

```js
import {dhammaAudios} from '../src/data/audios';

const DRIVE_URL_PREFIX =
  'https://drive.usercontent.google.com/download?id=';
const DRIVE_URL_SUFFIX = '&export=download&confirm=t';

/** Entries appended for folder 1ikypoU1Dz4F-y_2Hi39_fDTLsB-RCUgu */
const NEW_ID_PREFIX = 'audio-drive-2026-';

test('adds all practice tracks from the Oct 2026 Drive folder batch', () => {
  const batch = dhammaAudios.filter(a => a.id.startsWith(NEW_ID_PREFIX));
  expect(batch.length).toBeGreaterThanOrEqual(28);
  expect(batch.length).toBeLessThanOrEqual(40);

  const ids = new Set();
  for (const audio of batch) {
    expect(audio.category).toBe('practice');
    expect(audio.minutes).toBe(0);
    expect(typeof audio.title).toBe('string');
    expect(audio.title.length).toBeGreaterThan(0);
    expect(typeof audio.paliTitle).toBe('string');
    expect(typeof audio.speaker).toBe('string');
    expect(typeof audio.subtitle).toBe('string');
    expect(audio.file.startsWith(DRIVE_URL_PREFIX)).toBe(true);
    expect(audio.file.endsWith(DRIVE_URL_SUFFIX)).toBe(true);
    const fileId = audio.file.slice(
      DRIVE_URL_PREFIX.length,
      audio.file.length - DRIVE_URL_SUFFIX.length,
    );
    expect(fileId.length).toBeGreaterThanOrEqual(20);
    expect(ids.has(audio.id)).toBe(false);
    ids.add(audio.id);
  }
});

test('new batch ids do not collide with older entries', () => {
  const allIds = dhammaAudios.map(a => a.id);
  expect(allIds.length).toBe(new Set(allIds).size);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- --testPathPattern=audios.driveFolder.test.js
```

Expected: FAIL — `batch.length` is `0` (no ids with prefix `audio-drive-2026-` yet).

- [ ] **Step 3: Commit the failing test**

```bash
git add __tests__/audios.driveFolder.test.js
git commit -m "$(cat <<'EOF'
test: add schema checks for Drive folder audio batch

EOF
)"
```

---

### Task 3: Append audio entries to `audios.js`

**Files:**
- Modify: `src/data/audios.js` (append before the closing `];` of `dhammaAudios`, after the `audio-metta` entry)
- Read: `/tmp/drive-folder-audios.json` from Task 1

**Interfaces:**
- Consumes: Drive mapping `{ id, name }[]`
- Produces: ~31 new objects in `dhammaAudios`, each with `id` starting with `audio-drive-2026-`

- [ ] **Step 1: Generate entry objects from the mapping**

Run:

```bash
node <<'NODE'
const fs = require('fs');
const files = require('/tmp/drive-folder-audios.json');

function cleanName(name) {
  return name
    .replace(/\.m4a$/i, '')
    .replace(/^Audio\*+/i, '')
    .replace(/\(M4A[^)]*\)/gi, '')
    .replace(/_+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function subtitleFor(title) {
  if (/ပါရမီ/.test(title)) return 'ပါရမီတရားတော်';
  if (/ဂုဏ်တော်/.test(title)) return 'ဂုဏ်တော်';
  if (/သီလ|ဩကာသ|ဘုရားရှိခိုး|သရဏ/.test(title)) return 'သီလ / ရှိခိုး';
  if (/မေတ္တာ|ဒေါသ/.test(title)) return 'မေတ္တာတရားတော်';
  if (/သစ္စာ|ဒုက္ခ|သမုဒယ|နိရောဓ|မဂ္ဂ/.test(title)) return 'သစ္စာတရားတော်';
  return 'တရားတော်';
}

function speakerFor(title) {
  const m =
    title.match(/(သစ္စာရွှေစည်ဆရာတော်(?: အရှင်ဥတ္တမ)?)/) ||
    title.match(/(အရှင်[^\s-]+)/) ||
    title.match(/(ပါမောက္ခချူပ် ဆရာတော်ကြီး)/) ||
    title.match(/(တောင်တန်းသာသနာပြ)/);
  return m ? m[1].trim() : 'တရားတော်';
}

function slug(i, title) {
  const ascii = title
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 40);
  return `audio-drive-2026-${String(i + 1).padStart(2, '0')}${ascii ? '-' + ascii : ''}`;
}

const entries = files.map((f, i) => {
  const title = cleanName(f.name);
  const speaker = speakerFor(title);
  return {
    id: slug(i, title),
    title,
    paliTitle: speaker !== 'တရားတော်' ? `${title} - ${speaker}` : title,
    speaker,
    category: 'practice',
    minutes: 0,
    subtitle: subtitleFor(title),
    file: `https://drive.usercontent.google.com/download?id=${f.id}&export=download&confirm=t`,
  };
});

fs.writeFileSync('/tmp/drive-folder-entries.json', JSON.stringify(entries, null, 2));
console.log('entries', entries.length);
console.log(entries[0]);
NODE
```

Expected: `entries` ≈ 31; first object has `category: "practice"` and a Drive `file` URL.

- [ ] **Step 2: Append entries into `src/data/audios.js`**

Print pasteable objects:

```bash
node <<'NODE'
const entries = require('/tmp/drive-folder-entries.json');
function lit(v) {
  return JSON.stringify(v);
}
for (const e of entries) {
  console.log('  {');
  console.log(`    id: ${lit(e.id)},`);
  console.log(`    title: ${lit(e.title)},`);
  console.log(`    paliTitle: ${lit(e.paliTitle)},`);
  console.log(`    speaker: ${lit(e.speaker)},`);
  console.log(`    category: ${lit(e.category)},`);
  console.log(`    minutes: ${e.minutes},`);
  console.log(`    subtitle: ${lit(e.subtitle)},`);
  console.log(`    file: ${lit(e.file)},`);
  console.log('  },');
}
NODE
```

Insert that block after the last existing `dhammaAudios` object (`audio-metta`), before the closing `];`. Use real ids/titles from the generator — never leave `ACTUAL_ID` or `...` placeholders in the committed file.

- [ ] **Step 3: Quick syntax load**

Run:

```bash
node -e 'const {dhammaAudios}=require("./src/data/audios.js"); console.log(dhammaAudios.length); console.log(dhammaAudios.filter(a=>a.id.startsWith("audio-drive-2026-")).length);'
```

Expected: total ≈ `47 + N`; batch length ≈ `N` (≥28).

- [ ] **Step 4: Run tests**

Run:

```bash
npm test -- --testPathPattern=audios.driveFolder.test.js
```

Expected: PASS.

Also run:

```bash
npm test -- --testPathPattern=tabs.test.js
```

Expected: existing audio/tab tests still PASS. Do not weaken unrelated assertions unless they were already failing before this change.

- [ ] **Step 5: Spot-check one download URL**

Run:

```bash
node -e 'const {dhammaAudios}=require("./src/data/audios.js"); const a=dhammaAudios.find(x=>x.id.startsWith("audio-drive-2026-")); console.log(a.id, a.file);'
URL=$(node -e 'const {dhammaAudios}=require("./src/data/audios.js"); console.log(dhammaAudios.find(x=>x.id.startsWith("audio-drive-2026-")).file)')
curl -sI "$URL" | head -n 15
```

Expected: HTTP `200` or a Drive redirect (`302`/`303`) toward content — not `404`. If `403`/HTML login page, report that file’s sharing settings to the user; keep the entry if the folder listing was public (same risk model as existing tracks).

- [ ] **Step 6: Commit**

```bash
git add src/data/audios.js
git commit -m "$(cat <<'EOF'
feat(audio): add practice tracks from shared Drive folder

EOF
)"
```

---

### Task 4: Final verification

**Files:**
- Verify only: `src/data/audios.js`, `__tests__/audios.driveFolder.test.js`

**Interfaces:**
- Consumes: completed Task 3 data
- Produces: confirmation against success criteria in the spec

- [ ] **Step 1: Confirm success criteria**

Run:

```bash
node <<'NODE'
const {dhammaAudios} = require('./src/data/audios.js');
const batch = dhammaAudios.filter(a => a.id.startsWith('audio-drive-2026-'));
const ids = new Set(dhammaAudios.map(a => a.id));
console.log({
  total: dhammaAudios.length,
  batch: batch.length,
  allPractice: batch.every(a => a.category === 'practice'),
  uniqueIds: ids.size === dhammaAudios.length,
  urlOk: batch.every(a =>
    /^https:\/\/drive\.usercontent\.google\.com\/download\?id=[^&]+&export=download&confirm=t$/.test(a.file)
  ),
});
NODE
npm test -- --testPathPattern='audios.driveFolder|tabs'
```

Expected: `allPractice: true`, `uniqueIds: true`, `urlOk: true`, `batch` ≥ 28, tests PASS.

- [ ] **Step 2: No stray scratch commits**

Run:

```bash
git status
```

Expected: clean for this work (or only pre-existing unrelated dirty files such as `src/AppNavigator.jsx` / `__tests__/backHandler.test.js` left untouched).

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| All folder files | Task 1 + Task 3 |
| Category `practice` | Task 2 test + Task 3 |
| Fetch Drive ids | Task 1 |
| Append to `audios.js` only | Task 3 |
| End of array | Task 3 |
| `minutes: 0` | Task 2 + Task 3 |
| URL format | Task 2 + Task 3 |
| Clean titles / speakers / subtitles | Task 3 generator |
| Drive listing order | Task 1 order preserved into Task 3 |
| Out of scope (no UI/download changes) | No tasks touch those files |
| Success criteria | Task 4 |
