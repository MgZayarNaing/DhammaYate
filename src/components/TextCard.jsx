import React from 'react';
import {Pressable, Text} from 'react-native';
import {categoryLabel} from '../data/texts';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

export function TextCard({text, onPress, bookmarked}) {
  const {styles} = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={text.title}>
      <Text style={styles.category}>{categoryLabel[text.category]}</Text>
      <Text style={styles.title}>{text.title}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {text.subtitle}
      </Text>
      {bookmarked ? <Text style={styles.star}>★ မှတ်သားထားသည်</Text> : null}
    </Pressable>
  );
}

function createStyles(colors) {
  return {
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.line,
    },
    pressed: {
      opacity: 0.85,
    },
    category: {
      marginBottom: 8,
      fontFamily: myanmarFont,
      fontSize: 12,
      color: colors.blue,
      fontWeight: '600',
    },
    title: {
      fontFamily: myanmarFont,
      fontSize: 20,
      color: colors.ink,
      fontWeight: '700',
      lineHeight: 32,
    },
    subtitle: {
      marginTop: 8,
      fontFamily: myanmarFont,
      fontSize: 14,
      color: colors.cardMuted,
      lineHeight: 24,
    },
    star: {
      marginTop: 10,
      fontFamily: myanmarFont,
      fontSize: 12,
      color: colors.blue,
    },
  };
}
