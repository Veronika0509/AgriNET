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
  IonItem, IonModal, IonButton, IonButtons, IonLabel, IonImg
} from '@ionic/react';
import axios from 'axios';
import {GoogleMap} from '@capacitor/google-maps';
import {useRef} from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import InvalidChartDataImage from '../../assets/images/invalidChartData.png';

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

  const onSensorClick = (id: string, name: string) => {
    props.setPage(2)
    props.setSiteId(id)
    props.setSiteName(name)
  };

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
        console.log(error);
      }
    };

    setSiteListRequest();
  }, []);

  // Chart Data Request
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
      console.log('Что-то пошло не так', error);
    }
  };
  // Map Creating
  let map: any = null
  const mapRef = useRef<HTMLElement>();
  const moistFuelChartsAmount: any = []
  useEffect(() => {
    const createMap = async () => {
      if (!mapRef.current || !props.siteList || props.siteList.length === 0) return;

      map = await GoogleMap.create({
        id: 'My Map',
        element: mapRef.current,
        apiKey: 'AIzaSyAQ9J1_SwUUP6NCLvaTUNRSqbPt15lKBvY',
        forceCreate: true,
        config: {
          center: {
            lat: 46.093354,
            lng: -118.274636
          },
          zoom: 18
        }
      });
      for (const sensors of props.siteList) {
        try {
          let marker: any = await map.addMarker({
            coordinate: {
              lat: sensors.lat,
              lng: sensors.lng
            },
            title: sensors.name,
            snippet: sensors.name
          });
        } catch (error) {
          console.error('Ошибка при добавлении маркера:', error);
        }
      }

      const getSensorItems = () => {
        const sensorItems: any = []
        props.siteList.map((sensors: any) => {
          sensors.layers.map((sensor: any) => {
            sensor.markers.map(async (sensorItem: any) => {
              sensorItems.push(sensorItem)
            })
          })
        })
        return sensorItems
      }

      await map.setOnMarkerClickListener((event: any) => {
        const OFFSET = 0.0001;
        const usedCoordinates = new Map();
        const currentMarker = event
        props.siteList.map((sensors: any) => {
          if (currentMarker.title === sensors.name) {
            // await map.removeMarker(event.markerId)
            const sensorItems = getSensorItems()
            sensorItems.forEach((sensorItem: any) => {
              let lat = sensorItem.lat;
              let lng = sensorItem.lng;
              const key = `${lat}-${lng}`;
              if (usedCoordinates.has(key)) {
                let count = usedCoordinates.get(key);
                lat += OFFSET * count;
                lng += OFFSET * count;
                usedCoordinates.set(key, count + 1);
              } else {
                usedCoordinates.set(key, 1);
              }
              map.addMarker({
                coordinate: {lat, lng},
                title: sensorItem.sensorId,
                zIndex: 1,
                snippet: sensorItem.name
              });
              if (sensorItem.markerType === 'moist-fuel') {
                moistFuelChartsAmount.push(sensorItem)
                moistChartDataRequest(sensorItem.sensorId);
              }

            });
          } else {
            const sensorItems = getSensorItems()
            sensorItems.map((sensorItem: any) => {
              if (currentMarker.title === sensorItem.sensorId) {
                // onMarkerClick(sensorItem.sensorId, sensorItem.name)
                setIsModalOpen(true)
                setSensorName(sensorItem.name)
                setSensorId(sensorItem.sensorId)
                setSensorType(sensorItem.chartType)
                chartDataRequest(sensorItem.sensorId)
              }
            })
          }
        })
      });
    };

    createMap();
  }, [props.siteList]);

  // Marker Chart
  let moistChartData: any = []
  let invalidChartData: any = []
  let id = 0
  const moistChartDataRequest = async (propsSensorId: string) => {
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
    if (moistFuelChartsAmount.length === moistChartData.length) {
      let updatedMoistChartData: any = []
      moistChartData.map((data: any) => {
        if (data.data.length !== 0 && data.data.length !== 1) {
          updatedMoistChartData.push(data)
        } else {
          invalidChartData.push(data)
        }
      })
      setInvalidChartDataContainer(invalidChartData)
      setMoistChartDataContainer(updatedMoistChartData)
    }
  }

  useEffect(() => {
    const roots: any[] = [];
    if (moistChartDataContainer) {
      moistChartDataContainer.map((chartData: any) => {
        let root = am5.Root.new(chartData.id);
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
      })
    }
    return () => {
      roots.forEach(root => root.dispose()); // Удаляем каждый график
    };
  }, [moistChartDataContainer]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>List</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className={s.ionContent}>
        <div className="component-wrapper">
          <capacitor-google-map ref={mapRef} style={{
            display: 'inline-block',
            width: '100%',
            height: '90vh'
          }}></capacitor-google-map>
        </div>
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
        {moistChartDataContainer.map((data: any, index: number) => (
          <div className={s.chartContainer}>
            <div className={s.chartContainer}>
              <div id={data.id} key={index} className={s.chart}></div>
            </div>
          </div>
        ))}
        {invalidChartDataContainer.map((data: any) => (
          <div className={s.invalidChartDataImgContainer}>
            <div>
              <IonImg src={InvalidChartDataImage} className={s.invalidChartDataImg} alt='Invalid Chart Data'
                      key={data.id}></IonImg>
              <IonText className={s.invalidSensorIdText}>{data.sensorId}</IonText>
            </div>
          </div>
        ))}
      </IonContent>
    </IonPage>
  )
}

export default Main;