import {TAB_IDS, tabs} from '../src/tabs';
import {
  dhammaAudios,
  getAdjacentAudio,
  getAudioById,
  getDownloadsPlaylist,
  getPlaylistQueue,
  resolvePlaylist,
  DOWNLOADS_PLAYLIST_ID,
} from '../src/data/audios';

test('bottom tabs match the requested sections', () => {
  expect(TAB_IDS).toEqual(['home', 'audio', 'search', 'favorites', 'settings']);
  expect(tabs.map(tab => tab.label)).toEqual([
    'Home',
    'အသံဖိုင်များ',
    'Search',
    'စိတ်ကြိုက်စာရင်း',
    'Setting',
  ]);
});

test('includes sample audio talks', () => {
  expect(dhammaAudios.length).toBeGreaterThanOrEqual(6);
  expect(getAudioById('audio-myittasuta-minguansayadaw')?.title).toBe('မေတ္တာသုတ်');
  expect(getAudioById('audio-myittasuta-minguansayadaw')?.paliTitle).toBe(
    'မေတ္တာသုတ် - မင်းကွန်းဆရာတော်',
  );
});

test('playlist queue stays in custom order', () => {
  const queue = getPlaylistQueue({
    id: 'pl-1',
    name: 'နံနက်',
    audioIds: ['audio-yadanasuta-minguansayadaw', 'audio-myittasuta-minguansayadaw'],
  });
  expect(queue.map(item => item.id)).toEqual([
    'audio-yadanasuta-minguansayadaw',
    'audio-myittasuta-minguansayadaw',
  ]);
  expect(
    getAdjacentAudio('audio-yadanasuta-minguansayadaw', 1, queue)?.id,
  ).toBe('audio-myittasuta-minguansayadaw');
});

test('downloads playlist is derived from downloaded ids', () => {
  expect(getDownloadsPlaylist([])).toBeNull();
  expect(getDownloadsPlaylist(undefined)).toBeNull();

  const playlist = getDownloadsPlaylist([
    'audio-myittasuta-minguansayadaw',
    'audio-yadanasuta-minguansayadaw',
    'missing',
  ]);
  expect(playlist).toEqual({
    id: DOWNLOADS_PLAYLIST_ID,
    name: 'ဒေါင်းလုဒ်',
    audioIds: ['audio-myittasuta-minguansayadaw', 'audio-yadanasuta-minguansayadaw'],
  });

  expect(
    resolvePlaylist(DOWNLOADS_PLAYLIST_ID, {
      downloadedAudioIds: [
        'audio-yadanasuta-minguansayadaw',
        'audio-myittasuta-minguansayadaw',
      ],
      playlists: [],
    })?.audioIds,
  ).toEqual(['audio-yadanasuta-minguansayadaw', 'audio-myittasuta-minguansayadaw']);
});
