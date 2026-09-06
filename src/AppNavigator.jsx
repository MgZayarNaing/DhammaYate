import React, {useEffect, useState} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {AppHeader} from './components/AppHeader';
import {BottomTabs} from './components/BottomTabs';
import {TAB_IDS} from './tabs';
import {useColors} from './context/AppContext';
import {useApp} from './context/AppContext';
import {useThemedStyles} from './hooks/useThemedStyles';
import {AboutScreen} from './screens/AboutScreen';
import {AudioPlayerScreen} from './screens/AudioPlayerScreen';
import {AudioScreen} from './screens/AudioScreen';
import {BookChaptersScreen} from './screens/BookChaptersScreen';
import {FavoritesScreen} from './screens/FavoritesScreen';
import {HomeScreen} from './screens/HomeScreen';
import {LibraryScreen} from './screens/LibraryScreen';
import {PlaylistScreen} from './screens/PlaylistScreen';
import {ReaderScreen} from './screens/ReaderScreen';
import {SearchScreen} from './screens/SearchScreen';
import {SettingsScreen} from './screens/SettingsScreen';
import {SplashScreen} from './screens/SplashScreen';

const SPLASH_MS = process.env.JEST_WORKER_ID ? 0 : 1800;

function tabFromRoute(route) {
  if (route.name === 'tabs') {
    return route.tab;
  }
  if (TAB_IDS.includes(route.from)) {
    return route.from;
  }
  return 'home';
}

export function AppNavigator() {
  const {ready, route, openTab} = useApp();
  const colors = useColors();
  const {styles} = useThemedStyles(createStyles);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!ready || !splashDone) {
    return <SplashScreen />;
  }

  const tab = tabFromRoute(route);
  const showBook = route.name === 'book';
  const hideHeader = route.name === 'audioPlayer';
  const hideTabs =
    route.name === 'reader' ||
    route.name === 'library' ||
    route.name === 'audioPlayer' ||
    route.name === 'playlist';

  return (
    <View style={styles.shell}>
      <StatusBar
        barStyle={colors.scheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />
      {hideHeader ? null : <AppHeader />}
      <View style={styles.page}>
        {showBook ? (
          <BookChaptersScreen bookId={route.bookId} />
        ) : (
          <View
            style={styles.page}
            pointerEvents={hideTabs ? 'none' : 'auto'}
            accessibilityElementsHidden={hideTabs}
            importantForAccessibility={hideTabs ? 'no-hide-descendants' : 'auto'}>
            <View style={[styles.page, tab !== 'home' && styles.hidden]}>
              <HomeScreen />
            </View>
            <View style={[styles.page, tab !== 'audio' && styles.hidden]}>
              <AudioScreen />
            </View>
            <View style={[styles.page, tab !== 'search' && styles.hidden]}>
              <SearchScreen />
            </View>
            <View style={[styles.page, tab !== 'favorites' && styles.hidden]}>
              <FavoritesScreen />
            </View>
            <View style={[styles.page, tab !== 'settings' && styles.hidden]}>
              <SettingsScreen />
            </View>
          </View>
        )}
        {route.name === 'library' ? (
          <View style={StyleSheet.absoluteFill}>
            <LibraryScreen />
          </View>
        ) : null}
        {route.name === 'reader' ? (
          <View style={StyleSheet.absoluteFill}>
            <ReaderScreen textId={route.textId} />
          </View>
        ) : null}
        {route.name === 'about' ? (
          <View style={StyleSheet.absoluteFill}>
            <AboutScreen />
          </View>
        ) : null}
        {route.name === 'playlist' ? (
          <View style={StyleSheet.absoluteFill}>
            <PlaylistScreen playlistId={route.playlistId} />
          </View>
        ) : null}
      </View>
      {hideTabs ? null : <BottomTabs active={tab} onChange={openTab} />}
      {route.name === 'audioPlayer' ? (
        <View style={StyleSheet.absoluteFill}>
          <AudioPlayerScreen audioId={route.audioId} />
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors) {
  return {
    shell: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    page: {
      flex: 1,
    },
    hidden: {
      display: 'none',
    },
  };
}
