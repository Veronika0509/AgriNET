// loadGoogleApiFunctions.ts
import { Capacitor } from '@capacitor/core';

export const loadGoogleApi = (setLoaded: React.Dispatch<React.SetStateAction<boolean>>) => {
  // Check if Google Maps API has already been loaded
  if (window.google && window.google.maps) {
    setLoaded(true);
    return;
  }

  // Check if script tag for Google Maps API already exists
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    // If script already exists, wait for it to load
    existingScript.addEventListener('load', () => {
      setLoaded(true);
    });
    return;
  }

  // Native apps (iOS/Android) can't satisfy the website's HTTP-referrer key
  // restriction, so mobile builds use a separate, unrestricted-by-referrer key.
  const apiKey = Capacitor.isNativePlatform()
    ? import.meta.env.VITE_MAP_API_KEY_MOBILE
    : import.meta.env.VITE_MAP_API_KEY;

  if (apiKey) {
    const script = document.createElement('script');

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=beta&libraries=geometry,drawing,marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setLoaded(true);
    };
    script.onerror = (_error) => {
      // Silent error handling
    };

    document.head.appendChild(script);
  }
};
