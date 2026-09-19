import {
  DocumentDirectoryPath,
  downloadFile,
  exists,
  mkdir,
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
    const {promise} = downloadFile({
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
    result = await promise;
  } catch (error) {
    wrapError('network', error);
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
