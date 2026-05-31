import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agrinet.app',
  appName: 'AgriNET',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
