import React from 'react';
import {FlatList, Pressable, Text, View} from 'react-native';
import {ListMark} from '../components/ListMark';
import {useApp} from '../context/AppContext';
import {getBookById} from '../data/books';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

export function BookChaptersScreen({bookId}) {
  const {openReader} = useApp();
  const {styles} = useThemedStyles(createStyles);
  const book = getBookById(bookId);

  if (!book) {
    return (
      <View style={styles.screen}>
        <Text style={styles.empty}>စာအုပ် မတွေ့ပါ။</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={book.chapters}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({item}) => (
          <Pressable
            onPress={() => openReader(item.id, 'book', book.id)}
            style={({pressed}) => [styles.row, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={item.title}>
            <ListMark />
            <Text style={styles.title}>{item.title}</Text>
          </Pressable>
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
    },
    sep: {
      height: 10,
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
    title: {
      flex: 1,
      fontFamily: myanmarFont,
      fontSize: 17,
      fontWeight: '700',
      color: colors.ink,
      lineHeight: 28,
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
      marginTop: 32,
      fontSize: 15,
    },
  };
}
