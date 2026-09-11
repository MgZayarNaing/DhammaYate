import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {getBookById} from '../data/books';
import {TAB_IDS} from '../tabs';
import {loadSettings, saveSettings} from '../storage';
import {FONT_SIZES, getColors} from '../theme';

const AppContext = createContext(null);

export function AppProvider({children}) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 20,
    colorScheme: 'light',
    bookmarks: [],
    lastReadId: null,
    playlists: [],
  });
  const [route, setRoute] = useState({name: 'tabs', tab: 'home'});

  useEffect(() => {
    loadSettings().then(loaded => {
      setSettings(loaded);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    saveSettings(settings).catch(() => {});
  }, [ready, settings]);

  const openTab = useCallback(tab => {
    if (!TAB_IDS.includes(tab)) {
      return;
    }
    setRoute({name: 'tabs', tab});
  }, []);

  const openLibrary = useCallback((from = 'home') => {
    setRoute({name: 'library', from});
  }, []);

  const openBook = useCallback((bookId, from = 'home') => {
    const book = getBookById(bookId);
    if (book?.chapters.length === 1) {
      setRoute({name: 'reader', textId: book.chapters[0].id, from});
      return;
    }
    setRoute({name: 'book', bookId, from});
  }, []);

  const openReader = useCallback((textId, from = 'home', bookId) => {
    setRoute({name: 'reader', textId, from, bookId});
  }, []);

  const openAudio = useCallback((audioId, from = 'audio', playlistId) => {
    setRoute({name: 'audioPlayer', audioId, from, playlistId});
  }, []);

  const openPlaylist = useCallback((playlistId, from = 'audio') => {
    setRoute({name: 'playlist', playlistId, from});
  }, []);

  const openAbout = useCallback(() => {
    setRoute({name: 'about', from: 'settings'});
  }, []);

  const goBack = useCallback(() => {
    setRoute(current => {
      if (current.name === 'reader' && current.from === 'book' && current.bookId) {
        return {name: 'book', bookId: current.bookId, from: 'home'};
      }
      if (current.name === 'reader' && current.from === 'library') {
        return {name: 'library', from: 'home'};
      }
      if (current.name === 'audioPlayer' && current.playlistId) {
        return {name: 'playlist', playlistId: current.playlistId, from: 'audio'};
      }
      if (current.name === 'playlist') {
        return {name: 'tabs', tab: 'audio'};
      }
      if (
        current.name === 'reader' ||
        current.name === 'library' ||
        current.name === 'book' ||
        current.name === 'audioPlayer' ||
        current.name === 'about'
      ) {
        return {
          name: 'tabs',
          tab: TAB_IDS.includes(current.from) ? current.from : 'home',
        };
      }
      return current;
    });
  }, []);

  const toggleBookmark = useCallback(textId => {
    setSettings(current => {
      const exists = current.bookmarks.includes(textId);
      return {
        ...current,
        bookmarks: exists
          ? current.bookmarks.filter(id => id !== textId)
          : [textId, ...current.bookmarks],
      };
    });
  }, []);

  const setFontSize = useCallback(size => {
    setSettings(current => ({...current, fontSize: size}));
  }, []);

  const bumpFontSize = useCallback(delta => {
    setSettings(current => {
      const index = FONT_SIZES.indexOf(current.fontSize);
      const fallback = index === -1 ? 2 : index;
      const next =
        FONT_SIZES[Math.min(FONT_SIZES.length - 1, Math.max(0, fallback + delta))];
      return {...current, fontSize: next};
    });
  }, []);

  const setColorScheme = useCallback(scheme => {
    setSettings(current => ({
      ...current,
      colorScheme: scheme === 'dark' ? 'dark' : 'light',
    }));
  }, []);

  const markLastRead = useCallback(textId => {
    setSettings(current => ({...current, lastReadId: textId}));
  }, []);

  const createPlaylist = useCallback((name, audioIds = []) => {
    const title = String(name ?? '').trim();
    if (!title) {
      return null;
    }
    const selected = Array.isArray(audioIds)
      ? [...new Set(audioIds.filter(id => typeof id === 'string'))]
      : [];
    const playlist = {
      id: `pl-${Date.now()}`,
      name: title,
      audioIds: selected,
    };
    setSettings(current => ({
      ...current,
      playlists: [playlist, ...(current.playlists ?? [])],
    }));
    return playlist;
  }, []);

  const deletePlaylist = useCallback(playlistId => {
    setSettings(current => ({
      ...current,
      playlists: (current.playlists ?? []).filter(item => item.id !== playlistId),
    }));
  }, []);

  const addToPlaylist = useCallback((playlistId, audioId) => {
    setSettings(current => ({
      ...current,
      playlists: (current.playlists ?? []).map(item => {
        if (item.id !== playlistId || item.audioIds.includes(audioId)) {
          return item;
        }
        return {...item, audioIds: [...item.audioIds, audioId]};
      }),
    }));
  }, []);

  const setPlaylistTracks = useCallback((playlistId, audioIds) => {
    const nextIds = Array.isArray(audioIds)
      ? [...new Set(audioIds.filter(id => typeof id === 'string'))]
      : [];
    setSettings(current => ({
      ...current,
      playlists: (current.playlists ?? []).map(item =>
        item.id === playlistId ? {...item, audioIds: nextIds} : item,
      ),
    }));
  }, []);

  const removeFromPlaylist = useCallback((playlistId, audioId) => {
    setSettings(current => ({
      ...current,
      playlists: (current.playlists ?? []).map(item =>
        item.id === playlistId
          ? {...item, audioIds: item.audioIds.filter(id => id !== audioId)}
          : item,
      ),
    }));
  }, []);

  const value = useMemo(
    () => ({
      ready,
      settings,
      route,
      openTab,
      openLibrary,
      openBook,
      openReader,
      openAudio,
      openPlaylist,
      openAbout,
      goBack,
      toggleBookmark,
      setFontSize,
      bumpFontSize,
      setColorScheme,
      markLastRead,
      createPlaylist,
      deletePlaylist,
      addToPlaylist,
      setPlaylistTracks,
      removeFromPlaylist,
    }),
    [
      ready,
      settings,
      route,
      openTab,
      openLibrary,
      openBook,
      openReader,
      openAudio,
      openPlaylist,
      openAbout,
      goBack,
      toggleBookmark,
      setFontSize,
      bumpFontSize,
      setColorScheme,
      markLastRead,
      createPlaylist,
      deletePlaylist,
      addToPlaylist,
      setPlaylistTracks,
      removeFromPlaylist,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error('useApp must be used within AppProvider');
  }
  return value;
}

export function useColors() {
  const {settings} = useApp();
  return getColors(settings.colorScheme);
}
