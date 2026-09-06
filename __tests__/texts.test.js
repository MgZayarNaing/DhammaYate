import {dhammaTexts, getTextById, searchTexts} from '../src/data/texts';

test('includes core dhamma texts', () => {
  expect(dhammaTexts.length).toBeGreaterThanOrEqual(8);
  expect(getTextById('mangala')?.title).toBe('မင်္ဂလသုတ်');
});

test('search matches Burmese titles', () => {
  const results = searchTexts('မေတ္တာ');
  expect(results.some(text => text.id === 'metta')).toBe(true);
});

test('empty search returns all texts', () => {
  expect(searchTexts('')).toHaveLength(dhammaTexts.length);
});
