import React from 'react';
import {Pressable, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {categoryLabel} from '../data/texts';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {MmText} from './MmText';

export function TextCard({text, onPress, bookmarked}) {
  const {colors, styles} = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={text.title}>
      <MmText style={styles.category}>{categoryLabel[text.category]}</MmText>
      <MmText style={styles.title}>{text.title}</MmText>
      <MmText style={styles.subtitle} numberOfLines={2}>
        {text.subtitle}
      </MmText>
      {bookmarked ? (
        <View style={styles.starRow}>
          <Icon name="bookmark-check" size={14} color={colors.blue} />
          <MmText style={styles.star}>မှတ်သားထားသည်</MmText>
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
      fontSize: 12,
      color: colors.blue,
      lineHeight: 22,
    },
    title: {
      fontSize: 20,
      color: colors.ink,
      lineHeight: 40,
    },
    subtitle: {
      marginTop: 8,
      fontSize: 14,
      color: colors.cardMuted,
      lineHeight: 28,
    },
    starRow: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    star: {
      fontSize: 12,
      color: colors.blue,
      lineHeight: 22,
    },
  };
}
