import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useApp} from '../context/AppContext';
import {searchCatalog} from '../data/search';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

const RESULT_KINDS = {
  book: {
    icon: 'book-open-variant',
    label: 'စာအုပ်',
    light: '#3b6d9a',
    dark: '#8eb4d4',
  },
  chapter: {
    icon: 'text-box-outline',
    label: 'စာမျက်နှာ',
    light: '#8a6a2f',
    dark: '#d4b56a',
  },
  audio: {
    icon: 'music-note',
    label: 'အသံ',
    light: '#3d7a5a',
    dark: '#8fbfa3',
  },
};

function kindColor(kind, scheme) {
  const config = RESULT_KINDS[kind];
  return scheme === 'dark' ? config.dark : config.light;
}

function chipBackground(hex) {
  return `${hex}24`;
}

export function SearchScreen() {
  const {openBook, openReader, openAudio} = useApp();
  const {colors, styles} = useThemedStyles(createStyles);
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchCatalog(query), [query]);

  const onSelect = item => {
    if (item.type === 'book') {
      // Book results = multi-chapter books → chapter list screen.
      openBook(item.book.id, 'search', {listChapters: true});
      return;
    }
    if (item.type === 'chapter') {
      // Chapter results → reader screen.
      openReader(item.chapter.id, 'search', item.book.id);
      return;
    }
    openAudio(item.audio.id, 'search');
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.searchBar}>
          <Icon
            name="magnify"
            size={20}
            color={colors.cardMuted}
            importantForAccessibility="no"
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ရှာရန်"
            placeholderTextColor={colors.cardMuted}
            style={styles.input}
            accessibilityLabel="တရားစာ ရှာရန်"
            returnKeyType="search"
            clearButtonMode="while-editing"
            underlineColorAndroid="transparent"
          />
        </View>
        {results.length === 0 ? (
          <Text style={styles.empty}>
            ရှာဖွေမှုနှင့် ကိုက်ညီသော အချက်အလက် မတွေ့ပါ။
          </Text>
        ) : (
          <View style={styles.list}>
            {results.map(item => {
              if (item.type === 'book') {
                return (
                  <ResultRow
                    key={`book-${item.book.id}`}
                    kind="book"
                    title={item.book.title}
                    showChevron
                    styles={styles}
                    colors={colors}
                    onPress={() => onSelect(item)}
                  />
                );
              }
              if (item.type === 'chapter') {
                return (
                  <ResultRow
                    key={`chapter-${item.chapter.id}`}
                    kind="chapter"
                    title={item.chapter.title}
                    meta={item.book.title}
                    showChevron={false}
                    styles={styles}
                    colors={colors}
                    onPress={() => onSelect(item)}
                  />
                );
              }
              return (
                <ResultRow
                  key={`audio-${item.audio.id}`}
                  kind="audio"
                  title={item.audio.title}
                  showChevron={false}
                  styles={styles}
                  colors={colors}
                  onPress={() => onSelect(item)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ResultRow({
  kind,
  title,
  meta,
  showChevron = false,
  styles,
  colors,
  onPress,
}) {
  const config = RESULT_KINDS[kind];
  const accent = kindColor(kind, colors.scheme);

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${config.label}၊ ${title}`}>
      <View style={[styles.chip, {backgroundColor: chipBackground(accent)}]}>
        <Icon name={config.icon} size={20} color={accent} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.kindLabel, {color: accent}]}>{config.label}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      {showChevron ? (
        <Icon name="chevron-right" size={22} color={colors.ink} style={styles.chevron} />
      ) : null}
    </Pressable>
  );
}

function createStyles(colors) {
  return {
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 28,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.parchment,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: 999,
      paddingHorizontal: 16,
      minHeight: 40,
    },
    input: {
      flex: 1,
      fontFamily: myanmarFont,
      paddingVertical: 8,
      paddingHorizontal: 0,
      fontSize: 15,
      color: colors.ink,
    },
    list: {
      marginTop: 14,
      gap: 10,
    },
    row: {
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
    chip: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
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
    kindLabel: {
      marginTop: 2,
      fontFamily: myanmarFont,
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 20,
    },
    meta: {
      marginTop: 2,
      fontFamily: myanmarFont,
      fontSize: 13,
      color: colors.cardMuted,
      lineHeight: 22,
    },
    chevron: {
      marginLeft: 8,
    },
    empty: {
      fontFamily: myanmarFont,
      textAlign: 'center',
      color: colors.muted,
      marginTop: 24,
      fontSize: 15,
      lineHeight: 26,
    },
  };
}
