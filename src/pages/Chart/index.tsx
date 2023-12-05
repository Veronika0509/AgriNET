import React, { Component, ReactNode } from 'react';
import s from './style.module.css';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import axios from "axios";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface ChartProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  siteList: any;
  setSiteList: any;
  siteId: string;
}

interface ChartState {
  root?: am5.Root;
  chartData: any[];
}

class Chart extends Component<ChartProps, ChartState> {
  private root?: am5.Root | null = null;

  constructor(props: ChartProps) {
    super(props);
    this.state = {
      chartData: [],
    };
  }

  componentDidMount(): void {
    this.fetchData();
  }

  componentWillUnmount() {
    if (this.root) {
      this.root.dispose();
      this.root = null;
    }
  }

  fetchData = async (): Promise<void> => {
    try {
      const response = await axios.get('https://app.agrinet.us/api/chart/m', {
        params: {
          sensorId: this.props.siteId,
          days: 14,
          includeHistoricalData: false,
        },
      });
      this.setState({ chartData: response.data.data }, () => {
        this.createChart();
      });
    } catch (error) {
      console.log(error);
    }
  };

  createChart = (): void => {
    const chartDataWrapper = this.state.chartData

    if (this.root) {
      return;
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
      pinchZoomX: true
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
      tooltip: am5.Tooltip.new(root, {})
    }));

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));


// Add series
    function createChartData(chartDate: any, chartCount: number) {
      return {
        date: chartDate,
        value: chartCount
      };
    }
    function createChartDataArray(count: number) {
      let data: any = [];
      chartDataWrapper.map((chartDataItem) => {
        const chartDate = new Date(chartDataItem.DateTime).getTime()
        const chartData = createChartData(chartDate, chartDataItem['MS ' + count]);
        data.push(chartData);
      });
      return data;
    }

    let count = 4
    for (var i = 0; i < 3; i++) {
      let series = chart.series.push(am5xy.LineSeries.new(root, {
        name: count + ' inch',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        legendValueText: "{valueY}",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "{valueY} "
        })
      }));

      count += 4

      let data = createChartDataArray(i + 1)

      series.data.setAll(data)

      series.appear();
    }


// Add cursor
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);


// Add scrollbar
    chart.set("scrollbarX", am5.Scrollbar.new(root, {
      orientation: "horizontal"
    }));

    chart.set("scrollbarY", am5.Scrollbar.new(root, {
      orientation: "vertical"
    }));


// Add legend
    let legend = chart.rightAxesContainer.children.push(am5.Legend.new(root, {
      width: 200,
      paddingLeft: 15,
      height: am5.percent(100)
    }));

    legend.itemContainers.template.events.on("pointerover", function (e) {
      let itemContainer = e.target;

      // As series list is data of a legend, dataContext is series
      let series = itemContainer.dataItem.dataContext;

      chart.series.each(function (chartSeries) {
        if (chartSeries != series) {
          chartSeries.strokes.template.setAll({
            strokeOpacity: 0.15,
            stroke: am5.color(0x000000)
          });
        } else {
          chartSeries.strokes.template.setAll({
            strokeWidth: 3
          });
        }
      })
    })

    legend.itemContainers.template.events.on("pointerout", function (e) {
      let itemContainer = e.target;
      let series = itemContainer.dataItem.dataContext;

      chart.series.each(function (chartSeries) {
        chartSeries.strokes.template.setAll({
          strokeOpacity: 1,
          strokeWidth: 1,
          stroke: chartSeries.get("fill")
        });
      });
    })

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
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonIcon
              onClick={this.back}
              className={`${s.backIcon} ${'ion-margin-start'}`}
              slot='start'
              size='large'
              icon={arrowBackOutline}
            ></IonIcon>
            <IonTitle>Chart</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className={s.wrapper}>
            <IonText className={s.daysText}>14 days</IonText>
            {this.props.siteList.map((cardsArray: any) =>
              cardsArray.layers.map((cards: any) =>
                cards.markers.map((card: any) =>
                    card.sensorId === this.props.siteId && card.markerType === 'moist-fuel' && (
                      <div className={s.chart} id='chartdiv'></div>
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
