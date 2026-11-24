jest.mock('react-native', () => ({
  Platform: {OS: 'ios'},
  Linking: {openURL: jest.fn()},
}));

jest.mock('sp-react-native-in-app-updates', () => {
  const updateClient = {
    checkNeedsUpdate: jest.fn().mockResolvedValue({shouldUpdate: true}),
    startUpdate: jest.fn().mockResolvedValue(undefined),
  };
  return {
    __esModule: true,
    default: jest.fn(() => updateClient),
    IAUAvailabilityStatus: {DEVELOPER_TRIGGERED: 3},
    IAUUpdateKind: {IMMEDIATE: 1},
  };
});

import {Platform} from 'react-native';
import SpInAppUpdates from 'sp-react-native-in-app-updates';
import {isUpdateRequired, checkForceUpdate, startForceUpdate} from '../src/forceUpdate';
import {IOS_BUNDLE_ID} from '../src/data/appLinks';

beforeAll(() => {
  global.__DEV__ = false;
});

beforeEach(() => {
  Platform.OS = 'ios';
});

test('checks and starts a forced iOS App Store update', async () => {
  await expect(checkForceUpdate()).resolves.toBe(true);
  const updates = SpInAppUpdates.mock.results[0].value;
  expect(updates.checkNeedsUpdate).toHaveBeenCalledWith({bundleId: IOS_BUNDLE_ID});

  await startForceUpdate();
  expect(updates.startUpdate).toHaveBeenCalledWith(
    expect.objectContaining({bundleId: IOS_BUNDLE_ID, forceUpgrade: true}),
  );
});

test('uses immediate Play updates on Android', async () => {
  Platform.OS = 'android';
  await expect(checkForceUpdate()).resolves.toBe(true);
  const updates = SpInAppUpdates.mock.results[0].value;
  const checkOptions = updates.checkNeedsUpdate.mock.calls.at(-1)[0];
  expect(checkOptions.customVersionComparator('4', '1.0.2')).toBe(1);

  await startForceUpdate();
  expect(updates.startUpdate).toHaveBeenLastCalledWith({updateType: 1});
});

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
