/**
 * တရားတော်များ — တရားစာဖတ်ရန် မိုဘိုင်းအက်ပ်
 *
 * @format
 */

import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from './src/AppNavigator';
import {AppProvider} from './src/context/AppContext';

function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

export default App;
