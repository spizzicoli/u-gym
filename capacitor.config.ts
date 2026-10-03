import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ugym.app',
  appName: 'U-GYM',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 500,
      launchFadeOutDuration: 120,
      showSpinner: false,
    },
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
    LocalNotifications: { smallIcon: 'ic_stat_ugym' },
    Geolocation: { permissions: ['location', 'coarseLocation'] },
  },
};
export default config;
