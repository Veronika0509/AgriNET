import React, {useEffect, useRef, useState} from 'react';
import s from './style.module.css';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage, IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {arrowBackOutline} from "ionicons/icons";
import axios from "axios";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface ChartProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  siteList: any[];
  setSiteList: React.Dispatch<React.SetStateAction<any[]>>;
  siteId: string;
  siteName: string;
  userId: number;
  chartData?: any;
}

const Chart = (props: ChartProps) => {
  const root = useRef<any>(null);
  const [currentChartData, setCurrentChartData] = useState<any>([])
  const [isMobile, setIsMobile] = useState(false)
  const [disableNextButton, setDisableNextButton] = useState(true)
  const [disablePrevButton, setDisablePrevButton] = useState(false)
  const [irrigationDates, setIrrigationDates] = useState([])
  const [fullDatesArray, setFullDatesArray] = useState([])
  const [isIrrigationButtons, setIsIrrigationButtons] = useState(true)
  const [isIrrigationDataIsLoading, setIsIrrigationDataIsLoading] = useState(false)

  const handleResize = () => {
    setIsMobile(window.innerWidth < 850)
  };

  window.addEventListener('resize', handleResize)

  useEffect(() => {
    updateChart(props.chartData)
  }, [isMobile]);

  useEffect(() => {
    if (fullDatesArray) {
      updateChart(props.chartData)
    }
  }, [fullDatesArray])

  const irrigationDatesRequest = async (): Promise<void> => {
    let datesArray: any = []
    let fullDatesArrayNs: any = []

    try {
      new Promise((resolve: any) => {
        setIsIrrigationDataIsLoading(true)
        const idForIrrigationDataRequest = axios.get(`https://app.agrinet.us/api/autowater/${props.siteId}`)
        resolve(idForIrrigationDataRequest)
      }).then((idForIrrigationDataRequest: any) => {
        if (idForIrrigationDataRequest.data === '') {
          setIsIrrigationButtons(false)
          setIsIrrigationDataIsLoading(false)
        } else {
          setIsIrrigationDataIsLoading(false)
          const idForIrrigationData = idForIrrigationDataRequest.data.valve.sensorId
          new Promise((resolve: any) => {
            const response: any = axios.get('https://app.agrinet.us/api/valve/scheduler', {
              params: {
                sensorId: idForIrrigationData,
                user: props.userId,
                version: '42.2.1'
              },
            });

            resolve(response)
          }).then((response: any) => {
            let index: number = 0

            response.data.map((valve: any) => {
              if (valve.valve1 === 'OFF') {
                index += 1
              }
            })

            response.data.map((valve: any) => {
              if (valve.valve1 === 'OFF') {
                datesArray.push(valve.localTime.substring(0, 10))
                fullDatesArrayNs.push(valve.localTime)
                if (datesArray.length === index) {
                  setIrrigationDates(datesArray)
                }
                if (fullDatesArrayNs.length === index) {
                  setFullDatesArray(fullDatesArrayNs)
                }
              }
            })
          })
        }
      })
    } catch (error) {
      console.log(error);
    }
  }
  const createChart = (props: any): void => {
    const chartDataWrapper = props

    if (root.current) {
      root.current.dispose();
      root.current = null;
    }

    if (!root.current) {
      root.current = am5.Root.new("chartdiv");

      const myTheme = am5.Theme.new(root.current);

      myTheme.rule("AxisLabel", ["minor"]).setAll({
        dy: 1
      });

      myTheme.rule("Grid", ["x"]).setAll({
        strokeOpacity: 0.05
      });

      myTheme.rule("Grid", ["x", "minor"]).setAll({
        strokeOpacity: 0.05
      });

// Set themes
      root.current.setThemes([
        am5themes_Animated.new(root.current),
        myTheme
      ]);

// Create chart
      let chart = root.current.container.children.push(am5xy.XYChart.new(root.current, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        maxTooltipDistance: 0,
        pinchZoomX: true,
        layout: isMobile ? root.current.verticalLayout : root.current.horizontalLayout,
      }));

// Create axes
      let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root.current, {
        maxDeviation: 0.2,
        baseInterval: {
          timeUnit: "minute",
          count: 30
        },
        renderer: am5xy.AxisRendererX.new(root.current, {
          opposite: true,
          minorGridEnabled: true
        }),
        tooltip: am5.Tooltip.new(root.current, {}),
      }));

      let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root.current, {
        renderer: am5xy.AxisRendererY.new(root.current, {})
      }));

      yAxis.set('visible', false)

// Add series
      function createChartData(chartDate: any, chartCount: number) {
        return {
          date: chartDate,
          value: chartCount,
          percentValue: Number(chartCount.toFixed(1))
        };
      }

      function createChartDataArray(count: number) {
        let data: any = [];
        chartDataWrapper.map((chartDataItem: any) => {
          const chartDate = new Date(chartDataItem.DateTime).getTime()
          const chartData = createChartData(chartDate, chartDataItem['MS ' + count]);
          data.push(chartData);
        });
        return data;
      }

      let count = 4
      let series: any
      for (var i = 0; i < 3; i++) {
        let name = count + ' inch'
        series = chart.series.push(am5xy.LineSeries.new(root.current, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          valueXField: "date",
          legendValueText: "{valueY}",
          tooltip: am5.Tooltip.new(root.current, {
            pointerOrientation: "horizontal",
            labelText: name + ' - ' + "{percentValue} %"
          })
        }));

        count += 4

        let data = createChartDataArray(i + 1)

        series.data.setAll(data)

        series.appear();
      }
      fullDatesArray.map((date: any) => {
        let seriesRangeDataItem = xAxis.makeDataItem({
          value: new Date(date).getTime()
        });
        series.createAxisRange(seriesRangeDataItem);
        seriesRangeDataItem.get("grid").setAll({
          strokeOpacity: 1,
          visible: true,
          stroke: am5.color(0x000000),
          strokeDasharray: [2, 2],
        });
      });


// Add cursor
      let cursor = chart.set("cursor", am5xy.XYCursor.new(root.current, {
        behavior: "none"
      }));
      cursor.lineY.set("visible", false);

// Add scrollbar
      var scrollbarX = am5.Scrollbar.new(root.current, {
        orientation: "horizontal"
      });

      chart.set("scrollbarX", scrollbarX);
      chart.bottomAxesContainer.children.push(scrollbarX);

// Add legend
      let legend = chart.children.push(am5.Legend.new(root.current, {
        width: 200,
        paddingLeft: isMobile ? -15 : 15,
        height: am5.percent(100)
      }));


      legend.itemContainers.template.set("width", am5.p100);
      legend.valueLabels.template.setAll({
        width: am5.p100,
        textAlign: "right"
      });

      legend.data.setAll(chart.series.values);

      chart.appear(1000, 100);
    }
  };
  const updateChart = (props: any): void => {
    createChart(props);
  };
  const onButtonClick = async (buttonProps: number) => {
    let currentDate

    if (buttonProps === 1) {
      currentDate = currentChartData[currentChartData.length - 1].DateTime.substring(0, 10)
    } else {
      currentDate = currentChartData[0].DateTime.substring(0, 10)
    }

    function findNearestDate(currentDate: string, dateList: string[]) {
      const currentDateObj = new Date(currentDate);
      const dateObjects = dateList.map(date => new Date(date));
      const validDates = dateObjects.filter(buttonProps === 1 ? date => date > currentDateObj : dateObj => dateObj <= currentDateObj);
      if (buttonProps === 1) {
        const closestDate = new Date(Math.min(...validDates.map(date => date.getTime())));
        closestDate.setDate(closestDate.getDate() + 4);
        return closestDate.toISOString().split('T')[0];
      } else {
        const nearestDateObj = new Date(Math.max.apply(null, validDates.map(date => date.getTime())));
        nearestDateObj.setDate(nearestDateObj.getDate() + 4);
        return nearestDateObj.toISOString().split('T')[0];
      }
    }

    const nearestDate = new Date(findNearestDate(currentDate, irrigationDates))
    nearestDate.setDate(nearestDate.getDate() - 4);
    const year = nearestDate.getFullYear();
    const month = (nearestDate.getMonth() + 1).toString().padStart(2, '0');
    const day = nearestDate.getDate().toString().padStart(2, '0');
    const formattedNearestDate = `${year}-${month}-${day}`;

    if (formattedNearestDate === irrigationDates[0]) {
      setDisableNextButton(true)
    }
    if (formattedNearestDate === irrigationDates[irrigationDates.length - 1]) {
      setDisablePrevButton(true)
    }
    if (formattedNearestDate !== irrigationDates[0]) {
      if (disableNextButton) {
        setDisableNextButton(false)
      }
    }
    if (formattedNearestDate !== irrigationDates[irrigationDates.length - 1]) {
      if (disablePrevButton) {
        setDisablePrevButton(false)
      }
    }

    try {
      const response = await axios.get('https://app.agrinet.us/api/chart/m', {
        params: {
          sensorId: props.siteId,
          days: 8,
          endDate: findNearestDate(currentDate, irrigationDates),
          user: props.userId,
          v: 42
        },
      });
      new Promise((resolve: any) => {
        setCurrentChartData(response.data.data)
        resolve()
      }).then(() => {
        updateChart(response.data.data)
      })
    } catch (error) {
      console.log(error);
    }
  }
  const back = (): void => {
    props.setPage(1);
  };

  useEffect(() => {
    setCurrentChartData(props.chartData)
    updateChart(props.chartData)
    irrigationDatesRequest()
    handleResize()
  }, []);

  return (
    <IonPage className={s.page}>
      <IonHeader>
        <IonToolbar>
          <IonIcon
            onClick={back}
            className={`${s.backIcon} ${'ion-margin-start'}`}
            slot='start'
            size='large'
            icon={arrowBackOutline}
          ></IonIcon>
          <IonTitle>{props.siteName} / {props.siteId}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className={s.container}>
        <div className={s.wrapper}>
          <div>
            <div className={s.chart} id='chartdiv'></div>
            {isIrrigationDataIsLoading ? (
              <p>Loading...</p>
            ) : (
              <div>
                {!isIrrigationButtons && (
                  <IonText color='danger'>Sorry, but irrigation data is not loaded</IonText>
                )}
                {isIrrigationButtons && (
                  <div className={s.buttons}>
                    <IonButton color='tertiary' disabled={disablePrevButton}
                               onClick={() => onButtonClick(0)}>Prev Irigation Event</IonButton>
                    <IonButton color='tertiary' disabled={disableNextButton}
                               onClick={() => onButtonClick(1)}>Next Irigation Event</IonButton>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default Chart;
