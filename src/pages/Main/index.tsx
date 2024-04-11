import React, {useEffect, useState} from 'react';
import s from './style.module.css';
import {
  IonPage,
  IonContent,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonList,
  IonText,
  IonItem, IonModal, IonButton, IonButtons, IonLabel, IonIcon
} from '@ionic/react';
import axios from 'axios';
import {useRef} from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import invalidChartDataImage from '../../assets/images/invalidChartData.png';
import {Wrapper, Status} from "@googlemaps/react-wrapper";
import {arrowBackOutline} from "ionicons/icons";
import {createRoot} from "react-dom/client";

interface MainProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  userId: number;
  siteList: any;
  setSiteList: any;
  setSiteId: React.Dispatch<React.SetStateAction<string>>;
  setSiteName: React.Dispatch<React.SetStateAction<string>>;
  setChartData: React.Dispatch<React.SetStateAction<any>>;
  chartData: any[];
}

const Main: React.FC<MainProps> = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sensorName, setSensorName] = useState('')
  const [sensorId, setSensorId] = useState('')
  const [sensorChartType, setSensorType] = useState('')
  const [isSelectDisabled, setIsSelectDisabled] = useState(false)
  const [moistChartDataContainer, setMoistChartDataContainer] = useState<any>([])
  const [invalidChartDataContainer, setInvalidChartDataContainer] = useState([])
  const [overlayIsReady, setOverlayIsReady] = useState(false)
  const [isAllMoistFuelCoordinatesOfMarkersAreReady, setIsAllMoistFuelCoordinatesOfMarkersAreReady] = useState([])
  let allMoistFuelCoordinatesOfMarkers: any = [];
  let overlappingPairs: any[] = []
  const onSensorClick = (id: string, name: string) => {
    props.setPage(2)
    props.setSiteId(id)
    props.setSiteName(name)
  };

  // Custom Overlay
  const overlaysOverlap = (overlayProjection: any, overlayA: any, overlayB: any) => {
    const positionA = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(overlayA.lat, overlayA.lng));
    const positionB = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(overlayB.lat, overlayB.lng));
    return Math.abs(positionA.x - positionB.x) < 100 && Math.abs(positionA.y - positionB.y) < 130;
  }
  class CustomOverlayExport extends google.maps.OverlayView {
    private bounds: google.maps.LatLngBounds;
    private invalidChartDataImage: any;
    private isValidChartData: boolean;
    private chartData: any;
    private setOverlayIsReady: any

    private div?: HTMLElement;

    constructor(bounds: google.maps.LatLngBounds, invalidChartDataImage: any, isValidChartData: boolean, chartData: any, setOverlayIsReady: any) {
      super();

      this.bounds = bounds;
      this.invalidChartDataImage = invalidChartDataImage;
      this.isValidChartData = isValidChartData;
      this.chartData = chartData;
      this.setOverlayIsReady = setOverlayIsReady;
    }

    onAdd() {
      const onAddContent = new Promise((resolve: any) => {
        this.div = document.createElement("div");
        this.div.style.borderStyle = "none";
        this.div.style.borderWidth = "0px";
        this.div.style.position = "absolute";

        const content = (
          <div>
            {this.isValidChartData ? (
              <div className={s.chartContainer}>
                <div className={s.chartContainer}>
                  <div id={this.chartData.id.toString()} className={s.chart}></div>
                </div>
              </div>
            ) : (
              <div className={s.invalidChartDataImgContainer}>
                <div>
                  <img src={this.invalidChartDataImage} className={s.invalidChartDataImg} alt='Invalid Chart Data'/>
                  <p className={s.invalidSensorIdText}>{this.chartData.sensorId}</p>
                </div>
              </div>
            )}
          </div>
        )

        const panes: any = this.getPanes()!
        panes.floatPane.appendChild(this.div);

        const root = createRoot(this.div);
        root.render(content);

        resolve();
      }).then(() => {
        this.setOverlayIsReady(true);
      })
    }

    draw() {
      const overlayProjection = this.getProjection();

      const sw: any = overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest());
      const ne: any = overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast());

      if (this.div) {
        this.div.style.left = sw.x + "px";
        this.div.style.top = ne.y + "px";
        this.div.style.width = "100px";
        this.div.style.height = "130px";
      }

      const overlays: any = isAllMoistFuelCoordinatesOfMarkersAreReady
      for (let i = 0; i < overlays.length; i++) {
        for (let j = i + 1; j < overlays.length; j++) {
          if (this.chartData.sensorId === overlays[i].id) {
            overlays[i] = {
              id: overlays[i].id,
              lat: overlays[i].lat,
              lng: overlays[i].lng,
              div: this.div
            }
          } else if (this.chartData.sensorId === overlays[j].id) {
            overlays[j] = {
              id: overlays[j].id,
              lat: overlays[j].lat,
              lng: overlays[j].lng,
              div: this.div
            }
          }
          const newPair = [overlays[i], overlays[j]];
          if (overlaysOverlap(overlayProjection, overlays[i], overlays[j])) {
            const isPairExists = overlappingPairs.some(pair =>
              (pair[0] === newPair[0] && pair[1] === newPair[1]) ||
              (pair[0] === newPair[1] && pair[1] === newPair[0])
            );

            if (!isPairExists) {
              overlappingPairs.push(newPair);
            }
          } else {
            overlappingPairs = overlappingPairs.filter(pair =>
              !((pair[0] === newPair[0] && pair[1] === newPair[1]) ||
                (pair[0] === newPair[1] && pair[1] === newPair[0]))
            );
          }
        }
      }

      overlappingPairs.map((newPair: any) => {
        const overlay1 = newPair[0]
        const overlay2 = newPair[1]

        if (overlay1.div && overlay2.div) {
          const position1: any = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(overlay1.lat, overlay1.lng));
          const position2: any = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(overlay2.lat, overlay2.lng));

          let offsetX, offsetY;

          // Вычисляем дистанцию между оверлеями
          const dx = position2.x - position1.x;
          const dy = position2.y - position1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const offsetDistance = 80

          if (distance === 0) {
            offsetX = offsetDistance;
            offsetY = -offsetDistance;
          } else {
            const nx = dx / distance;
            const ny = dy / distance;
            offsetX = nx * offsetDistance;
            offsetY = ny * offsetDistance;
          }

          if (overlay1.div) {
            overlay1.div.style.left = `${position1.x - offsetX}px`;
            overlay1.div.style.top = `${position1.y - offsetY}px`;
          }

          if (overlay2.div) {
            overlay2.div.style.left = `${position2.x + offsetX}px`;
            overlay2.div.style.top = `${position2.y + offsetY}px`;
          }
        }
      })
    }

    onRemove() {
      if (this.div) {
        (this.div.parentNode as HTMLElement).removeChild(this.div);
        delete this.div;
      }
    }

    /**
     *  Set the visibility to 'hidden' or 'visible'.
     */
    hide() {
      if (this.div) {
        this.div.style.visibility = "hidden";
      }
    }

    show() {
      if (this.div) {
        this.div.style.visibility = "visible";
      }
    }

    getPosition() {
      if (this.bounds) {
        return this.bounds.getCenter();
      } else {
        return null;
      }
    }

    setMap(map: any) {
      return new Promise((resolve: any) => {
        super.setMap(map);
        resolve();
      });
    }
  }

  // setSiteListRequest
  useEffect(() => {
    const setSiteListRequest = async () => {
      try {
        const response = await axios.get('https://app.agrinet.us/api/map/sites', {
          params: {
            userId: props.userId,
          },
        })
        props.setSiteList(response.data)
      } catch (error) {
        console.log('Error: ' + error)
      }
    };

    setSiteListRequest();
  }, []);

  // Chart Data Request (Chart Page)
  const chartDataRequest = async (SensorIdProp: string) => {
    try {
      const response = await axios.get('https://app.agrinet.us/api/chart/m', {
        params: {
          sensorId: SensorIdProp,
          days: 14,
        },
      });
      props.setChartData(response.data.data);

      if (response.data.data.length === 0 || response.data.data.length === 1) {
        setIsSelectDisabled(true);
      } else {
        setIsSelectDisabled(false);
      }
    } catch (error) {
      console.log('Something went wrong ', error);
    }
  };

  // Map Creating
  const getSensorItems = (markerType: string | undefined) => {
    const sensorItems: any = []
    props.siteList.map((sensors: any) => {
      sensors.layers.map((sensor: any) => {
        sensor.markers.map(async (sensorItem: any) => {
          if (markerType) {
            if (sensorItem.markerType === markerType) {
              sensorItems.push(sensorItem)
            }
          } else {
            sensorItems.push(sensorItem)
          }
        })
      })
    })
    return sensorItems
  }
  const [map, setMap] = React.useState<any>();
  const moistFuelChartsAmount: any = []
  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  if (mapRef.current && !map) {
    const initMap = new window.google.maps.Map(mapRef.current, {
      center: {lat: 46.093354, lng: -118.274636},
      zoom: 18,
      mapTypeId: "satellite",
    });
    setMap(initMap);
  }
  useEffect(() => {
    if (map && props.siteList.length > 0 && markers.length === 0) {
      const newMarkers = props.siteList.map((sensorsGroupData: any) => {
        const groupMarker = new google.maps.Marker({
          position: {lat: sensorsGroupData.lat, lng: sensorsGroupData.lng},
          map: map,
          title: sensorsGroupData.name,
        });
        const info: string = sensorsGroupData.name
        const infoWindow = new google.maps.InfoWindow({
          content: info,
        });
        infoWindow.open(map, groupMarker);
        groupMarker.addListener('click', () => {
          const markerTitle = groupMarker.getTitle();
          groupMarker.setMap(null);
          props.siteList.map(async (sensors: any) => {
            if (markerTitle === sensors.name) {
              const sensorItems = getSensorItems(undefined)
              for (const sensorItem of sensorItems) {
                if (sensorItem.markerType === 'moist-fuel') {
                  moistFuelChartsAmount.push(sensorItem);
                  const bounds: any = new google.maps.LatLngBounds(
                    new google.maps.LatLng(sensorItem.lat, sensorItem.lng),
                    new google.maps.LatLng(sensorItem.lat + 0.0001, sensorItem.lng + 0.0001)
                  )
                  moistChartDataRequest(sensorItem.sensorId, bounds);
                } else {
                  const lat = sensorItem.lat
                  const lng = sensorItem.lng
                  const sensorMarker = new google.maps.Marker({
                    position: {lat, lng},
                    map
                  });
                  const infoWindow = new google.maps.InfoWindow({
                    content: sensorItem.name + '<br />' + sensorItem.sensorId,
                  });
                  infoWindow.open(map, sensorMarker);
                  sensorMarker.addListener('click', () => {
                    setIsModalOpen(true);
                    setSensorName(sensorItem.name);
                    setSensorId(sensorItem.sensorId);
                    setSensorType(sensorItem.markerType);
                    chartDataRequest(sensorItem.sensorId);
                  });
                }
                const lat = sensorItem.lat
                const lng = sensorItem.lng
                const id = sensorItem.sensorId
                const type: string = sensorItem.markerType
                const moistFuelSensorItems = getSensorItems('moist-fuel')
                if (type === 'moist-fuel') {
                  allMoistFuelCoordinatesOfMarkers.push({lat, lng, id})
                }
                if (allMoistFuelCoordinatesOfMarkers.length === moistFuelSensorItems.length) {
                  setIsAllMoistFuelCoordinatesOfMarkersAreReady(allMoistFuelCoordinatesOfMarkers)
                }
              }
            }
          });
        });
      });
      setMarkers(newMarkers);
    }
  }, [map]);

  // Marker Chart
  let moistChartData: any = []
  let invalidChartData: any = []
  let id = 0
  let boundsArray: any = []
  const moistChartDataRequest = async (propsSensorId: string, bounds: any) => {
    const response = await axios.get('https://app.agrinet.us/api/map/moist-fuel', {
      params: {
        sensorId: propsSensorId,
        cacheFirst: true,
        'do-not-catch-error': '',
        user: props.userId,
        v: 43
      },
    })
    id += 1
    const moistChartDataItem = {
      id: id,
      data: response.data.data,
      sensorId: propsSensorId,
      topBudgetLine: response.data.budgetLines[1].value,
      bottomBudgetLine: response.data.budgetLines[4].value
    }
    moistChartData.push(moistChartDataItem)
    boundsArray.push(bounds)
    if (moistFuelChartsAmount.length === moistChartData.length) {
      let updatedMoistChartData: any = []
      boundsArray.map((bounds: any, index: number) => {
        if (moistChartData[index].data.length !== 0 && moistChartData[index].data.length !== 1) {
          updatedMoistChartData.push([moistChartData[index], bounds])
        } else {
          invalidChartData.push([moistChartData[index], bounds])
        }
        setInvalidChartDataContainer(invalidChartData)
        setMoistChartDataContainer(updatedMoistChartData)
      })
    }
  }
  const createMarkerOverlay = (chartData: any, roots: any) => {
    let root = am5.Root.new(chartData.id.toString());
    roots.push(root);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      background: am5.Rectangle.new(root, {
        fill: am5.color(0x96fd66),
        fillOpacity: 1
      })
    }));

// Generate random date
    function createChartData(chartDate: any, chartDataValue: any) {
      return {
        date: chartDate,
        value: chartDataValue
      };
    }

    function createChartDataArray() {
      let data: any = [];
      chartData.data.map((chartDataItem: any) => {
        const chartDate = new Date(chartDataItem.DateTime).getTime()
        const chartData = createChartData(chartDate, chartDataItem.SumAve);
        data.push(chartData);
      });
      return data;
    }

// Create axes
// https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 0.2,
      baseInterval: {
        timeUnit: "minute",
        count: 30
      },
      renderer: am5xy.AxisRendererX.new(root, {
        minorGridEnabled: true
      }),
      tooltip: am5.Tooltip.new(root, {})
    }));
    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {
        pan: "zoom"
      })
    }));
    yAxis.set('visible', false)
    xAxis.set('visible', false)

// Add series
// https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    let series = chart.series.push(am5xy.LineSeries.new(root, {
      name: "Series",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}"
      })
    }));

    const chartBackground = chart.plotContainer.get("background");
    if (chartBackground !== undefined) {
      chartBackground.setAll({
        stroke: am5.color(0xCC0000),
        strokeOpacity: 1,
        fill: am5.color(0x08f908),
        fillOpacity: 1,
      });
    }
    chart.topAxesContainer.children.push(am5.Rectangle.new(root, {
      stroke: am5.color(0xCCCC00),
      strokeOpacity: 1,
      fill: am5.color(0x02c5fd),
      fillOpacity: 1,
      width: am5.percent(100),
      height: chartData.topBudgetLine,
    }));
    chart.bottomAxesContainer.children.push(am5.Rectangle.new(root, {
      stroke: am5.color(0xCCCC00),
      strokeOpacity: 1,
      fill: am5.color(0xf6363b),
      fillOpacity: 1,
      width: am5.percent(100),
      height: chartData.bottomBudgetLine,
    }));
    chart.chartContainer.children.push(am5.Label.new(root, {
      text: chartData.sensorId,
      fontSize: 13,
      fontWeight: "400",
      x: am5.p50,
      centerX: am5.p50
    }));

// Set data
    let data = createChartDataArray();
    series.data.setAll(data);

// Make stuff animate on load
// https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(1000);
    chart.appear(1000, 100);
  }
  useEffect(() => {
    if (moistChartDataContainer.length !== 0 && CustomOverlayExport) {
      const addOverlay = (() => {
        moistChartDataContainer.map((chartData: any) => {
          const overlay = new CustomOverlayExport(chartData[1], invalidChartDataImage, true, chartData[0], setOverlayIsReady);
          overlay.setMap(map);
        })
      })
      addOverlay();
    }
  }, [moistChartDataContainer, CustomOverlayExport]);
  useEffect(() => {
    if (invalidChartDataContainer.length !== 0 && CustomOverlayExport) {
      invalidChartDataContainer.map((chartData: any) => {
        const overlay: any = new CustomOverlayExport(chartData[1], invalidChartDataImage, false, chartData[0], setOverlayIsReady);
        map && overlay.setMap(map)
      })
    }
  }, [invalidChartDataContainer, CustomOverlayExport]);
  useEffect(() => {
    if (overlayIsReady) {
      const roots: any[] = [];
      moistChartDataContainer.map((chartData: any) => {
        createMarkerOverlay(chartData[0], roots)
      })

      return () => {
        roots.forEach(root => root.dispose());
      };
    }
  }, [overlayIsReady]);

  const render = (status: Status) => {
    return <h1>{status}</h1>;
  };

  const back = () => {
    props.setPage(0);
  };

  return (
    <IonPage>
      <IonHeader className={s.header}>
        <IonToolbar>
          <IonIcon
            onClick={back}
            className={`${s.backIcon} ${'ion-margin-start'}`}
            slot='start'
            size='large'
            icon={arrowBackOutline}
          ></IonIcon>
          <IonTitle>List</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className={s.ionContent}>
        <Wrapper apiKey={"AIzaSyAQ9J1_SwUUP6NCLvaTUNRSqbPt15lKBvY"} render={render}>
          <div className={s.map} ref={mapRef}></div>
        </Wrapper>
        <IonModal isOpen={isModalOpen}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => setIsModalOpen(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList lines="full">
              <IonItem>
                <IonLabel className="ion-text-wrap">
                  <h2>Name:</h2>
                  <p>{sensorName}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel className="ion-text-wrap">
                  <h2>Sensor Id:</h2>
                  <p>{sensorId}</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel className="ion-text-wrap">
                  <h2>Type:</h2>
                  <p>{sensorChartType}</p>
                </IonLabel>
              </IonItem>
            </IonList>
            {isSelectDisabled && <IonText color='danger'>Sorry, but the chart is still in development.</IonText>}
            <IonButton expand="block" className={s.modalButton} disabled={isSelectDisabled}
                       onClick={() => onSensorClick(sensorId, sensorName)}>Select</IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  )
}

export default Main;