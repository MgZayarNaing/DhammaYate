jest.mock('@dr.pogodin/react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/docs',
  downloadFile: jest.fn(() => ({promise: Promise.resolve({statusCode: 200})})),
  exists: jest.fn(async () => false),
  mkdir: jest.fn(async () => {}),
  stopDownload: jest.fn(),
  unlink: jest.fn(async () => {}),
}));

import {downloadFile, stopDownload, unlink} from '@dr.pogodin/react-native-fs';
import {
  cancelAudioDownload,
  DownloadCancelledError,
  downloadAudio,
  filePlayUrl,
  localAudioPath,
} from '../src/audioFiles';

test('keeps downloads in the app documents folder', () => {
  expect(localAudioPath('audio-mangala')).toBe(
    '/mock/docs/audio/audio-mangala.mp3',
  );
});

test('player urls use the file scheme', () => {
  expect(filePlayUrl('/mock/docs/audio/a.mp3')).toBe(
    'file:///mock/docs/audio/a.mp3',
  );
});

test('failed download does not keep a partial file', async () => {
  const {exists} = require('@dr.pogodin/react-native-fs');
  exists.mockResolvedValueOnce(true);
  downloadFile.mockReturnValueOnce({
    promise: Promise.resolve({statusCode: 404}),
  });
  await expect(
    downloadAudio('audio-mangala', 'https://example.com/a.mp3'),
  ).rejects.toThrow('HTTP 404');
  expect(unlink).toHaveBeenCalledWith('/mock/docs/audio/audio-mangala.mp3');
});

test('reports download progress ratios', async () => {
  const {exists} = require('@dr.pogodin/react-native-fs');
  exists.mockResolvedValueOnce(true);
  downloadFile.mockImplementationOnce(options => {
    options.progress({bytesWritten: 50, contentLength: 100});
    options.progress({bytesWritten: 100, contentLength: 100});
    return {promise: Promise.resolve({statusCode: 200})};
  });
  const ratios = [];
  await downloadAudio(
    'audio-mangala',
    'https://example.com/a.mp3',
    ratio => ratios.push(ratio),
  );
  expect(ratios).toEqual([0.5, 1, 1]);
  expect(downloadFile).toHaveBeenCalledWith(
    expect.objectContaining({progressDivider: 1}),
  );
});

test('skips progress when content length is unknown', async () => {
  const {exists} = require('@dr.pogodin/react-native-fs');
  exists.mockResolvedValueOnce(true);
  downloadFile.mockImplementationOnce(options => {
    options.progress({bytesWritten: 50, contentLength: 0});
    return {promise: Promise.resolve({statusCode: 200})};
  });
  const ratios = [];
  await downloadAudio(
    'audio-mangala',
    'https://example.com/a.mp3',
    ratio => ratios.push(ratio),
  );
  expect(ratios).toEqual([1]);
});

test('cancel stops the job and drops the partial file', async () => {
  const {exists} = require('@dr.pogodin/react-native-fs');
  exists.mockResolvedValue(true);
  let rejectDownload;
  downloadFile.mockImplementationOnce(() => ({
    jobId: 7,
    promise: new Promise((_, reject) => {
      rejectDownload = reject;
    }),
  }));

  const pending = downloadAudio('audio-mangala', 'https://example.com/a.mp3');
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));

  await expect(cancelAudioDownload('audio-mangala')).resolves.toBe(true);
  expect(stopDownload).toHaveBeenCalledWith(7);
  rejectDownload(new Error('aborted'));
  await expect(pending).rejects.toBeInstanceOf(DownloadCancelledError);
  expect(unlink).toHaveBeenCalledWith('/mock/docs/audio/audio-mangala.mp3');
});
