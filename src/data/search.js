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
    if (!q || matchesQuery([book.title, book.paliTitle, book.subtitle], q)) {
      items.push({type: 'book', book});
    }
    if (!q) {
      return;
    }
    const full = getBookById(book.id);
    full?.chapters.forEach(chapter => {
      if (
        matchesQuery(
          [chapter.title, chapter.paliTitle, chapter.subtitle, ...(chapter.paragraphs ?? [])],
          q,
        )
      ) {
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
