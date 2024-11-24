export class CollisionResolver {
  private overlays: any;
  private map: google.maps.Map;

  constructor(map: google.maps.Map | null) {
    this.overlays = [];
    this.map = map || null;
  }

  setMap(map: google.maps.Map) {
    this.map = map;
  }

  addOverlay(overlay: any) {
    this.overlays.push(overlay);
    console.log(this.overlays)
  }

  resolve() {
    console.log('gonna resolve', this.overlays)
    for (let i = 0; i < this.overlays.length; i++) {
      for (let j = i + 1; j < this.overlays.length; j++) {
        if (this.checkOverlap(this.overlays[i], this.overlays[j])) {
          this.resolveCollision(this.overlays[i], this.overlays[j]);
        }
      }
    }
  }

  private checkOverlap(overlay1: any, overlay2: any): boolean {
    const bounds1 = overlay1.getBounds();
    const bounds2 = overlay2.getBounds();
    return bounds1.intersects(bounds2);
  }

  private resolveCollision(overlay1: any, overlay2: any) {
    const center1 = overlay1.getBounds().getCenter();
    const center2 = overlay2.getBounds().getCenter();
    const projection: any = this.map.getProjection();
    console.log(projection)
    if (projection) {
      const pixel1 = projection.fromLatLngToDivPixel(center1);
      const pixel2 = projection.fromLatLngToDivPixel(center2);
      const dx = pixel2.x - pixel1.x;
      const dy = pixel2.y - pixel1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const moveDistance = (50 - distance) / 2; // 50 - минимальное расстояние между центрами

      const moveX = (dx / distance) * moveDistance;
      const moveY = (dy / distance) * moveDistance;

      overlay1.move(-moveX, -moveY);
      overlay2.move(moveX, moveY);
    }
  }
}
