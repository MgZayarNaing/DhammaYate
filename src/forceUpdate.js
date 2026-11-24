import {Linking, Platform} from 'react-native';
import SpInAppUpdates, {
  IAUAvailabilityStatus,
  IAUUpdateKind,
} from 'sp-react-native-in-app-updates';
import {
  APP_STORE_SEARCH_URL,
  IOS_BUNDLE_ID,
  storeUrl,
} from './data/appLinks';

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
  if ((Platform.OS !== 'android' && Platform.OS !== 'ios') || __DEV__) {
    return false;
  }
  try {
    const checkOptions =
      Platform.OS === 'ios'
        ? {bundleId: IOS_BUNDLE_ID}
        : {customVersionComparator: () => 1};
    const result = await updateClient().checkNeedsUpdate(checkOptions);
    return isUpdateRequired(result);
  } catch (error) {
    console.warn('[force update] version check failed', error);
    return false;
  }
}

export async function startForceUpdate() {
  try {
    if (Platform.OS === 'ios') {
      await updateClient().startUpdate({
        bundleId: IOS_BUNDLE_ID,
        forceUpgrade: true,
        title: 'ဗားရှင်းအသစ် တင်ပါ',
        message: 'ဆက်သုံးရန် App Store မှ ဗားရှင်းအသစ်ကို တင်ရန် လိုအပ်ပါသည်။',
        buttonUpgradeText: 'App Store သို့သွားရန်',
      });
      return;
    }
    await updateClient().startUpdate({updateType: IAUUpdateKind.IMMEDIATE});
  } catch (error) {
    console.warn('[force update] update flow failed', error);
    try {
      await Linking.openURL(
        Platform.OS === 'ios' ? APP_STORE_SEARCH_URL : storeUrl(),
      );
    } catch (fallbackError) {
      console.warn('[force update] opening the store failed', fallbackError);
    }
  }
}
