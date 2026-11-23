/**
 * DhammaYate — တရားစာဖတ်ရန် မိုဘိုင်းအက်ပ်
 *
 * @format
 */

import {useEffect} from 'react';
import {getAnalytics, setAnalyticsCollectionEnabled} from '@react-native-firebase/analytics';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import mobileAds from 'react-native-google-mobile-ads';
import {AppNavigator} from './src/AppNavigator';
import {AppProvider} from './src/context/AppContext';

function App() {
  useEffect(() => {
    mobileAds().initialize();
    setAnalyticsCollectionEnabled(getAnalytics(), true);
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

export default App;
