import {
  DocumentDirectoryPath,
  downloadFile,
  exists,
  mkdir,
  stopDownload,
  unlink,
} from '@dr.pogodin/react-native-fs';

const MODEL_DIR_NAME = 'vits-mms-mya';
const MODEL_FILE = 'model.onnx';
const TOKENS_FILE = 'tokens.txt';

const HF_BASE =
  'https://huggingface.co/willwade/mms-tts-multilingual-models-onnx/resolve/main/mya';

export const MMS_MODEL_URL = `${HF_BASE}/${MODEL_FILE}`;
export const MMS_TOKENS_URL = `${HF_BASE}/${TOKENS_FILE}`;

/** Approximate size used only for progress weighting (model dominates). */
const MODEL_WEIGHT = 0.98;
const TOKENS_WEIGHT = 0.02;

export class TtsModelDownloadCancelledError extends Error {
  constructor() {
    super('cancelled');
    this.name = 'TtsModelDownloadCancelledError';
  }
}

const downloadJobs = new Map();
let cancelled = false;
let downloadInProgress = false;

export function getMmsModelDir() {
  return `${DocumentDirectoryPath}/tts/${MODEL_DIR_NAME}`;
}

export function getMmsModelPath() {
  return `${getMmsModelDir()}/${MODEL_FILE}`;
}

export function getMmsTokensPath() {
  return `${getMmsModelDir()}/${TOKENS_FILE}`;
}

export async function isMmsModelReady() {
  const [hasModel, hasTokens] = await Promise.all([
    exists(getMmsModelPath()),
    exists(getMmsTokensPath()),
  ]);
  return hasModel && hasTokens;
}

async function ensureModelDir() {
  const dir = getMmsModelDir();
  if (!(await exists(dir))) {
    const parent = `${DocumentDirectoryPath}/tts`;
    if (!(await exists(parent))) {
      await mkdir(parent);
    }
    await mkdir(dir);
  }
  return dir;
}

async function downloadOne(key, url, toFile, onFileProgress) {
  const {jobId, promise} = downloadFile({
    fromUrl: url,
    toFile,
    progressDivider: 1,
    progress: ({bytesWritten, contentLength}) => {
      if (!onFileProgress || !(contentLength > 0)) {
        return;
      }
      onFileProgress(Math.min(1, Math.max(0, bytesWritten / contentLength)));
    },
  });
  if (jobId != null) {
    downloadJobs.set(key, jobId);
  }
  try {
    const result = await promise;
    if (cancelled) {
      await unlink(toFile).catch(() => {});
      throw new TtsModelDownloadCancelledError();
    }
    if (result.statusCode < 200 || result.statusCode >= 300) {
      await unlink(toFile).catch(() => {});
      throw new Error(`HTTP ${result.statusCode}`);
    }
    onFileProgress?.(1);
    return toFile;
  } catch (error) {
    await unlink(toFile).catch(() => {});
    if (cancelled || error instanceof TtsModelDownloadCancelledError) {
      throw new TtsModelDownloadCancelledError();
    }
    throw new Error(`network: ${error?.message ?? error}`);
  } finally {
    downloadJobs.delete(key);
  }
}

export async function cancelMmsModelDownload() {
  // Only cancel / wipe when a download is actually running.
  // Leaving Reader must not delete an already-installed model.
  if (!downloadInProgress && downloadJobs.size === 0) {
    return false;
  }
  cancelled = true;
  for (const jobId of downloadJobs.values()) {
    try {
      stopDownload(jobId);
    } catch {
      // ignore
    }
  }
  downloadJobs.clear();
  await deleteMmsModel().catch(() => {});
  downloadInProgress = false;
  return true;
}

export async function deleteMmsModel() {
  const modelPath = getMmsModelPath();
  const tokensPath = getMmsTokensPath();
  if (await exists(modelPath)) {
    await unlink(modelPath);
  }
  if (await exists(tokensPath)) {
    await unlink(tokensPath);
  }
}

/**
 * Download MMS mya model + tokens. Calls onProgress with 0..1.
 * @param {(ratio: number) => void} [onProgress]
 */
export async function downloadMmsModel(onProgress) {
  cancelled = false;
  downloadInProgress = true;
  try {
    await ensureModelDir();

    const tokensPath = getMmsTokensPath();
    const modelPath = getMmsModelPath();

    // Fresh download: remove any partial files.
    await deleteMmsModel();

    const report = ratio => {
      onProgress?.(Math.min(1, Math.max(0, ratio)));
    };

    await downloadOne('tokens', MMS_TOKENS_URL, tokensPath, fileRatio => {
      report(TOKENS_WEIGHT * fileRatio);
    });

    if (cancelled) {
      throw new TtsModelDownloadCancelledError();
    }

    await downloadOne('model', MMS_MODEL_URL, modelPath, fileRatio => {
      report(TOKENS_WEIGHT + MODEL_WEIGHT * fileRatio);
    });

    if (cancelled) {
      await deleteMmsModel();
      throw new TtsModelDownloadCancelledError();
    }

    report(1);
    return getMmsModelDir();
  } finally {
    downloadInProgress = false;
  }
}
