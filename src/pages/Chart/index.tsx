import React, {Component, ReactNode} from 'react';
import s from './style.module.css';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {arrowBackOutline} from "ionicons/icons";
import axios from "axios";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface ChartDataItem {
  DateTime: any;

  [key: string]: number;
}

interface ChartProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  siteList: any[];
  setSiteList: React.Dispatch<React.SetStateAction<any[]>>;
  siteId: string;
  siteName: string;
  userId: number;
}

interface ChartState {
  root?: am5.Root;
  chartData: ChartDataItem[];
  isMobile: boolean;
  disableNextButton: boolean;
  disablePrevButton: boolean;
  irrigationDates: string[];
  fullIrrigationDates: string[];
}

class Chart extends Component<ChartProps, ChartState> {
  private root?: am5.Root | null = null;

  constructor(props: ChartProps) {
    super(props);
    this.state = {
      chartData: [],
      isMobile: window.innerWidth < 850,
      disableNextButton: true,
      disablePrevButton: false,
      irrigationDates: [],
      fullIrrigationDates: []
    };
  }

  componentDidMount(): void {
    window.addEventListener('resize', this.handleResize);
    this.chartDataRequest();
    this.irrigationDatesRequest()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.root) {
      this.root.dispose();
      this.root = null;
    }
  }

  handleResize = () => {
    this.setState({isMobile: window.innerWidth < 850});
  };

  chartDataRequest = async (): Promise<void> => {
    try {
      const response = await axios.get('https://app.agrinet.us/api/chart/m', {
        params: {
          sensorId: this.props.siteId,
          days: 14
        },
      });
      this.setState({chartData: response.data.data}, () => {
        this.updateChart()
      });
    } catch (error) {
      console.log(error);
    }
  };
  irrigationDatesRequest = async (): Promise<void> => {
    let datesArray: any = []
    let fullDatesArray: any = []
    try {
      const response = await axios.get('https://app.agrinet.us/api/valve/scheduler', {
        params: {
          sensorId: this.props.siteId,
          user: this.props.userId,
          version: '42.2.1'
        },
      });
      response.data.map((valve: any) => {
        if (valve.valve1 === 'OFF') {
          datesArray.push(valve.localTime.substring(0, 10))
          fullDatesArray.push(valve.localTime)
          this.setState({irrigationDates: datesArray, fullIrrigationDates: fullDatesArray}, () => {
            this.updateChart()
          });
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  onButtonClick = async (props: number) => {
    let currentDate

    if (props === 1) {
      currentDate = this.state.chartData[this.state.chartData.length - 1].DateTime.substring(0, 10)
    } else {
      currentDate = this.state.chartData[0].DateTime.substring(0, 10)
    }

    function findNearestDate(currentDate: string, dateList: string[]) {
      const currentDateObj = new Date(currentDate);
      const dateObjects = dateList.map(date => new Date(date));
      const validDates = dateObjects.filter(props === 1 ? date => date > currentDateObj : dateObj => dateObj <= currentDateObj);
      if (props === 1) {
        const closestDate = new Date(Math.min(...validDates.map(date => date.getTime())));
        closestDate.setDate(closestDate.getDate() + 4);
        return closestDate.toISOString().split('T')[0];
      } else {
        const nearestDateObj = new Date(Math.max.apply(null, validDates.map(date => date.getTime())));
        nearestDateObj.setDate(nearestDateObj.getDate() + 4);
        return nearestDateObj.toISOString().split('T')[0];
      }
    }

    const nearestDate = new Date(findNearestDate(currentDate, this.state.irrigationDates))
    nearestDate.setDate(nearestDate.getDate() - 4);
    const year = nearestDate.getFullYear();
    const month = (nearestDate.getMonth() + 1).toString().padStart(2, '0');
    const day = nearestDate.getDate().toString().padStart(2, '0');
    const formattedNearestDate = `${year}-${month}-${day}`;

    if (formattedNearestDate === this.state.irrigationDates[0]) {
      this.setState({disableNextButton: true})
    }
    if (formattedNearestDate === this.state.irrigationDates[this.state.irrigationDates.length - 1]) {
      this.setState({disablePrevButton: true})
    }
    if (formattedNearestDate !== this.state.irrigationDates[0]) {
      if (this.state.disableNextButton) {
        this.setState({disableNextButton: false})
      }
    }
    if (formattedNearestDate !== this.state.irrigationDates[this.state.irrigationDates.length - 1]) {
      if (this.state.disablePrevButton) {
        this.setState({disablePrevButton: false})
      }
    }

    try {
      const response = await axios.get('https://app.agrinet.us/api/chart/m', {
        params: {
          sensorId: this.props.siteId,
          days: 8,
          endDate: findNearestDate(currentDate, this.state.irrigationDates),
          user: this.props.userId,
          v: 42
        },
      });
      this.setState({chartData: response.data.data}, () => {
        this.updateChart()
      });
    } catch (error) {
      console.log(error);
    }
  }

  updateChart = (): void => {
    this.createChart(this.state.chartData);
  };

  createChart = (props: any): void => {
    const chartDataWrapper = props

    if (this.root) {
      this.root.dispose();
    }

    let root = am5.Root.new("chartdiv");

    const myTheme = am5.Theme.new(root);

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
    root.setThemes([
      am5themes_Animated.new(root),
      myTheme
    ]);

// Create chart
    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      maxTooltipDistance: 0,
      pinchZoomX: true,
      layout: this.state.isMobile ? root.verticalLayout : root.horizontalLayout,
    }));

// Create axes
    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 0.2,
      baseInterval: {
        timeUnit: "minute",
        count: 30
      },
      renderer: am5xy.AxisRendererX.new(root, {
        minorGridEnabled: true
      }),
      tooltip: am5.Tooltip.new(root, {}),
    }));

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
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
    let series:any
    for (var i = 0; i < 3; i++) {
      let name = count + ' inch'
      series = chart.series.push(am5xy.LineSeries.new(root, {
        name: name,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        legendValueText: "{valueY}",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: name + ' - ' + "{percentValue} %"
        })
      }));

      count += 4

      let data = createChartDataArray(i + 1)

      series.data.setAll(data)

      series.appear();
    }

    this.state.fullIrrigationDates.map(date => {
      let seriesRangeDataItem = xAxis.makeDataItem({
        value: new Date(date).getTime()
      });
      series.createAxisRange(seriesRangeDataItem);
      seriesRangeDataItem.get("grid")?.setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0x000000),
        strokeDasharray: [2, 2],
      });
    });


// Add cursor
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);

// Add scrollbar
    var scrollbarX = am5.Scrollbar.new(root, {
      orientation: "horizontal"
    });

    chart.set("scrollbarX", scrollbarX);
    chart.bottomAxesContainer.children.push(scrollbarX);

// Add legend
    let legend = chart.children.push(am5.Legend.new(root, {
      width: 200,
      paddingLeft: this.state.isMobile ? -15 : 15,
      height: am5.percent(100)
    }));


    legend.itemContainers.template.set("width", am5.p100);
    legend.valueLabels.template.setAll({
      width: am5.p100,
      textAlign: "right"
    });

    legend.data.setAll(chart.series.values);

    chart.appear(1000, 100);

    this.root = root;
  };

  back = (): void => {
    this.props.setPage(1);
  };

  render(): ReactNode {
    return (
      <IonPage className={s.page}>
        <IonHeader>
          <IonToolbar>
            <IonIcon
              onClick={this.back}
              className={`${s.backIcon} ${'ion-margin-start'}`}
              slot='start'
              size='large'
              icon={arrowBackOutline}
            ></IonIcon>
            <IonTitle>{this.props.siteName} / {this.props.siteId}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className={s.container}>
          <div className={s.wrapper}>
            {this.props.siteList.map((cardsArray: any, index1: number) =>
              cardsArray.layers.map((cards: any, index2: number) =>
                cards.markers.map((card: any, index3: number) =>
                  card.sensorId === this.props.siteId && card.markerType === 'moist-fuel' && (
                    <div>
                      <div className={s.chart} key={`${index1}-${index2}-${index3}`} id='chartdiv'></div>
                      <div className={s.buttons}>
                        <IonButton color='tertiary' disabled={this.state.disablePrevButton}
                                   onClick={() => this.onButtonClick(0)}>Prev Irigation Event</IonButton>
                        <IonButton color='tertiary' disabled={this.state.disableNextButton}
                                   onClick={() => this.onButtonClick(1)}>Next Irigation Event</IonButton>
                      </div>
                    </div>
                  )
                )
              )
            )}
          </div>
        </IonContent>
      </IonPage>
    );
  }
}

export default Chart;
