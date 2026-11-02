import { useEffect } from 'react';
import { wheelPixels } from './wheelIntent.js';

// Smooth only desktop wheel input. The document remains the real scroller, so
// touch inertia, keyboard navigation, sticky content, and scroll restoration work.
export default function useSmoothScroll(container, enabled) {
  useEffect(() => {
    const element = container.current;
    if (!element || !enabled) return;
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0, current = scrollY, target = scrollY, previousAt = 0, direction = 0;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0; direction = 0; current = target = scrollY;
    };
    const tick = now => {
      const dt = Math.min(64, now - previousAt);
      previousAt = now;
      target = Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, target));
      current += (target - current) * (1 - Math.exp(-dt / 78));
      if (Math.abs(target - current) < .6) {
        window.scrollTo({ top: target, behavior: 'instant' });
        frame = 0; current = target; direction = 0;
        return;
      }
      window.scrollTo({ top: current, behavior: 'instant' });
      frame = requestAnimationFrame(tick);
    };
    const wheel = event => {
      if (event.ctrlKey || event.defaultPrevented || !finePointer.matches) return;
      const { x, y } = wheelPixels(event, innerHeight);
      if (!y || Math.abs(x) > Math.abs(y)) return;
      // Let any nested native scroller (e.g. editable content) keep its input.
      for (let node = event.target; node && node !== element; node = node.parentElement) {
        if (node.scrollHeight > node.clientHeight && /auto|scroll/.test(getComputedStyle(node).overflowY)) return;
      }
      const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      if (!max) return;
      if (!frame || Math.sign(y) !== direction) current = target = scrollY;
      direction = Math.sign(y);
      const lead = innerHeight * .85;
      target = Math.max(0, Math.min(max, Math.max(current - lead, Math.min(current + lead, target + y))));
      if (!frame && Math.abs(target - current) < .6) return;
      event.preventDefault();
      if (!frame) {
        previousAt = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const key = event => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) stop();
    };
    const scroll = () => { if (frame && Math.abs(scrollY - current) > 3) stop(); };
    element.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('keydown', key);
    window.addEventListener('pointerdown', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('resize', stop);
    window.addEventListener('scroll', scroll, { passive: true });
    document.addEventListener('visibilitychange', stop);
    finePointer.addEventListener('change', stop);
    return () => {
      stop();
      element.removeEventListener('wheel', wheel);
      window.removeEventListener('keydown', key);
      window.removeEventListener('pointerdown', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('resize', stop);
      window.removeEventListener('scroll', scroll);
      document.removeEventListener('visibilitychange', stop);
      finePointer.removeEventListener('change', stop);
    };
  }, [container, enabled]);
}
