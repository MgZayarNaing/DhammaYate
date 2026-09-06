import React from 'react';
import {Pressable, ScrollView, Text} from 'react-native';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {categories, myanmarFont} from '../theme';

export function CategoryChips({selected, onSelect}) {
  const {styles} = useThemedStyles(createStyles);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      <Chip
        label="အားလုံး"
        active={selected === 'all'}
        onPress={() => onSelect('all')}
        styles={styles}
      />
      {categories.map(category => (
        <Chip
          key={category.id}
          label={`${category.emoji} ${category.label}`}
          active={selected === category.id}
          onPress={() => onSelect(category.id)}
          styles={styles}
        />
      ))}
    </ScrollView>
  );
}

function Chip({label, active, onPress, styles}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityState={{selected: active}}>
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors) {
  return {
    row: {
      gap: 8,
      paddingHorizontal: 20,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.line,
    },
    chipActive: {
      backgroundColor: colors.blue,
      borderColor: colors.blue,
    },
    label: {
      fontFamily: myanmarFont,
      fontSize: 13,
      color: colors.ink,
    },
    labelActive: {
      color: colors.onAccent,
    },
  };
}
