import {useEffect, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {MmText} from '../components/MmText';
import {useApp} from '../context/AppContext';
import {getTextById} from '../data/texts';
import {useThemedStyles} from '../hooks/useThemedStyles';

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
        <MmText style={styles.missingText}>စာမတွေ့ပါ။</MmText>
        <Pressable onPress={goBack}>
          <MmText style={styles.backLink}>ပြန်သွားရန်</MmText>
        </Pressable>
      </View>
    );
  }

  const bodySize = settings.fontSize;
  const bodyLineHeight = Math.round(bodySize * 2.2);

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.tools}>
          <Pressable onPress={() => bumpFontSize(-1)} hitSlop={8} accessibilityLabel="စာလုံးသေး">
            <MmText style={styles.tool}>က-</MmText>
          </Pressable>
          <Pressable onPress={() => bumpFontSize(1)} hitSlop={8} accessibilityLabel="စာလုံးကြီး">
            <MmText style={styles.tool}>က+</MmText>
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
        <MmText style={styles.title}>{text.title}</MmText>
        <MmText style={styles.subtitle}>{text.subtitle}</MmText>
        {text.paragraphs.map((paragraph, index) => (
          <MmText
            key={`${text.id}-${index}`}
            style={[styles.paragraph, {fontSize: bodySize, lineHeight: bodyLineHeight}]}>
            {paragraph}
          </MmText>
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
      fontSize: 16,
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
      fontSize: 28,
      lineHeight: 52,
      color: colors.ink,
    },
    subtitle: {
      marginTop: 8,
      marginBottom: 8,
      fontSize: 15,
      lineHeight: 32,
      color: colors.muted,
    },
    paragraph: {
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
      fontSize: 16,
      color: colors.ink,
      lineHeight: 30,
    },
    backLink: {
      marginTop: 12,
      color: colors.ink,
      fontSize: 15,
      lineHeight: 28,
    },
  };
}
