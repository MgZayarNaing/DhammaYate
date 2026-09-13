import React from 'react';
import {Pressable, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

export function BookCover({book, onPress}) {
  const {colors, styles} = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={book.title}>
      <View style={styles.body}>
        <Text style={styles.title}>{book.title}</Text>
      </View>
      <Icon name="chevron-right" size={22} color={colors.ink} style={styles.chevron} />
    </Pressable>
  );
}

function createStyles(colors) {
  return {
    row: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.line,
    },
    pressed: {
      opacity: 0.7,
    },
    body: {
      flex: 1,
    },
    title: {
      fontFamily: myanmarFont,
      fontSize: 17,
      fontWeight: '700',
      color: colors.ink,
      lineHeight: 28,
    },
    chevron: {
      marginLeft: 8,
    },
  };
}
