import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safety patch for environments where window.fetch is a read-only getter.
// Some libraries (like older Gemini SDKs or polyfills) try to override it,
// which causes a TypeError. We intercept the set operation to prevent the crash.
if (typeof window !== 'undefined') {
  try {
    const originalFetch = window.fetch;
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    
    // If the property is already defined with a setter, or if it's configurable,
    // we try to ensure it has a no-op setter to prevent TypeErrors on assignment.
    if (!descriptor || descriptor.configurable) {
      Object.defineProperty(window, 'fetch', {
        get: () => originalFetch,
        set: (v) => {
          console.warn('System: Prevented an attempt to override window.fetch', v);
        },
        configurable: true,
        enumerable: true
      });
    } else if (descriptor && !descriptor.set) {
      // If it's not configurable and has no setter, we can't do much about assignments
      // to window.fetch directly, but passing fetch to SDK constructors (as done in ChatConsole)
      // is the primary way to avoid those assignments in the first place.
      console.info('System: window.fetch is read-only and non-configurable.');
    }
  } catch (e) {
    // If we can't redefine it, it's likely already locked down or handled.
    console.debug('System: Could not patch window.fetch', e);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
