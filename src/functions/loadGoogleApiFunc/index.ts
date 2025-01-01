// loadGoogleApiFunctions.ts
export const loadGoogleApi = (setLoaded: React.Dispatch<React.SetStateAction<boolean>>) => {
  const apiKey = import.meta.env.VITE_MAP_API_KEY;

  if (apiKey) {
    const script = document.createElement('script');

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=beta&libraries=geometry,drawing`;    script.async = true;
    script.defer = true;
    script.onload = () => {
      setLoaded(true);
    };
    document.head.appendChild(script);
  } else {
    console.error('Google Maps API key is not set');
  }
};
