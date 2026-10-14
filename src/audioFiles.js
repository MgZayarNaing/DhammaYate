import {
  DocumentDirectoryPath,
  downloadFile,
  exists,
  mkdir,
  stopDownload,
  unlink,
} from '@dr.pogodin/react-native-fs';

export function localAudioPath(audioId) {
  return `${DocumentDirectoryPath}/audio/${audioId}.mp3`;
}

export function filePlayUrl(path) {
  return path.startsWith('file://') ? path : `file://${path}`;
}

export async function audioFileExists(audioId) {
  return exists(localAudioPath(audioId));
}

function wrapError(stage, error) {
  throw new Error(`${stage}: ${error?.message ?? error}`);
}

export class DownloadCancelledError extends Error {
  constructor() {
    super('cancelled');
    this.name = 'DownloadCancelledError';
  }
}

const downloadJobs = new Map();
const cancelledDownloads = new Set();

export async function cancelAudioDownload(audioId) {
  const jobId = downloadJobs.get(audioId);
  if (jobId == null) {
    return false;
  }
  cancelledDownloads.add(audioId);
  try {
    stopDownload(jobId);
  } catch {
    // The download promise still rejects; partial file is removed below.
  }
  await deleteAudioDownload(audioId);
  return true;
}

export async function downloadAudio(audioId, url, onProgress) {
  const dir = `${DocumentDirectoryPath}/audio`;
  try {
    if (!(await exists(dir))) {
      await mkdir(dir);
    }
  } catch (error) {
    wrapError('mkdir', error);
  }
  const toFile = localAudioPath(audioId);
  let result;
  try {
    const {jobId, promise} = downloadFile({
      fromUrl: url,
      toFile,
      progressDivider: 1,
      progress: ({bytesWritten, contentLength}) => {
        if (!onProgress || !(contentLength > 0)) {
          return;
        }
        onProgress(Math.min(1, Math.max(0, bytesWritten / contentLength)));
      },
    });
    if (jobId != null) {
      downloadJobs.set(audioId, jobId);
    }
    result = await promise;
  } catch (error) {
    downloadJobs.delete(audioId);
    await unlink(toFile).catch(() => {});
    if (cancelledDownloads.delete(audioId)) {
      throw new DownloadCancelledError();
    }
    wrapError('network', error);
  } finally {
    downloadJobs.delete(audioId);
  }
  if (cancelledDownloads.delete(audioId)) {
    await unlink(toFile).catch(() => {});
    throw new DownloadCancelledError();
  }
  if (result.statusCode < 200 || result.statusCode >= 300) {
    await unlink(toFile).catch(() => {});
    throw new Error(`HTTP ${result.statusCode}`);
  }
  onProgress?.(1);
  return toFile;
}

export async function deleteAudioDownload(audioId) {
  const path = localAudioPath(audioId);
  if (await exists(path)) {
    await unlink(path);
  }
}
