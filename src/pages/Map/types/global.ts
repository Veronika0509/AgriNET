// Global type declarations for Google Maps and JSX elements

declare global {
  interface Window {
    google: any
  }

  namespace JSX {
    interface IntrinsicElements {
      "ion-icon": any
      "ion-input": any
    }
  }
}

export {}