import React from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useApp} from '../context/AppContext';
import {APP_NAME} from '../data/appLinks';
import {getAudioById, resolvePlaylist} from '../data/audios';
import {getBookById} from '../data/books';
import {getTextById} from '../data/texts';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {BackLink} from './BackLink';
import {MmText} from './MmText';

function headerState(route, openTab, goBack, settings) {
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
    const playlist = resolvePlaylist(route.playlistId, settings);
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
  const header = headerState(route, openTab, goBack, settings);

  return (
    <View style={[styles.bar, {paddingTop: insets.top + 10}]}>
      {header.mode === 'brand' ? (
        <MmText style={styles.brand}>{APP_NAME}</MmText>
      ) : (
        <View style={styles.row}>
          <View style={styles.side}>
            <BackLink onPress={header.onBack} />
          </View>
          <MmText style={styles.title} numberOfLines={2}>
            {header.title}
          </MmText>
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
      fontSize: 22,
      color: colors.ink,
      textAlign: 'center',
      lineHeight: 40,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 40,
    },
    side: {
      width: 72,
    },
    title: {
      flex: 1,
      fontSize: 17,
      color: colors.ink,
      textAlign: 'center',
      lineHeight: 34,
    },
  };
}
