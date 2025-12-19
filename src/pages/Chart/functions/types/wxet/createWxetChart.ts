import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import {logoHackernews} from "ionicons/icons";

interface ChartDataItem {
  DateTime: string;
  Solar?: number;
  RH?: number;
  Temp?: number;
  rain_display?: number;
  wind_display?: number;
  gust_display?: number;
  LW?: number;
  'Barometric Pressure'?: number;
  vaporPressure_display?: number;
  [key: string]: unknown;
}

interface ForecastDataItem {
  time: string;
  forecastTemp: number;
}

interface NwsForecastData {
  data: ForecastDataItem[];
  now: string;
}

interface AdditionalChartData {
  metric: 'AMERICA' | 'METRIC';
  type: 'ATMOS' | 'OTHER';
}

interface RootRef {
  current: am5.Root | null;
}

interface DataLabel {
  label: string;
  name: string;
  metric: string;
  color: string;
}

export const createWxetChart = (
  chartData: ChartDataItem[],
  root: RootRef,
  isMobile: boolean,
  additionalChartData: AdditionalChartData,
  nwsForecastData: NwsForecastData | null,
): void => {

  if (root.current) {
    root.current.dispose();
    root.current = null;
  }

  if (!root.current) {
    root.current = am5.Root.new("wxetChartDiv");

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
    const chart = root.current.container.children.push(am5xy.XYChart.new(root.current, {
      wheelY: "zoomX",
      maxTooltipDistance: 0,
      layout: isMobile ? root.current.verticalLayout : root.current.horizontalLayout,
      paddingLeft: 0,
      paddingTop: 20,
      paddingRight: 0,
      paddingBottom: 0
    }));

// Create axes
    const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root.current, {
      maxDeviation: 0.2,
      baseInterval: {
        timeUnit: "minute",
        count: 20
      },
      renderer: am5xy.AxisRendererX.new(root.current, {
        opposite: true,
        minorGridEnabled: true
      })
    }));

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root.current, {
      renderer: am5xy.AxisRendererY.new(root.current, {})
    }));

// Add series
    function createChartData(chartDate: number, chartValue: number) {
      return {
        date: chartDate,
        value: chartValue,
      };
    }

    function createChartDataArray(lineLabel: string) {
      const data: Array<{ date: number; value: number }> = [];
      const dataArray = lineLabel === 'forecastTemp' ? (nwsForecastData?.data || []) : chartData;
      
      dataArray.forEach((chartDataItem) => {
        let chartDate: number;
        let chartValue: number;
        
        if (lineLabel === 'forecastTemp' && 'time' in chartDataItem) {
          chartDate = new Date(chartDataItem.time).getTime();
          chartValue = Number(chartDataItem.forecastTemp || 0);
        } else if ('DateTime' in chartDataItem) {
          chartDate = new Date(chartDataItem.DateTime).getTime();
          chartValue = Number(chartDataItem[lineLabel as keyof ChartDataItem] || 0);
        } else {
          return; // Skip invalid items
        }
        
        const chartData = createChartData(chartDate, chartValue);
        data.push(chartData);
      });
      return data;
    }

    const tempMetric: string = additionalChartData.metric === 'AMERICA' ? '°F' : '°C'
    const rainMetric: string = additionalChartData.metric === 'AMERICA' ? ' in' : ' mm'
    const windMetric: string = additionalChartData.metric === 'AMERICA' ? ' MPH' : ' KPH'
    const barometricMetric: string = additionalChartData.metric === 'AMERICA' ? 'inHg' : 'kPa'

    const dataLabels: DataLabel[] = [
      {label: 'Solar', name: 'Solar Radiation', metric: ' W/m2', color: '#FFFF00'},
      {label: 'RH', name: 'RH', metric: '%', color: '#800080'},
      {label: 'Temp', name: 'Air Temp', metric: tempMetric, color: '#FF0000'},
      {label: 'rain_display', name: 'Rain', metric: rainMetric, color: '#84b1f5'},
      {label: 'wind_display', name: 'Wind Speed', metric: windMetric, color: '#f6b23b'},
      {label: 'gust_display', name: 'Wind Gust', metric: windMetric, color: '#cd8406'},
    ]
    if (additionalChartData.type === 'ATMOS') {
      dataLabels.push(
        {label: 'Barometric Pressure', name: 'Barometric Pressure', metric: barometricMetric, color: '#06d6fc'},
        {label: 'vaporPressure_display', name: 'Vapor Pressure', metric: barometricMetric, color: '#FF00FF'}
      )
    } else {
      dataLabels.push({label: 'LW', name: 'Leaf Wetness', metric: '', color: '#06d6fc'})
    }
    if (nwsForecastData) {
        dataLabels.push({label: 'forecastTemp', name: 'Forecast Temp', metric: tempMetric, color: '#FF0000'},)
        dataLabels.push({label: 'forecastWindSpeed', name: 'Forecast Wind Speed', metric: windMetric, color: '#f6b23b'},)
    }

    let lastSeries: am5xy.SmoothedXLineSeries | null = null;
    dataLabels.forEach((dataLabel) => {
      const name = dataLabel.name
      const tooltip: am5.Tooltip = am5.Tooltip.new(root.current, {
        pointerOrientation: "horizontal",
        getFillFromSprite: false,
        labelText: "{valueX.formatDate('yyyy-MM-dd hh:mm')}" + '\n' + '[bold]' + name + ' - ' + "{value}" + dataLabel.metric,
      })
      if (tooltip) {
        tooltip.get("background").setAll({
          fill: am5.color(dataLabel.color),
        })
      }
      const series = chart.series.push(am5xy.SmoothedXLineSeries.new(root.current, {
        name: name,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        legendValueText: "{valueY}",
        tension: 0.5,
        tooltip: tooltip,
        snapTooltip: true,
      }));
      series.set("stroke", am5.color(dataLabel.color))
      series.strokes.template.setAll({
        strokeWidth: 2,
      });

      const data = createChartDataArray(dataLabel.label)

      series.data.setAll(data)

      series.appear();
      lastSeries = series;
    });

// Nws Forecast
    if (nwsForecastData && lastSeries) {
      const seriesRangeDataItem = xAxis.makeDataItem({
        value: new Date(nwsForecastData.now).getTime()
      });
      lastSeries.createAxisRange(seriesRangeDataItem);
      seriesRangeDataItem.get("grid").setAll({
        visible: true,
        stroke: am5.color(0xd445d2),
        strokeWidth: 5,
        strokeOpacity: 1,
        strokeDasharray: [2, 2]
      });
      seriesRangeDataItem.get('label').setAll({
        text: "NOW",
        inside: true,
        visible: true,
        centerX: 0,
        dy: 45,
        fontSize: 13
      })

      const seriesRangeDataItemDate = xAxis.makeDataItem({
        value: new Date(nwsForecastData.now).getTime(),
        endValue: new Date(nwsForecastData.now).getTime() + 86400000 * 6
      });
      lastSeries.createAxisRange(seriesRangeDataItemDate);
      seriesRangeDataItemDate.get("axisFill").setAll({
        fill: am5.color(0xF7C815),
        fillOpacity: 0.1,
        visible: true
      });

      seriesRangeDataItem.get("grid").toFront();
      seriesRangeDataItem.get("label").toFront();
    }

// Add cursor
    const cursor = chart.set("cursor", am5xy.XYCursor.new(root.current, {
      behavior: "zoomX",
      xAxis: xAxis,
    }));

    cursor.selection.setAll({
      fill: am5.color(0xff0000),
      fillOpacity: 0.2
    });

    cursor.lineX.setAll({
      stroke: am5.color(0xff0000),
      strokeWidth: 1,
      strokeDasharray: []
    });

    cursor.lineY.set("visible", false);

// Add legend
    const legendHeight = dataLabels.length * 29
    const legend = chart.children.push(am5.Legend.new(root.current, {
      width: 200,
      paddingLeft: 15,
      height: legendHeight
    }));


    legend.itemContainers.template.set("width", am5.p100);
    legend.valueLabels.template.setAll({
      width: am5.p100,
      textAlign: "right"
    });

    legend.data.setAll(chart.series.values);

    chart.appear(1000, 100);
  }
}