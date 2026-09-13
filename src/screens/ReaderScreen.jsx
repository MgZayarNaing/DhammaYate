import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useApp} from '../context/AppContext';
import {getTextById} from '../data/texts';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

export function ReaderScreen({textId}) {
  const insets = useSafeAreaInsets();
  const {settings, goBack, toggleBookmark, bumpFontSize, markLastRead} = useApp();
  const {colors, styles} = useThemedStyles(createStyles);
  const text = getTextById(textId);
  const bookmarked = settings.bookmarks.includes(textId);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    markLastRead(textId);
  }, [markLastRead, textId]);

  const onScroll = event => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const max = contentSize.height - layoutMeasurement.height;
    if (max <= 0) {
      setProgress(1);
      return;
    }
    setProgress(Math.min(1, Math.max(0, contentOffset.y / max)));
  };

  if (!text) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>စာမတွေ့ပါ။</Text>
        <Pressable onPress={goBack}>
          <Text style={styles.backLink}>ပြန်သွားရန်</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.tools}>
          <Pressable onPress={() => bumpFontSize(-1)} hitSlop={8} accessibilityLabel="စာလုံးသေး">
            <Text style={styles.tool}>က-</Text>
          </Pressable>
          <Pressable onPress={() => bumpFontSize(1)} hitSlop={8} accessibilityLabel="စာလုံးကြီး">
            <Text style={styles.tool}>က+</Text>
          </Pressable>
          <Pressable
            onPress={() => toggleBookmark(text.id)}
            hitSlop={8}
            accessibilityLabel="မှတ်သားရန်">
            <Icon
              name={bookmarked ? 'bookmark-check' : 'bookmark-outline'}
              size={22}
              color={colors.ink}
            />
          </Pressable>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, {width: `${Math.round(progress * 100)}%`}]} />
      </View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.body, {paddingBottom: insets.bottom + 40}]}>
        <Text style={styles.title}>{text.title}</Text>
        <Text style={styles.subtitle}>{text.subtitle}</Text>
        {text.paragraphs.map((paragraph, index) => (
          <Text
            key={`${text.id}-${index}`}
            style={[
              styles.paragraph,
              {
                fontSize: settings.fontSize,
                lineHeight: Math.round(settings.fontSize * 1.85),
              },
            ]}>
            {paragraph}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(colors) {
  return {
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    topBar: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
      backgroundColor: colors.bg,
    },
    tools: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    tool: {
      fontFamily: myanmarFont,
      fontSize: 16,
      fontWeight: '600',
      color: colors.ink,
    },
    starOn: {
      color: colors.ink,
    },
    progressTrack: {
      height: 3,
      backgroundColor: colors.parchment,
    },
    progressFill: {
      height: 3,
      backgroundColor: colors.ink,
    },
    body: {
      paddingHorizontal: 22,
      paddingTop: 24,
    },
    title: {
      marginTop: 0,
      fontFamily: myanmarFont,
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 42,
      color: colors.ink,
    },
    subtitle: {
      marginTop: 8,
      marginBottom: 8,
      fontFamily: myanmarFont,
      fontSize: 15,
      lineHeight: 26,
      color: colors.muted,
    },
    paragraph: {
      fontFamily: myanmarFont,
      marginTop: 16,
      color: colors.ink,
    },
    missing: {
      flex: 1,
      backgroundColor: colors.bg,
      alignItems: 'center',
      paddingTop: 20,
    },
    missingText: {
      fontFamily: myanmarFont,
      fontSize: 16,
      color: colors.ink,
    },
    backLink: {
      marginTop: 12,
      fontFamily: myanmarFont,
      color: colors.ink,
      fontSize: 15,
    },
  };
}
