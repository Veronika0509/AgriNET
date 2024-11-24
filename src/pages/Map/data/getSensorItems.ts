export const getSensorItems = (
  markerType: string | undefined,
  siteList: any,
  siteName?: string
) => {
  const sensorItems: any = [];

  siteList.forEach((sensors: any) => {
    if (!siteName || sensors.name === siteName) {
      sensors.layers.forEach((sensor: any) => {
        sensor.markers.forEach((sensorItem: any) => {
          if (!markerType || sensorItem.markerType === markerType) {
            sensorItems.push(sensorItem);
          }
        });
      });
    }
  });

  return sensorItems;
};
