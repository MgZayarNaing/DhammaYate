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
  expect(getAudioById('audio-metta')?.title).toBe(
    'မေတ္တာသုတ် - အရှင်သုဇာတ (မေတ္တာအေးဆရာတော်)',
  );
});

test('playlist queue stays in custom order', () => {
  const queue = getPlaylistQueue({
    id: 'pl-1',
    name: 'နံနက်',
    audioIds: ['audio-mangala', 'audio-metta'],
  });
  expect(queue.map(item => item.id)).toEqual(['audio-mangala', 'audio-metta']);
  expect(getAdjacentAudio('audio-mangala', 1, queue)?.id).toBe('audio-metta');
});

test('downloads playlist is derived from downloaded ids', () => {
  expect(getDownloadsPlaylist([])).toBeNull();
  expect(getDownloadsPlaylist(undefined)).toBeNull();

  const playlist = getDownloadsPlaylist(['audio-metta', 'audio-mangala', 'missing']);
  expect(playlist).toEqual({
    id: DOWNLOADS_PLAYLIST_ID,
    name: 'ဒေါင်းလုဒ်',
    audioIds: ['audio-metta', 'audio-mangala'],
  });

  expect(
    resolvePlaylist(DOWNLOADS_PLAYLIST_ID, {
      downloadedAudioIds: ['audio-mangala', 'audio-metta'],
      playlists: [],
    })?.audioIds,
  ).toEqual(['audio-mangala', 'audio-metta']);
});
