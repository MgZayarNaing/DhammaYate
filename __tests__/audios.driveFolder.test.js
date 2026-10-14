import {dhammaAudios} from '../src/data/audios';

const DRIVE_URL_PREFIX =
  'https://drive.usercontent.google.com/download?id=';
const DRIVE_URL_SUFFIX = '&export=download&confirm=t';

/** Entries appended for folder 1ikypoU1Dz4F-y_2Hi39_fDTLsB-RCUgu */
const NEW_ID_PREFIX = 'audio-drive-2026-';

test('adds all practice tracks from the Oct 2026 Drive folder batch', () => {
  const batch = dhammaAudios.filter(a => a.id.startsWith(NEW_ID_PREFIX));
  expect(batch.length).toBeGreaterThanOrEqual(28);
  expect(batch.length).toBeLessThanOrEqual(40);

  const ids = new Set();
  for (const audio of batch) {
    expect(audio.category).toBe('practice');
    expect(audio.minutes).toBe(0);
    expect(typeof audio.title).toBe('string');
    expect(audio.title.length).toBeGreaterThan(0);
    expect(typeof audio.paliTitle).toBe('string');
    expect(typeof audio.speaker).toBe('string');
    expect(typeof audio.subtitle).toBe('string');
    expect(audio.file.startsWith(DRIVE_URL_PREFIX)).toBe(true);
    expect(audio.file.endsWith(DRIVE_URL_SUFFIX)).toBe(true);
    const fileId = audio.file.slice(
      DRIVE_URL_PREFIX.length,
      audio.file.length - DRIVE_URL_SUFFIX.length,
    );
    expect(fileId.length).toBeGreaterThanOrEqual(20);
    expect(ids.has(audio.id)).toBe(false);
    ids.add(audio.id);
  }
});

test('new batch ids do not collide with older entries', () => {
  const allIds = dhammaAudios.map(a => a.id);
  expect(allIds.length).toBe(new Set(allIds).size);
});
