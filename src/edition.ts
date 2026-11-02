/** Which app this build is. The Android app is the phone edition (tap to
 * answer); `vite --mode desktop` builds the Windows edition, which is answered
 * by typing and laid out in three panes. */
export const DESKTOP = import.meta.env.VITE_EDITION === 'desktop';
