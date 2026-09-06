import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useApp} from '../context/AppContext';
import {APP_NAME} from '../data/appLinks';
import {getAudioById} from '../data/audios';
import {getBookById} from '../data/books';
import {getTextById} from '../data/texts';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

function headerState(route, openTab, goBack, playlists) {
  if (route.name === 'tabs' && route.tab === 'home') {
    return {mode: 'brand', title: APP_NAME};
  }

  if (route.name === 'tabs') {
    const titles = {
      audio: 'အသံဖိုင်များ',
      search: 'Search',
      favorites: 'စိတ်ကြိုက်စာရင်း',
      settings: 'Setting',
    };
    return {
      mode: 'back',
      title: titles[route.tab] ?? APP_NAME,
      onBack: () => openTab('home'),
    };
  }

  if (route.name === 'book') {
    return {
      mode: 'back',
      title: getBookById(route.bookId)?.title ?? 'ဂုဏ်တော်',
      onBack: goBack,
    };
  }

  if (route.name === 'reader') {
    return {
      mode: 'back',
      title: getTextById(route.textId)?.title ?? 'ဖတ်ရှုရန်',
      onBack: goBack,
    };
  }

  if (route.name === 'audioPlayer') {
    return {
      mode: 'back',
      title: getAudioById(route.audioId)?.title ?? 'အသံဖိုင်',
      onBack: goBack,
    };
  }

  if (route.name === 'playlist') {
    const playlist = (playlists ?? []).find(item => item.id === route.playlistId);
    return {
      mode: 'back',
      title: playlist?.name ?? 'Playlist',
      onBack: goBack,
    };
  }

  if (route.name === 'library') {
    return {mode: 'back', title: 'စာကြည့်တိုက်', onBack: goBack};
  }

  if (route.name === 'about') {
    return {mode: 'back', title: 'About', onBack: goBack};
  }

  return {mode: 'brand', title: APP_NAME};
}

export function AppHeader() {
  const insets = useSafeAreaInsets();
  const {route, goBack, openTab, settings} = useApp();
  const {styles} = useThemedStyles(createStyles);
  const header = headerState(route, openTab, goBack, settings.playlists);

  return (
    <View style={[styles.bar, {paddingTop: insets.top + 10}]}>
      {header.mode === 'brand' ? (
        <Text style={styles.brand}>{APP_NAME}</Text>
      ) : (
        <View style={styles.row}>
          <Pressable
            onPress={header.onBack}
            style={styles.side}
            hitSlop={12}
            accessibilityLabel="နောက်သို့">
            <Text style={styles.back}>‹ နောက်</Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {header.title}
          </Text>
          <View style={styles.side} />
        </View>
      )}
    </View>
  );
}

function createStyles(colors) {
  return {
    bar: {
      backgroundColor: colors.bg,
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
    },
    brand: {
      fontFamily: myanmarFont,
      fontSize: 22,
      fontWeight: '700',
      color: colors.ink,
      textAlign: 'center',
      lineHeight: 32,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 32,
    },
    side: {
      width: 72,
    },
    back: {
      fontFamily: myanmarFont,
      fontSize: 16,
      fontWeight: '600',
      color: colors.ink,
    },
    title: {
      flex: 1,
      fontFamily: myanmarFont,
      fontSize: 17,
      fontWeight: '700',
      color: colors.ink,
      textAlign: 'center',
      lineHeight: 26,
    },
  };
}
