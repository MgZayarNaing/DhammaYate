import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {useApp} from '../context/AppContext';
import {searchCatalog} from '../data/search';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

export function SearchScreen() {
  const {openBook, openReader, openAudio} = useApp();
  const {colors, styles} = useThemedStyles(createStyles);
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchCatalog(query), [query]);

  const onSelect = item => {
    if (item.type === 'book') {
      openBook(item.book.id, 'search');
      return;
    }
    if (item.type === 'chapter') {
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
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="ရှာရန်"
          placeholderTextColor={colors.cardMuted}
          style={styles.input}
          accessibilityLabel="တရားစာ ရှာရန်"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {results.length === 0 ? (
          <Text style={styles.empty}>ရှာဖွေမှုနှင့် ကိုက်ညီသော စာမတွေ့ပါ။</Text>
        ) : (
          <View style={styles.list}>
            {results.map(item => {
              if (item.type === 'book') {
                return (
                  <ResultRow
                    key={`book-${item.book.id}`}
                    title={item.book.title}
                    styles={styles}
                    onPress={() => onSelect(item)}
                  />
                );
              }
              if (item.type === 'chapter') {
                return (
                  <ResultRow
                    key={`chapter-${item.chapter.id}`}
                    title={item.chapter.title}
                    meta={item.book.title}
                    styles={styles}
                    onPress={() => onSelect(item)}
                  />
                );
              }
              return (
                <ResultRow
                  key={`audio-${item.audio.id}`}
                    title={item.audio.title}
                    styles={styles}
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

function ResultRow({title, meta, styles, onPress}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={title}>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
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
    input: {
      fontFamily: myanmarFont,
      backgroundColor: colors.parchment,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
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
    meta: {
      marginTop: 4,
      fontFamily: myanmarFont,
      fontSize: 13,
      color: colors.cardMuted,
      lineHeight: 22,
    },
    chevron: {
      fontSize: 26,
      color: colors.ink,
      lineHeight: 28,
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
