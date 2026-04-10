// Fix for react-router-dom v5 + @types/react v18.3 JSX element compatibility.
// react-router-dom v5 class components (Route, Redirect, BrowserRouter) fail
// TS2786 because their class instances lack `refs` required by the newer
// React.Component type check. Re-declaring these as functional ComponentType
// exports in a module augmentation resolves the mismatch.
import type { ComponentType } from 'react';
import type {
  RouteProps,
  RedirectProps,
  BrowserRouterProps,
} from 'react-router-dom';

declare module 'react-router-dom' {
  export const Route: ComponentType<RouteProps>;
  export const Redirect: ComponentType<RedirectProps>;
  export const BrowserRouter: ComponentType<BrowserRouterProps>;
}
