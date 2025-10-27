// loadGoogleApiFunctions.ts
export const loadGoogleApi = (setLoaded: React.Dispatch<React.SetStateAction<boolean>>) => {
  // Проверяем, был ли Google Maps API уже загружен
  if (window.google && window.google.maps) {
    setLoaded(true);
    return;
  }

  // Проверяем, есть ли уже script тег для Google Maps API
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    // Если script уже существует, ждем его загрузки
    existingScript.addEventListener('load', () => {
      setLoaded(true);
    });
    return;
  }

  const apiKey = import.meta.env.VITE_MAP_API_KEY;

  if (apiKey) {
    const script = document.createElement('script');

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=beta&libraries=geometry,drawing,marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setLoaded(true);
    };
    script.onerror = (error) => {
      // Silent error handling
    };
    
    document.head.appendChild(script);
  }
};
