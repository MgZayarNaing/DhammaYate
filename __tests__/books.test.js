import {dhammaBooks, getBookById} from '../src/data/books';
import {getTextById} from '../src/data/texts';

test('home books include guna with chapter list', () => {
  expect(dhammaBooks.length).toBeGreaterThanOrEqual(20);
  expect(dhammaBooks.some(book => book.id === 'guna')).toBe(true);
  const guna = getBookById('guna');
  expect(guna.chapters.map(chapter => chapter.title)).toEqual([
    'ဘုရားဂုဏ်တော် ၉ ပါး',
    'တရားဂုဏ်တော် ၆ ပါး',
    'သံဃာဂုဏ်တော် ၉ ပါး',
  ]);
});

test('guna chapter has readable detail', () => {
  const text = getTextById('buddha-guna');
  expect(text.paragraphs.length).toBeGreaterThanOrEqual(9);
  expect(text.paragraphs.some(paragraph => paragraph.includes('အရဟံ'))).toBe(
    true,
  );
});
