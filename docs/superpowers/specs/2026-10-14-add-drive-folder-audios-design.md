# Add Drive folder audios to `audios.js`

**Date:** 2026-10-14  
**Status:** Approved for planning

## Goal

Add all audio files from the shared Google Drive folder to `dhammaAudios` in `src/data/audios.js`, using the same entry shape and download URL pattern as existing tracks.

**Source folder:** https://drive.google.com/drive/u/2/folders/1ikypoU1Dz4F-y_2Hi39_fDTLsB-RCUgu  
(~31 `.m4a` files)

## Decisions

| Decision | Choice |
|----------|--------|
| Scope | All files in the folder |
| Category | `"practice"` for every new entry |
| File IDs | Fetch from the public shared folder |
| Implementation | Append objects to existing `audios.js` (no new data files, scripts, or UI) |
| Placement | End of `dhammaAudios` array |
| Duration | `minutes: 0` (match existing) |

## Data shape (unchanged)

Each entry:

```js
{
  id: "audio-<stable-slug>",
  title: "<short Burmese title>",
  paliTitle: "<full title + speaker when known>",
  speaker: "<parsed speaker or short label>",
  category: "practice",
  minutes: 0,
  subtitle: "<short topic label>",
  file: "https://drive.usercontent.google.com/download?id=<FILE_ID>&export=download&confirm=t",
}
```

### Title / metadata rules

- Strip Drive noise: `Audio**`, `(M4A_…)`, truncated suffixes where needed.
- Prefer readable Burmese titles from the filename.
- Parse speaker when present in the name (e.g. သစ္စာရွှေစည်ဆရာတော် အရှင်ဥတ္တမ).
- `subtitle`: short topic (e.g. ပါရမီတရားတော်, မေတ္တာ, သီလ, ဂုဏ်တော်, သစ္စာ).
- `id`: ASCII slug from speaker/topic; unique across the array.

### Ordering

Keep Drive listing order so numbered series (e.g. ဒါနပါရမီ … ဥပက္ခာပါရမီ) stay together.

## Out of scope

- New screens, filters, or category chips for audio
- Measuring real durations
- Local bundling of audio files
- Changing download/playback code (`audioFiles.js`, player UI)
- Re-categorizing existing tracks

## Risks

- Files must remain shared for “anyone with the link” download; otherwise playback/download fails.
- Filenames may be truncated in Drive listing; clean best-effort titles from available text.
- Large files (~40–100 MB) already match how existing Drive-backed tracks work; no special handling.

## Success criteria

- All folder files appear in the audio list as `practice` tracks.
- Each `file` URL uses a real Drive file id and the existing download URL format.
- No changes outside `src/data/audios.js` (unless a filename collision forces an id tweak only in that file).
