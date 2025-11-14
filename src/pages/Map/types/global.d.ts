/**
 * Global type declarations for Map component
 * These extend the global window object and JSX namespace
 */

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

// HTML Element Extensions
export interface HTMLIonIconElement extends HTMLElement {
  icon?: string
  color?: string
}

export interface HTMLIonInputElement extends HTMLElement {
  value?: string | number | null
}

export {}
