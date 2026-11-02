import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './theme.css';
import './desktop.css';
import { DESKTOP } from './edition';

// desktop.css only applies under html.desktop.
document.documentElement.classList.toggle('desktop', DESKTOP);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Dev-only hook for the browser smoke test (scripts/smoke.mjs).
if (import.meta.env.DEV) {
  void Promise.all([
    import('./content'),
    import('./engine/check'),
    import('./content/tours'),
    import('./components/exercises/desktop/common'),
  ]).then(([c, k, t, d]) => {
    (window as unknown as { __cq: unknown }).__cq = {
      getExercise: c.getExercise,
      parseFixCode: k.parseFixCode,
      joinTokens: k.joinTokens,
      toursFor: t.toursFor,
      isTerminalExercise: d.isTerminalExercise,
    };
  });
}
