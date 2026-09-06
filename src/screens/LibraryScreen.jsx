import React, {useMemo, useState} from 'react';
import {FlatList, Text, TextInput, View} from 'react-native';
import {CategoryChips} from '../components/CategoryChips';
import {TextCard} from '../components/TextCard';
import {useApp} from '../context/AppContext';
import {searchTexts} from '../data/texts';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

export function LibraryScreen() {
  const {openReader, settings} = useApp();
  const {colors, styles} = useThemedStyles(createStyles);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    const searched = searchTexts(query);
    if (category === 'all') {
      return searched;
    }
    return searched.filter(text => text.category === category);
  }, [query, category]);

  return (
    <View style={styles.screen}>
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="ခေါင်းစဉ် သို့မဟုတ် စာသား ရှာရန်"
          placeholderTextColor={colors.cardMuted}
          style={styles.search}
          accessibilityLabel="တရားစာ ရှာရန်"
        />
      </View>
      <CategoryChips selected={category} onSelect={setCategory} />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.empty}>ရှာဖွေမှုနှင့် ကိုက်ညီသော စာမတွေ့ပါ။</Text>}
        renderItem={({item}) => (
          <TextCard
            text={item}
            bookmarked={settings.bookmarks.includes(item.id)}
            onPress={() => openReader(item.id, 'library')}
          />
        )}
      />
    </View>
  );
}

function createStyles(colors) {
  return {
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    searchWrap: {
      paddingHorizontal: 20,
      paddingTop: 16,
      marginBottom: 12,
    },
    search: {
      fontFamily: myanmarFont,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.ink,
    },
    list: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 28,
    },
    sep: {
      height: 12,
    },
    empty: {
      fontFamily: myanmarFont,
      textAlign: 'center',
      color: colors.muted,
      marginTop: 32,
      fontSize: 15,
      lineHeight: 26,
    },
  };
}
