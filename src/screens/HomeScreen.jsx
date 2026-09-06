import React from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {ListMark} from '../components/ListMark';
import {useApp} from '../context/AppContext';
import {dhammaBooks} from '../data/books';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

export function HomeScreen() {
  const {openBook} = useApp();
  const {styles} = useThemedStyles(createStyles);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {dhammaBooks.map(book => (
            <Pressable
              key={book.id}
              onPress={() => openBook(book.id, 'home')}
              style={({pressed}) => [styles.row, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={book.title}>
              <ListMark />
              <View style={styles.body}>
                <Text style={styles.title}>{book.title}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
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
    list: {
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
    chevron: {
      fontSize: 26,
      color: colors.ink,
      lineHeight: 28,
      marginLeft: 8,
    },
  };
}
