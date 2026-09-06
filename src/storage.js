import AsyncStorage from '@react-native-async-storage/async-storage';
import {DEFAULT_COLOR_SCHEME, DEFAULT_FONT_SIZE} from './theme';

const STORAGE_KEY = 'dhammaapp.settings.v1';

export const defaultSettings = {
  fontSize: DEFAULT_FONT_SIZE,
  colorScheme: DEFAULT_COLOR_SCHEME,
  bookmarks: [],
  lastReadId: null,
  playlists: [],
};

function parsePlaylists(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter(item => item && typeof item.id === 'string' && typeof item.name === 'string')
    .map(item => ({
      id: item.id,
      name: item.name,
      audioIds: Array.isArray(item.audioIds)
        ? item.audioIds.filter(id => typeof id === 'string')
        : [],
    }));
}

function isColorScheme(value) {
  return value === 'light' || value === 'dark';
}

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultSettings;
    }
    const parsed = JSON.parse(raw);
    return {
      fontSize:
        typeof parsed.fontSize === 'number' ? parsed.fontSize : DEFAULT_FONT_SIZE,
      colorScheme: isColorScheme(parsed.colorScheme)
        ? parsed.colorScheme
        : parsed.readingTheme === 'night'
          ? 'dark'
          : DEFAULT_COLOR_SCHEME,
      bookmarks: Array.isArray(parsed.bookmarks)
        ? parsed.bookmarks.filter(id => typeof id === 'string')
        : [],
      lastReadId:
        typeof parsed.lastReadId === 'string' ? parsed.lastReadId : null,
      playlists: parsePlaylists(parsed.playlists),
    };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
