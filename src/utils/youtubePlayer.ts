/** Touch/mobile helpers for the video modal. */
export function isTouchMobile(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
    window.matchMedia('(max-width: 768px)').matches
  );
}
