import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";

interface BudgetLine {
  value: number;
  label: string;
}

interface ChartDataItem {
  DateTime: string;
  SumAve: number;
  [key: string]: unknown;
}

interface CreateBudgetChartProps {
  chartRoot: { current: am5.Root | null };
  chartData: ChartDataItem[];
  budgetLines: BudgetLine[];
}

export const createBudgetChart = (props: CreateBudgetChartProps) => {
  if (props.chartRoot.current) {
    props.chartRoot.current.dispose();
    props.chartRoot.current = null;
  }
  if (!props.chartRoot.current) {
    props.chartRoot.current = am5.Root.new('budgetChart');

    const myTheme = am5.Theme.new(props.chartRoot.current);

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
    props.chartRoot.current.setThemes([
      am5themes_Animated.new(props.chartRoot.current),
      myTheme
    ]);

    // Create chart
    const chart = props.chartRoot.current.container.children.push(am5xy.XYChart.new(props.chartRoot.current, {
      wheelY: "zoomX",
      maxTooltipDistance: undefined,
      paddingLeft: 0
    }));

// Create axes
    const xAxis = chart.xAxes.push(am5xy.DateAxis.new(props.chartRoot.current, {
      maxDeviation: 0.2,
      baseInterval: {
        timeUnit: "minute",
        count: 20
      },
      renderer: am5xy.AxisRendererX.new(props.chartRoot.current, {
        opposite: true,
        minorGridEnabled: true
      })
    }));

    xAxis.get("renderer").labels.template.set("visible", false);

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(props.chartRoot.current, {
      renderer: am5xy.AxisRendererY.new(props.chartRoot.current, {})
    }));

// Add series
    function createSumChartData(chartDate: number, chartCount: number) {
      return {
        date: chartDate,
        value: chartCount
      };
    }

    function createSumChartDataArray() {
      const data: Array<{ date: number; value: number }> = [];
      props.chartData.map((chartDataItem: ChartDataItem) => {
        const chartDate = new Date(chartDataItem.DateTime).getTime()
        const chartData = createSumChartData(chartDate, chartDataItem['SumAve']);
        data.push(chartData);
      });
      return data;
    }

    const series = chart.series.push(am5xy.SmoothedXLineSeries.new(props.chartRoot.current!, {
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tension: 0.5,
      tooltip: am5.Tooltip.new(props.chartRoot.current, {
        pointerOrientation: "horizontal",
        labelText: "{valueX.formatDate('yyyy-MM-dd hh:mm')}" + '\n' + '[bold]' + "Sum Average = {value}%"
      }),
      snapTooltip: true,
      stroke: am5.color(6779356)
    }));
    series.strokes.template.setAll({
      strokeWidth: 2,
    });
    const data = createSumChartDataArray()
    series.data.setAll(data)
    series.appear();

    // Budget Sections
    if (props.budgetLines[2]?.value && props.chartRoot.current) {
      const seriesRangeDataItem = yAxis.makeDataItem({
        value: props.budgetLines[2].value
      });
      series.createAxisRange(seriesRangeDataItem);
      seriesRangeDataItem.get("grid")?.setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0x000000),
        strokeDasharray: [15, 15],
      });
      seriesRangeDataItem.get("label")?.setAll({
        text: props.budgetLines[2].label,
        fill: am5.color(0x000000),
        background: am5.RoundedRectangle.new(props.chartRoot.current, {
          fill: am5.color(0xffffff)
        }),
        inside: true,
        fontSize: 12,
        centerX: 0,
        centerY: am5.p0,
        y: -10,
        visible: true
      });
    }
    if (props.budgetLines[3]?.value && props.chartRoot.current) {
      const seriesRangeDataItem = yAxis.makeDataItem({
        value: props.budgetLines[3].value
      });
      series.createAxisRange(seriesRangeDataItem);
      seriesRangeDataItem.get("grid")?.setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0x000000),
        strokeDasharray: [15, 15],
      });
      seriesRangeDataItem.get("label")?.setAll({
        text: props.budgetLines[3].label,
        fill: am5.color(0x000000),
        background: am5.RoundedRectangle.new(props.chartRoot.current, {
          fill: am5.color(0xffffff)
        }),
        inside: true,
        fontSize: 12,
        centerX: 0,
        centerY: 0,
        visible: true
      });
    }

    if (props.chartRoot.current) {
      const middleBottomLine = yAxis.makeDataItem({
        value: props.budgetLines[4].value
      });
      series.createAxisRange(middleBottomLine);
      middleBottomLine.get("grid")?.setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0xCCCC00),
        strokeDasharray: [4, 4],
      });
      middleBottomLine.get("label")?.setAll({
        text: props.budgetLines[4].label,
        fill: am5.color(0x000000),
        background: am5.RoundedRectangle.new(props.chartRoot.current, {
          fill: am5.color(0xffffff)
        }),
        inside: true,
        fontSize: 12,
        centerX: 0,
        centerY: 0,
        visible: true
      });

      const topMiddleLine = yAxis.makeDataItem({
        value: props.budgetLines[1].value
      });
      series.createAxisRange(topMiddleLine);
      topMiddleLine.get("grid")?.setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0xCCCC00),
        strokeDasharray: [4, 4],
      });
      topMiddleLine.get("label")?.setAll({
        text: props.budgetLines[1].label,
        fill: am5.color(0x000000),
        background: am5.RoundedRectangle.new(props.chartRoot.current, {
          fill: am5.color(0xffffff)
        }),
        inside: true,
        fontSize: 12,
        centerX: 0,
        centerY: 0,
        visible: true
      });
    }

    // Regions
    if (props.chartRoot.current) {
      const topBudgetRegion = yAxis.makeDataItem({
        value: props.budgetLines[1].value,
        endValue: 100
      });
      series.createAxisRange(topBudgetRegion);
      topBudgetRegion.get("grid")?.setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0xCCCC00),
        strokeDasharray: [4, 4]
      });
      topBudgetRegion.get("axisFill")?.setAll({
        fill: am5.color(0x02c5fd),
        fillOpacity: .2,
        visible: true,
      });
      topBudgetRegion.get("label")?.setAll({
        text: props.budgetLines[1].label,
        fill: am5.color(0x000000),
        background: am5.RoundedRectangle.new(props.chartRoot.current, {
          fill: am5.color(0xffffff)
        }),
        location: 0,
        inside: true,
        fontSize: 12,
        centerX: 0,
        centerY: 0,
        visible: true
      });

      const middleBudgetRegion = yAxis.makeDataItem({
        value: props.budgetLines[1].value,
        endValue: props.budgetLines[4].value
      });
      series.createAxisRange(middleBudgetRegion);
      middleBudgetRegion.get("grid")?.setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0xCC0000),
        strokeDasharray: [4, 4]
      });
      middleBudgetRegion.get("axisFill")?.setAll({
        fill: am5.color(0x08f908),
        fillOpacity: .2,
        visible: true
      });

      const bottomBudgetRegion = yAxis.makeDataItem({
        value: props.budgetLines[4].value,
        endValue: 0
      });
      series.createAxisRange(bottomBudgetRegion);
      bottomBudgetRegion.get("grid")?.setAll({
        strokeOpacity: 1,
        visible: true,
        stroke: am5.color(0xCCCC00),
        strokeDasharray: [4, 4]
      });
      bottomBudgetRegion.get("axisFill")?.setAll({
        fill: am5.color(0xf6363b),
        fillOpacity: .2,
        visible: true
      });
      bottomBudgetRegion.get("label")?.setAll({
        text: props.budgetLines[4].label,
        fill: am5.color(0x000000),
        background: am5.RoundedRectangle.new(props.chartRoot.current, {
          fill: am5.color(0xffffff)
        }),
        location: 0,
        inside: true,
        fontSize: 12,
        centerX: 0,
        centerY: 0,
        visible: true
      });
    }

    // Add cursor
    const cursor = chart.set("cursor", am5xy.XYCursor.new(props.chartRoot.current, {
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

    chart.appear(1000, 100);
  }
}