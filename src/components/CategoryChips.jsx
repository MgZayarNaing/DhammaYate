import React from 'react';
import {Pressable, ScrollView} from 'react-native';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {categories} from '../theme';
import {MmText} from './MmText';

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
      <MmText style={[styles.label, active && styles.labelActive]}>{label}</MmText>
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
      fontSize: 13,
      color: colors.ink,
      lineHeight: 24,
    },
    labelActive: {
      color: colors.onAccent,
    },
  };
}
