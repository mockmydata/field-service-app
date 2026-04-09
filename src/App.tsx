import { Assets as NavigationAssets } from '@react-navigation/elements';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import { createURL } from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { Navigation, AuthNavigation } from './navigation';
import { AuthProvider, useAuth } from './shared/context/AuthContext';
import { CustomerProvider } from './shared/context/CustomerContext';
import { JobProvider } from './shared/context/JobContext';
import { QuotaProvider, useQuota } from './shared/context/QuotaContext';
import { StaffProvider } from './shared/context/StaffContext';
import { setQuotaHandler } from './shared/api/api';
import { QuotaBanner } from './shared/components/QuotaBanner';

Asset.loadAsync([
  ...NavigationAssets,
  require('./assets/newspaper.png'),
  require('./assets/bell.png'),
]);

SplashScreen.preventAutoHideAsync();

const prefix = createURL('/');

// ─── Quota Handler Init ───────────────────────────────────────────────────────
function QuotaHandlerInit() {
  const { setQuotaExceeded } = useQuota();

  React.useEffect(() => {
    setQuotaHandler((state) => setQuotaExceeded(true, state));
    return () => setQuotaHandler(() => {});
  }, []);

  return null;
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
function RootNavigator() {
  const { user, loading } = useAuth();
  const colorScheme       = useColorScheme();
  const baseTheme         = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: '#F4F6FA',
    },
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6FA' }}>
        <ActivityIndicator size="large" color="#2D73DE" />
      </View>
    );
  }

  if (!user) {
    return (
      <AuthNavigation
        theme={theme}
        linking={{ enabled: 'auto', prefixes: [prefix] }}
        onReady={() => SplashScreen.hideAsync()}
      />
    );
  }

  return (
    <JobProvider>
      <StaffProvider>
        <CustomerProvider>
          <Navigation
            theme={theme}
            linking={{ enabled: 'auto', prefixes: [prefix] }}
            onReady={() => SplashScreen.hideAsync()}
          />
        </CustomerProvider>
      </StaffProvider>
    </JobProvider>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <QuotaProvider>
          <QuotaHandlerInit />
          <QuotaBanner />
          <RootNavigator />
        </QuotaProvider>
      </AuthProvider>
    </PaperProvider>
  );
}