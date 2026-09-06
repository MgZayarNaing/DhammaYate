import React from 'react';
import {StatusBar, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {APP_NAME} from '../data/appLinks';
import {myanmarFont} from '../theme';

export function SplashScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.body}>
        <View style={styles.mark}>
          <Text style={styles.markIcon}>☸</Text>
        </View>
        <Text style={styles.title}>{APP_NAME}</Text>
      </View>
      <Text style={[styles.credit, {paddingBottom: Math.max(insets.bottom, 16) + 8}]}>
        Developed by OIT
      </Text>
    </View>
  );
}

const styles = {
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markIcon: {
    fontSize: 42,
    color: '#ffffff',
  },
  title: {
    marginTop: 20,
    fontFamily: myanmarFont,
    fontSize: 32,
    fontWeight: '700',
    color: '#111111',
    lineHeight: 44,
  },
  credit: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6f6f6f',
    letterSpacing: 0.3,
  },
};
