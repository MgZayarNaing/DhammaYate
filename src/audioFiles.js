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

export async function downloadAudio(audioId, url) {
  const dir = `${DocumentDirectoryPath}/audio`;
  if (!(await exists(dir))) {
    await mkdir(dir);
  }
  const toFile = localAudioPath(audioId);
  const {promise} = downloadFile({fromUrl: url, toFile});
  const result = await promise;
  if (result.statusCode < 200 || result.statusCode >= 300) {
    await unlink(toFile).catch(() => {});
    throw new Error('download failed');
  }
  return toFile;
}

export async function deleteAudioDownload(audioId) {
  const path = localAudioPath(audioId);
  if (await exists(path)) {
    await unlink(path);
  }
}
