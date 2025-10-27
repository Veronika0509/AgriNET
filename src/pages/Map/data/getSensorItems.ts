import type { Site } from '../../../types';

interface SensorItem {
  markerType: string;
  sensorId: string;
  [key: string]: unknown;
}

interface SiteWithLayers extends Site {
  layers: {
    markers: SensorItem[];
  }[];
}

export const getSensorItems = (
  markerType: string | undefined,
  siteList: SiteWithLayers[],
  siteName?: string
): SensorItem[] => {
  const sensorItems: SensorItem[] = [];
  siteList.forEach((site: SiteWithLayers) => {
    if (!siteName || site.name === siteName) {
      site.layers.forEach((layer) => {
        layer.markers.forEach((sensorItem: SensorItem) => {
          if (!markerType || sensorItem.markerType === markerType) {
            sensorItems.push(sensorItem);
          }
        });
      });
    }
  });

  return sensorItems;
};
