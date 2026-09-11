import {dhammaAudios} from './audios';
import {dhammaBooks, getBookById} from './books';

function matchesQuery(parts, query) {
  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(query);
}

export function searchCatalog(query) {
  const q = query.trim().toLowerCase();
  const items = [];

  dhammaBooks.forEach(book => {
    const isMultiChapter = book.chapterIds.length > 1;
    const bookMatches =
      !q || matchesQuery([book.title, book.paliTitle, book.subtitle], q);

    // "Book" results are multi-chapter books → open chapter list.
    if (bookMatches && isMultiChapter) {
      items.push({type: 'book', book});
    }

    if (!q) {
      return;
    }

    const full = getBookById(book.id);
    full?.chapters.forEach(chapter => {
      const chapterMatches = matchesQuery(
        [
          chapter.title,
          chapter.paliTitle,
          chapter.subtitle,
          ...(chapter.paragraphs ?? []),
        ],
        q,
      );
      // Single-chapter books matching the book title surface as a chapter
      // so tapping opens the reader, not a one-item chapter list.
      const singleBookAsChapter =
        !isMultiChapter &&
        bookMatches &&
        full.chapters.length === 1 &&
        chapter.id === full.chapters[0].id;

      if (chapterMatches || singleBookAsChapter) {
        items.push({type: 'chapter', book, chapter});
      }
    });
  });

  if (q) {
    dhammaAudios.forEach(audio => {
      if (
        matchesQuery([audio.title, audio.paliTitle, audio.subtitle, audio.speaker], q)
      ) {
        items.push({type: 'audio', audio});
      }
    });
  }

  return items;
}
