import React, {useMemo} from 'react';
import {FlatList, Text, View} from 'react-native';
import {TextCard} from '../components/TextCard';
import {useApp} from '../context/AppContext';
import {getTextById} from '../data/texts';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

export function FavoritesScreen() {
  const {settings, openReader} = useApp();
  const {styles} = useThemedStyles(createStyles);
  const items = useMemo(
    () => settings.bookmarks.map(id => getTextById(id)).filter(Boolean),
    [settings.bookmarks],
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>စိတ်ကြိုက်စာ မရှိသေးပါ</Text>
            <Text style={styles.emptyBody}>
              စာဖတ်နေစဉ် မှတ်သားခလုတ်ကို နှိပ်၍ နှစ်သက်သော တရားစာကို သိမ်းနိုင်သည်။
            </Text>
          </View>
        }
        renderItem={({item}) => (
          <TextCard
            text={item}
            bookmarked
            onPress={() => openReader(item.id, 'favorites')}
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
    list: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 28,
      flexGrow: 1,
    },
    sep: {
      height: 12,
    },
    emptyBox: {
      marginTop: 48,
      paddingHorizontal: 12,
      alignItems: 'center',
    },
    emptyTitle: {
      fontFamily: myanmarFont,
      fontSize: 18,
      color: colors.ink,
      textAlign: 'center',
      lineHeight: 30,
    },
    emptyBody: {
      marginTop: 8,
      fontFamily: myanmarFont,
      fontSize: 14,
      color: colors.muted,
      textAlign: 'center',
      lineHeight: 24,
    },
  };
}
