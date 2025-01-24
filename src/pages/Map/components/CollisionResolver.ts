export class CollisionResolver {
  private static timerId: NodeJS.Timeout;
  private static readonly MAX_ITERATIONS = 30; // Increased for more thorough resolution
  private static readonly MIN_SPACING = 0.5; // Reduced to 0.5px for extremely tight packing
  private static alreadyMoved: Map<any, boolean> = new Map();

  static resolve(overlays: any[]) {
    if (overlays.length > 30) return;

    clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
      this.alreadyMoved.clear();
      this.initialPosition(overlays);
      setTimeout(() => {
        this.resolveCollisions(overlays);
      }, 600);
    }, 100);
  }

  private static initialPosition(overlays: any[]) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) / 8; // Further reduced radius

    overlays.forEach((overlay, index) => {
      const angle = (index / overlays.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      this.setOverlayPosition(overlay, x, y);
    });
  }

  private static setOverlayPosition(overlay: any, x: number, y: number) {
    const div = overlay.getDiv();
    if (!div) return;

    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    overlay.draw();
  }

  private static resolveCollisions(overlays: any[], iteration: number = 0) {
    if (iteration >= this.MAX_ITERATIONS) return;

    let hasCollisions = false;

    for (let i = 0; i < overlays.length; i++) {
      for (let j = i + 1; j < overlays.length; j++) {
        const collision = this.checkCollision(overlays[i], overlays[j]);
        if (collision) {
          this.resolveCollision(overlays[i], overlays[j], collision);
          hasCollisions = true;
        } else {
          this.attractOverlays(overlays[i], overlays[j]);
        }
      }
    }

    if (hasCollisions) {
      setTimeout(() => this.resolveCollisions(overlays, iteration + 1), 0);
    } else {
      this.compactLayout(overlays);
    }
  }

  private static checkCollision(overlay1: any, overlay2: any) {
    const div1 = overlay1.getDiv();
    const div2 = overlay2.getDiv();
    if (!div1 || !div2) return null;

    const bounds1 = div1.getBoundingClientRect();
    const bounds2 = div2.getBoundingClientRect();

    const overlap = {
      x: Math.min(bounds1.right, bounds2.right) - Math.max(bounds1.left, bounds2.left),
      y: Math.min(bounds1.bottom, bounds2.bottom) - Math.max(bounds1.top, bounds2.top)
    };

    if (overlap.x > 0 && overlap.y > 0) {
      return {
        x: overlap.x + this.MIN_SPACING,
        y: overlap.y + this.MIN_SPACING,
        centerDiffX: bounds2.left + bounds2.width / 2 - (bounds1.left + bounds1.width / 2),
        centerDiffY: bounds2.top + bounds2.height / 2 - (bounds1.top + bounds1.height / 2)
      };
    }

    return null;
  }

  private static resolveCollision(overlay1: any, overlay2: any, collision: any) {
    const div1 = overlay1.getDiv();
    const div2 = overlay2.getDiv();
    if (!div1 || !div2) return;

    const distance = Math.sqrt(
      collision.centerDiffX * collision.centerDiffX +
      collision.centerDiffY * collision.centerDiffY
    );

    if (distance === 0) {
      const angle = Math.random() * Math.PI * 2;
      collision.centerDiffX = Math.cos(angle);
      collision.centerDiffY = Math.sin(angle);
    } else {
      collision.centerDiffX /= distance;
      collision.centerDiffY /= distance;
    }

    // Minimal push distance for extremely tight packing
    const pushDistance = Math.max(collision.x, collision.y) * 0.2;
    const push = pushDistance / 2;

    this.moveOverlay(overlay1,
      -collision.centerDiffX * push,
      -collision.centerDiffY * push
    );
    this.moveOverlay(overlay2,
      collision.centerDiffX * push,
      collision.centerDiffY * push
    );
  }

  private static attractOverlays(overlay1: any, overlay2: any) {
    const div1 = overlay1.getDiv();
    const div2 = overlay2.getDiv();
    if (!div1 || !div2) return;

    const bounds1 = div1.getBoundingClientRect();
    const bounds2 = div2.getBoundingClientRect();

    const centerDiffX = bounds2.left + bounds2.width / 2 - (bounds1.left + bounds1.width / 2);
    const centerDiffY = bounds2.top + bounds2.height / 2 - (bounds1.top + bounds1.height / 2);

    const distance = Math.sqrt(centerDiffX * centerDiffX + centerDiffY * centerDiffY);

    if (distance > 0 && distance < 50) { // Reduced attraction distance to 50px
      const attractionForce = 0.1; // Increased attraction strength
      const moveX = (centerDiffX / distance) * attractionForce;
      const moveY = (centerDiffY / distance) * attractionForce;

      this.moveOverlay(overlay1, moveX, moveY);
      this.moveOverlay(overlay2, -moveX, -moveY);
    }
  }

  private static compactLayout(overlays: any[]) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    overlays.forEach(overlay => {
      const div = overlay.getDiv();
      if (!div) return;

      const bounds = div.getBoundingClientRect();
      const currentCenterX = bounds.left + bounds.width / 2;
      const currentCenterY = bounds.top + bounds.height / 2;

      const directionX = centerX - currentCenterX;
      const directionY = centerY - currentCenterY;
      const distance = Math.sqrt(directionX * directionX + directionY * directionY);

      if (distance > 0) {
        const moveX = (directionX / distance) * 0.5; // Gentle movement towards center
        const moveY = (directionY / distance) * 0.5;

        this.moveOverlay(overlay, moveX, moveY);
      }
    });
  }

  private static moveOverlay(overlay: any, dx: number, dy: number) {
    const div = overlay.getDiv();
    if (!div) return;

    const currentLeft = parseFloat(div.style.left) || 0;
    const currentTop = parseFloat(div.style.top) || 0;

    div.style.left = `${currentLeft + dx}px`;
    div.style.top = `${currentTop + dy}px`;

    if (!overlay.offset) overlay.offset = {x: 0, y: 0};
    overlay.offset.x += dx;
    overlay.offset.y += dy;

    overlay.draw();
  }
}