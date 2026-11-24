# Reader text-to-speech (TTS) design

**Date:** 2026-11-23  
**Status:** Chosen path implemented (iterate on quality)

## Goal

Let users **listen** to Reader text (title + paragraphs) on iOS and Android without needing pre-recorded audio for every chapter. Prefer offline use after setup, keep the app install size small, and keep UX simple (one speaker control on Reader).

## Scope

| In | Out |
|----|-----|
| Speak Reader content on demand | Replacing the Audio tab / recorded dhamma tracks |
| First-time model download if needed | Bundling a huge model inside the store binary |
| Phrasing / pause tuning for Myanmar | Perfect human audiobook quality |
| Attribution for third-party model license | Cloud billing / backend TTS API |

## Problem

- Reader texts are Myanmar prose; many devices have **no usable Myanmar system voice** (especially iOS).
- Asking users to dig through Accessibility settings is fragile and fails on many phones.
- Pre-recording every text is high quality but slow and heavy to produce.
- Any on-device neural voice has a **quality ceiling**; punctuation/spaces can be “spoken” as noise if sent raw to some models.

---

## Ways to do TTS (options compared)

### Way A — OS / system TTS (`react-native-tts` or similar)

Use the phone’s built-in speech engine. App sends text; OS picks a voice.

| Pros | Cons |
|------|------|
| Small app size | Myanmar voice often **missing** (iOS has no Burmese system voice) |
| No big model download | Android quality varies by OEM / Google voice pack |
| Simple integration | User must install language data manually |
| Works offline once voice exists | Inconsistent across devices |

**Best when:** Target language is well supported by Apple/Google voices (e.g. English).

---

### Way B — Cloud TTS (Azure / Google / etc.)

App (via a backend) sends text to a cloud API; returns audio or streams speech.

| Pros | Cons |
|------|------|
| Often more natural Myanmar voices (e.g. Azure Neural) | Needs **network** every listen (or cache strategy) |
| Small app binary | Free tiers are **limited**; overage costs money |
| No 100MB+ on-device model | Must **not** put API keys in the app — needs a server |
| Consistent quality | Privacy / dependency on vendor |

**Best when:** You can run a small backend and accept ongoing cost or a free-tier cap.

---

### Way C — Offline neural model in-app (sherpa-onnx + ONNX voice)

Ship or download a Myanmar ONNX model; synthesize on device with a native engine (sherpa-onnx).

| Pros | Cons |
|------|------|
| Works **offline after first download** | Voice quality mid-tier (research models) |
| Same behavior on iOS + Android | First download ~**100MB+** |
| No per-character cloud bill | Some models are **CC-BY-NC** (non-commercial) |
| Controllable pacing / chunking in app | Native deps + patches; more engineering |

**Variants of delivery:**

| Delivery | Pros | Cons |
|----------|------|------|
| Bundle model in IPA/APK | Always ready offline | Huge install / store size |
| **First-play download** to Documents | Small install; then offline | Needs Wi‑Fi once; progress UX |

**Best when:** You need Myanmar on both platforms without relying on OS voices, and can accept model quality + license terms.

---

### Way D — Link Reader texts to recorded audio

Map each text (or book chapter) to an existing `dhammaAudios` track and open the audio player.

| Pros | Cons |
|------|------|
| Most natural (human speaker) | Expensive / slow to produce for every text |
| Fits existing Audio player UX | Not every Reader text has a matching recording |
| Offline if user downloaded the track | Different product from “read this screen aloud” |

**Best when:** High-value texts already have (or will have) curated recordings.

---

### Way E — Hybrid

Examples: OS TTS when Myanmar voice exists; else download offline model. Or Reader speak for drafts + recorded audio when `audioId` exists.

| Pros | Cons |
|------|------|
| Best of several worlds | More branches, testing, and UX explanation |
| Can upgrade quality over time | Harder for juniors to reason about |

---

## Decision for now

| Decision         | Choice                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Primary approach | **Way C — Offline neural (sherpa-onnx + Meta MMS Burmese** `mya`**) MMS means Massively Multilingual Speech**               |
| Model delivery   | **First-play download** (~114MB ONNX + tokens), not bundled in the binary                                                   |
| Engine           | `react-native-sherpa-onnx` (VITS / character frontend)                                                                      |
| Where            | Reader screen only (speaker control)                                                                                        |
| Not chosen now   | Way A (OS) as primary — fails on iOS Myanmar                                                                                |
| Not chosen now   | Way B (cloud) — needs backend + cost/network                                                                                |
| Not chosen now   | Way D as primary — incomplete coverage                                                                                      |
| License note     | Meta MMS is **CC-BY-NC 4.0**; call out in About / download dialog. App has ads — treat as accepted risk for this experiment |

### Why this choice

1. **iOS + Android** must hear Myanmar without system voice packs.
2. Users expect **offline** reading after setup (same spirit as offline texts).
3. Keep **store install size** small → download model once.
4. No TTS backend to operate yet.
5. Accept mid quality; improve with **text cleaning + real silence** between phrases (not by swapping model yet).

---

## Product / logic flow

1. User opens a Reader text and taps **speak**.
2. App checks: are model files present on disk?
3. If **no** → confirm (~114MB, Wi‑Fi once, license line) → download with progress → then speak.
4. If **yes** → prepare text:
   - Split into phrases using sentence ends (`။` treated as boundaries).  
   - **Do not** send spaces / `။` / other punctuation to the model (they can be “voiced” as noise).  
   - Pauses = **real silence** between phrase audio, not spoken characters.
5. For each phrase: synthesize → optional trailing silence → play → next.
6. Stop cancels queue and playback. Leaving Reader stops speech; cancel download only if a download is **in progress** (never delete a finished model on navigate away).

---

## Quality limits (honest)

| Expectation | Reality with current model |
|-------------|----------------------------|
| Human monk / studio recording | No — MMS is research-grade |
| Stable Myanmar on all devices | Yes, after model download |
| Natural pause at `။` | Silence we insert, not the glyph itself |
| Zero first-run wait | No — one large download |

---

## Success criteria

- Speak works on **iOS and Android** after one model download.  
- Returning to Reader does **not** ask to download again if files remain.  
- Spaces / `။` do not produce buzz/click; pauses are quiet.  
- Stop and leave-screen behave safely.  
- About (and first download) mention Meta MMS + CC-BY-NC.  
- Recorded Audio tab remains unchanged.

## Out of scope (for this decision)

- Bundling the ONNX model in the store build  
- Cloud TTS backend  
- Per-text human recording pipeline  
- Background download manager / OS TTS fallback as primary path
