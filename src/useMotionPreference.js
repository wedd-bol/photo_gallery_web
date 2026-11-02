import { useSyncExternalStore } from 'react';

// Subscribe directly so a preference change also stops a video already playing.
const query = matchMedia('(prefers-reduced-motion: reduce)');
const subscribe = callback => {
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};
const snapshot = () => query.matches;
export default function useMotionPreference() {
  return useSyncExternalStore(subscribe, snapshot, () => true);
}
