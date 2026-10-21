import {isUpdateRequired} from '../src/forceUpdate';

test('requires an update when Play has a newer version', () => {
  expect(isUpdateRequired({shouldUpdate: true})).toBe(true);
});

test('keeps blocking while an immediate update is already in progress', () => {
  expect(
    isUpdateRequired({
      shouldUpdate: false,
      other: {updateAvailability: 3},
    }),
  ).toBe(true);
});

test('allows the app when Play has no newer version', () => {
  expect(
    isUpdateRequired({
      shouldUpdate: false,
      other: {updateAvailability: 1},
    }),
  ).toBe(false);
});
