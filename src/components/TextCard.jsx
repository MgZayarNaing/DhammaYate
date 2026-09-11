import React from 'react';
import {Pressable, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {categoryLabel} from '../data/texts';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

export function TextCard({text, onPress, bookmarked}) {
  const {colors, styles} = useThemedStyles(createStyles);

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
      {bookmarked ? (
        <View style={styles.starRow}>
          <Icon name="bookmark-check" size={14} color={colors.blue} />
          <Text style={styles.star}>မှတ်သားထားသည်</Text>
        </View>
      ) : null}
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
    starRow: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    star: {
      fontFamily: myanmarFont,
      fontSize: 12,
      color: colors.blue,
    },
  };
}
