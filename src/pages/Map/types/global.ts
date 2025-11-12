// Global type declarations for Google Maps and JSX elements

declare global {
  interface Window {
    google: typeof google
  }

  const google: {
    maps: {
      Map: any
      Marker: any
      LatLng: any
      LatLngBounds: any
      SymbolPath: any
      event: any
      MapTypeId: any
      [key: string]: any
    }
  }

  namespace JSX {
    interface IntrinsicElements {
      "ion-icon": any
      "ion-input": any
    }
  }
}

export {}