import {CachesDirectoryPath, exists, unlink} from '@dr.pogodin/react-native-fs';
import SoundPlayer from 'react-native-sound-player';
import {createTTS, saveAudioToFile} from 'react-native-sherpa-onnx/tts';
import {filePlayUrl} from './audioFiles';
import {getMmsModelDir, isMmsModelReady} from './ttsModel';

/** Slightly slow for calmer Myanmar prose. */
const SPEECH_SPEED = 0.92;
/** Real silence appended after each phrase (not a voiced space). */
const PHRASE_SILENCE_MS = 480;
/** Keep sentences intact; only split very long runs. */
const MAX_CHUNK_CHARS = 220;
/** Merge tiny fragments below this length into the next phrase. */
const MIN_CHUNK_CHARS = 36;

function wavPath() {
  return `${CachesDirectoryPath}/tts-utterance.wav`;
}

let engine = null;
let enginePromise = null;
let queue = [];
let active = false;
let stopRequested = false;
let finishedSub = null;
let playWaitResolve = null;
const listeners = new Set();

function emit(event, payload) {
  listeners.forEach(listener => {
    try {
      listener(event, payload);
    } catch {
      // ignore listener errors
    }
  });
}

function ensureFinishedListener() {
  if (finishedSub) {
    return;
  }
  finishedSub = SoundPlayer.addEventListener('FinishedPlaying', () => {
    const resolve = playWaitResolve;
    playWaitResolve = null;
    resolve?.();
  });
}

async function clearTempWav() {
  const path = wavPath();
  try {
    if (await exists(path)) {
      await unlink(path);
    }
  } catch {
    // ignore
  }
}

/**
 * Map Myanmar punctuation to marks sherpa/MMS understand for phrasing.
 * Collapse whitespace for chunking (spaces are handled later).
 */
function prepareSourceText(text) {
  return String(text)
    .replace(/\u104B/g, '.') // ။ sentence end
    .replace(/\u104A/g, ',') // ၊ comma
    .replace(/[…]+/g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * MMS may voice space and punctuation (including ။ / .).
 * Use those marks only for splitting chunks; strip them before synthesis.
 */
function normalizeForMms(chunk) {
  return String(chunk)
    .replace(/[\u104A\u104B]/g, '') // ၊ ။
    .replace(/[.,!?;:…\-–—'"()[\]{}]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function appendSilence(audio, ms) {
  const n = Math.max(0, Math.floor((audio.sampleRate * ms) / 1000));
  if (n <= 0) {
    return audio;
  }
  const silence = new Array(n).fill(0);
  return {
    ...audio,
    samples: audio.samples.concat(silence),
  };
}

/**
 * Split into sentence-sized pieces on . ? !
 */
function splitSentences(text) {
  const raw = prepareSourceText(text);
  if (!raw) {
    return [];
  }
  const pieces = [];
  let buf = '';
  for (const ch of raw) {
    buf += ch;
    if (ch === '.' || ch === '?' || ch === '!') {
      const trimmed = buf.trim();
      if (trimmed) {
        pieces.push(trimmed);
      }
      buf = '';
    }
  }
  const rest = buf.trim();
  if (rest) {
    pieces.push(rest);
  }
  return pieces.length > 0 ? pieces : [raw];
}

function pushHardBreak(out, buf) {
  const trimmed = buf.trim();
  if (trimmed) {
    out.push(trimmed);
  }
  return '';
}

/**
 * Break long sentences on commas; merge tiny fragments.
 */
function refineChunks(sentences) {
  const rough = [];
  for (const sentence of sentences) {
    if (sentence.length <= MAX_CHUNK_CHARS) {
      rough.push(sentence);
      continue;
    }
    let buf = '';
    for (const ch of sentence) {
      buf += ch;
      const atComma = ch === ',';
      if (atComma && buf.length >= 120) {
        buf = pushHardBreak(rough, buf);
      } else if (buf.length >= MAX_CHUNK_CHARS) {
        const space = buf.lastIndexOf(' ');
        if (space > 24) {
          rough.push(buf.slice(0, space).trim());
          buf = buf.slice(space + 1);
        } else {
          buf = pushHardBreak(rough, buf);
        }
      }
    }
    if (buf.trim()) {
      rough.push(buf.trim());
    }
  }

  const merged = [];
  for (let i = 0; i < rough.length; i += 1) {
    let cur = rough[i];
    while (i + 1 < rough.length && cur.length < MIN_CHUNK_CHARS) {
      i += 1;
      cur = `${cur} ${rough[i]}`.replace(/\s+/g, ' ').trim();
    }
    merged.push(cur);
  }
  return merged;
}

function buildSpeakQueue(parts) {
  const chunks = [];
  for (const part of parts || []) {
    if (typeof part !== 'string') {
      continue;
    }
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }
    for (const chunk of refineChunks(splitSentences(trimmed))) {
      const forModel = normalizeForMms(chunk);
      if (forModel) {
        chunks.push(forModel);
      }
    }
  }
  return chunks;
}

async function getEngine() {
  if (!(await isMmsModelReady())) {
    const error = new Error('MODEL_NOT_READY');
    error.code = 'MODEL_NOT_READY';
    throw error;
  }
  const vitsOptions = {
    lengthScale: 1.08,
    noiseScale: 0.55,
    noiseScaleW: 0.7,
  };

  if (engine) {
    try {
      await engine.updateParams({
        modelType: 'vits',
        modelOptions: {vits: vitsOptions},
      });
    } catch {
      // older session — keep speaking with current params
    }
    return engine;
  }
  if (!enginePromise) {
    enginePromise = createTTS({
      modelPath: {type: 'file', path: getMmsModelDir()},
      modelType: 'vits',
      numThreads: 2,
      silenceScale: 0.25,
      modelOptions: {
        vits: vitsOptions,
      },
    })
      .then(instance => {
        engine = instance;
        return instance;
      })
      .catch(error => {
        enginePromise = null;
        throw error;
      });
  }
  return enginePromise;
}

function waitForPlayback() {
  return new Promise(resolve => {
    playWaitResolve = resolve;
  });
}

async function playUtterance(text, ttsEngine, {addTrailingSilence}) {
  let audio = await ttsEngine.generateSpeech(text, {
    sid: 0,
    speed: SPEECH_SPEED,
    silenceScale: 0.25,
  });
  if (stopRequested) {
    return;
  }
  if (addTrailingSilence) {
    audio = appendSilence(audio, PHRASE_SILENCE_MS);
  }
  const path = wavPath();
  await saveAudioToFile(audio, path);
  if (stopRequested) {
    return;
  }
  ensureFinishedListener();
  const finished = waitForPlayback();
  SoundPlayer.playUrl(filePlayUrl(path));
  await finished;
}

async function speakNext(ttsEngine) {
  while (active && !stopRequested && queue.length > 0) {
    const next = queue.shift();
    const hasMore = queue.length > 0;
    try {
      await playUtterance(next, ttsEngine, {addTrailingSilence: hasMore});
    } catch (error) {
      if (stopRequested) {
        break;
      }
      active = false;
      queue = [];
      emit('error', error);
      await clearTempWav();
      return;
    }
  }
  const wasActive = active;
  active = false;
  queue = [];
  await clearTempWav();
  if (wasActive && !stopRequested) {
    emit('finish');
  }
}

export function subscribeTts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isTtsSpeaking() {
  return active;
}

export async function stopTts() {
  const wasActive = active;
  stopRequested = true;
  queue = [];
  active = false;
  const resolve = playWaitResolve;
  playWaitResolve = null;
  try {
    SoundPlayer.stop();
  } catch {
    // ignore
  }
  resolve?.();
  await clearTempWav();
  if (wasActive) {
    emit('cancel');
  }
  stopRequested = false;
}

/**
 * Speak title + body offline via sherpa MMS with human-like phrasing.
 * Throws MODEL_NOT_READY when the ONNX model is not downloaded yet.
 * @param {string[]} parts
 */
export async function speakText(parts) {
  const utterances = buildSpeakQueue(parts);
  if (utterances.length === 0) {
    return;
  }

  const ttsEngine = await getEngine();
  await stopTts();
  stopRequested = false;
  queue = utterances.slice();
  active = true;
  emit('start');
  try {
    await speakNext(ttsEngine);
  } catch (error) {
    active = false;
    queue = [];
    emit('error', error);
    throw error;
  }
}

/** Release native engine (optional; call on logout / low memory). */
export async function destroyTtsEngine() {
  await stopTts();
  if (engine) {
    try {
      await engine.destroy();
    } catch {
      // ignore
    }
  }
  engine = null;
  enginePromise = null;
}
