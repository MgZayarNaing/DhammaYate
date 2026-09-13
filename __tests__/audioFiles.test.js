jest.mock('@dr.pogodin/react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/docs',
  downloadFile: jest.fn(() => ({promise: Promise.resolve({statusCode: 200})})),
  exists: jest.fn(async () => false),
  mkdir: jest.fn(async () => {}),
  unlink: jest.fn(async () => {}),
}));

import {downloadFile, exists, unlink} from '@dr.pogodin/react-native-fs';
import {
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
  exists.mockResolvedValueOnce(true);
  downloadFile.mockReturnValueOnce({
    promise: Promise.resolve({statusCode: 404}),
  });
  await expect(
    downloadAudio('audio-mangala', 'https://example.com/a.mp3'),
  ).rejects.toThrow('download failed');
  expect(unlink).toHaveBeenCalledWith('/mock/docs/audio/audio-mangala.mp3');
});
