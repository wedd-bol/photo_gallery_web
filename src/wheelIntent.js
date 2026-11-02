// Wheel devices report pixels, lines, or pages. Keep the navigation threshold
// consistent without treating a trackpad's decaying momentum as fresh input.
export function wheelPixels(event, pageHeight = 800) {
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? pageHeight : 1;
  return { x: event.deltaX * unit, y: event.deltaY * unit };
}

export function createWheelIntent() {
  let direction = 0, total = 0, peak = 0, previous = 0;
  let lastAt = -Infinity, committedAt = -Infinity, consumed = false;
  return {
    push(delta, now) {
      if (!Number.isFinite(delta) || !delta) return 0;
      const magnitude = Math.abs(delta), nextDirection = Math.sign(delta);
      const gap = now - lastAt, age = now - committedAt;
      const newImpulse = consumed && age > 240 && magnitude > Math.max(28, previous * 1.8);
      const heldWheel = consumed && age > 560 && magnitude >= Math.max(32, peak * .72);
      if (gap > 180 || direction !== nextDirection || newImpulse || heldWheel) {
        total = 0; peak = 0; consumed = false;
      } else total *= Math.exp(-gap / 180);
      direction = nextDirection; lastAt = now; previous = magnitude;
      peak = Math.max(peak, magnitude);
      if (consumed) return 0;
      total += delta;
      if (Math.abs(total) < 48) return 0;
      consumed = true; committedAt = now; total = 0;
      return direction;
    },
  };
}
