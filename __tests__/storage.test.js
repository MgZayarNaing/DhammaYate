import AsyncStorage from '@react-native-async-storage/async-storage';
import {defaultSettings, loadSettings, saveSettings} from '../src/storage';

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: async key => store[key] ?? null,
      setItem: async (key, value) => {
        store[key] = value;
      },
    },
  };
});

beforeEach(async () => {
  await AsyncStorage.setItem('dhammaapp.settings.v1', JSON.stringify({}));
});

test('round-trips downloaded audio ids', async () => {
  await saveSettings({
    ...defaultSettings,
    downloadedAudioIds: ['audio-mangala'],
  });
  const loaded = await loadSettings();
  expect(loaded.downloadedAudioIds).toEqual(['audio-mangala']);
});

test('missing downloaded list becomes empty', async () => {
  await AsyncStorage.setItem(
    'dhammaapp.settings.v1',
    JSON.stringify({fontSize: 20}),
  );
  const loaded = await loadSettings();
  expect(loaded.downloadedAudioIds).toEqual([]);
});
