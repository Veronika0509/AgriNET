const overlaysOverlap = (overlayProjection: any, overlayA: any, overlayB: any) => {
  const positionA = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(overlayA.lat, overlayA.lng));
  const positionB = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(overlayB.lat, overlayB.lng));
  return Math.abs(positionA.x - positionB.x) < 130 && Math.abs(positionA.y - positionB.y) < 130;
}

function isPairExisting(overlappingPairs: any, newPair: any) {
  const newPairIds = newPair.map((sensor: any) => sensor.id).sort().join();

  return overlappingPairs.some((pair: any) => {
    const pairIds = pair.map((sensor: any) => sensor.id).sort().join();
    return pairIds === newPairIds;
  });
}
export const moveOverlays = (
  projection: any,
  bounds: any,
  div: any,
  isAllCoordinatesOfMarkersAreReady: any,
  sensorId: any,
  overlappingPairs: any,
  overlaysToFit: any,
) => {
  let overlaysToFitArray: any[] = isAllCoordinatesOfMarkersAreReady
  const sw: any = projection.fromLatLngToDivPixel(bounds.getSouthWest());
  const ne: any = projection.fromLatLngToDivPixel(bounds.getNorthEast());

  if (div) {
    div.style.left = sw.x + "px";
    div.style.top = ne.y + "px";
  }

  const overlays: any = isAllCoordinatesOfMarkersAreReady
  for (let i = 0; i < overlays.length; i++) {
    for (let j = i + 1; j < overlays.length; j++) {
      if (sensorId === overlays[i].id) {
        overlays[i].div = div
      } else if (sensorId === overlays[j].id) {
        overlays[j].div = div
      }
      if (overlays[i].div && overlays[j].div) {
        const newPair = [overlays[i], overlays[j]];
        if (overlaysOverlap(projection, overlays[i], overlays[j])) {
          const pairExists = isPairExisting(overlappingPairs, newPair);

          if (!pairExists) {
            overlappingPairs.push(newPair)
          }
        } else {
          const pairExists = isPairExisting(overlappingPairs, newPair);
          if (pairExists) {
            const newPairIds = newPair.map(sensor => sensor.id).sort().join();

            overlappingPairs = overlappingPairs.filter((pair: any) => {
              const pairIds = pair.map((sensor: any) => sensor.id).sort().join();
              return pairIds !== newPairIds;
            });
          }
        }
      }
    }
  }

  const displacedPositions = new Set<string>();

  overlappingPairs.forEach((newPair: any) => {
    const overlay1 = newPair[0];
    const overlay2 = newPair[1];

    if (overlay1.div && overlay2.div) {
      const position1 = projection.fromLatLngToDivPixel(new google.maps.LatLng(overlay1.lat, overlay1.lng));
      const position2 = projection.fromLatLngToDivPixel(new google.maps.LatLng(overlay2.lat, overlay2.lng));

      let offsetX: number, offsetY: number;

      const dx = position2.x - position1.x;
      const dy = position2.y - position1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const offsetDistance = 55;

      if (distance === 0) {
        offsetX = offsetDistance;
        offsetY = -offsetDistance;
      } else {
        const nx = dx / distance;
        const ny = dy / distance;
        offsetX = nx * offsetDistance;
        offsetY = ny * offsetDistance;
      }

      const adjustPosition = (x: number, y: number) => {
        let newX = x;
        let newY = y;
        while (displacedPositions.has(`${newX},${newY}`)) {
          newX += offsetDistance;
          newY += offsetDistance;
        }
        displacedPositions.add(`${newX},${newY}`);
        return [newX, newY];
      };

      if (overlay1.div || overlay2.div) {
        let newXAndNewY1: number[] = adjustPosition(position1.x - offsetX, position1.y - offsetY);
        overlay1.div.style.left = `${newXAndNewY1[0]}px`;
        overlay1.div.style.top = `${newXAndNewY1[1]}px`;
        const newLatLng1 = projection.fromDivPixelToLatLng(new google.maps.Point(newXAndNewY1[0], newXAndNewY1[1]));
        const lat1 = newLatLng1.lat();
        const lng1 = newLatLng1.lng();

        let newXAndNewY2 = adjustPosition(position2.x + offsetX, position2.y + offsetY);
        overlay2.div.style.left = `${newXAndNewY2[0]}px`;
        overlay2.div.style.top = `${newXAndNewY2[1]}px`;
        const newLatLng2 = projection.fromDivPixelToLatLng(new google.maps.Point(newXAndNewY2[0], newXAndNewY2[1]));
        const lat2 = newLatLng2.lat();
        const lng2 = newLatLng2.lng();
        overlaysToFitArray.map((overlayToFit: any) => {
          if (!overlayToFit.isChanged) {
            if (overlayToFit.id === overlay1.id) {
              overlayToFit.lat = lat1
              overlayToFit.lng = lng1
              overlayToFit.isChanged = true
            } else if (overlayToFit.id === overlay2.id) {
              overlayToFit.lat = lat2
              overlayToFit.lng = lng2
              overlayToFit.isChanged = true
            }
          }
        })
      }
    }
  })
}