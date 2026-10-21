import {Linking, Platform} from 'react-native';
import SpInAppUpdates, {
  IAUAvailabilityStatus,
  IAUUpdateKind,
} from 'sp-react-native-in-app-updates';
import {storeUrl} from './data/appLinks';

let updates;

function updateClient() {
  if (!updates) {
    updates = new SpInAppUpdates(false);
  }
  return updates;
}

export function isUpdateRequired(result) {
  if (!result) {
    return false;
  }
  if (result.shouldUpdate) {
    return true;
  }
  return result.other?.updateAvailability === IAUAvailabilityStatus.DEVELOPER_TRIGGERED;
}

export async function checkForceUpdate() {
  if (Platform.OS !== 'android' || __DEV__) {
    return false;
  }
  try {
    const result = await updateClient().checkNeedsUpdate({
      curVersion: '0.0.0',
      customVersionComparator: () => 1,
    });
    return isUpdateRequired(result);
  } catch {
    return false;
  }
}

export async function startForceUpdate() {
  try {
    await updateClient().startUpdate({updateType: IAUUpdateKind.IMMEDIATE});
  } catch {
    await Linking.openURL(storeUrl()).catch(() => {});
  }
}
