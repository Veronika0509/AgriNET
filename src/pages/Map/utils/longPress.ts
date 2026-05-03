import type React from 'react';

const LONG_PRESS_MS = 600;
const POST_PRESS_GUARD_MS = 100;
const MOVE_THRESHOLD_PX = 12;

export class LongPressTracker {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private startX = 0;
  private startY = 0;
  public wasLongPress = false;

  constructor(private onLongPress: () => void) {}

  start = (e: React.TouchEvent) => {
    this.wasLongPress = false;
    const t = e.touches[0];
    if (t) {
      this.startX = t.clientX;
      this.startY = t.clientY;
    }
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.wasLongPress = true;
      this.timer = null;
      this.onLongPress();
    }, LONG_PRESS_MS);
  };

  end = () => {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    setTimeout(() => {
      this.wasLongPress = false;
    }, POST_PRESS_GUARD_MS);
  };

  move = (e: React.TouchEvent) => {
    if (!this.timer) return;
    const t = e.touches[0];
    if (!t) return;
    const dx = t.clientX - this.startX;
    const dy = t.clientY - this.startY;
    if (dx * dx + dy * dy > MOVE_THRESHOLD_PX * MOVE_THRESHOLD_PX) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  };
}
