import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import {updateCommentDate} from "../../../components/AddComment/data/updateCommentDate";
import {removeComment} from "../../../components/AddComment/data/removeComment";

export const createTempChart = (
  chartData: any,
  root: any,
  isMobile: boolean,
  additionalChartData: any,
  nwsForecastData: any,
  setTempAddCommentModal: any,
  tempAddCommentItemShowed: any,
  tempComments: any,
  updateCommentsArray: any,
  userId: any,
  updateChart: any,
  isTempCommentsShowed: boolean,
  setTabularDataColors?: any
) => {
  if (root.current) {
    root.current.dispose();
    root.current = null;
  }

  if (!root.current) {
    root.current = am5.Root.new("tempChartDiv");

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
      wheelY: "zoomX",
      maxTooltipDistance: 0,
      layout: isMobile ? root.current.verticalLayout : root.current.horizontalLayout,
      paddingLeft: 0,
      paddingTop: 20,
      paddingRight: 0,
      paddingBottom: 0
    }));

// Create axes
    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root.current, {
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

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root.current, {
      renderer: am5xy.AxisRendererY.new(root.current, {})
    }));

// Add series
    function createChartData(chartDate: any, chartValue: number) {
      return {
        date: chartDate,
        value: chartValue,
      };
    }

    function createChartDataArray(lineLabel: string) {
      let data: any = [];
      const dataArray = lineLabel === 'forecastTemp' ? nwsForecastData.data : chartData
      dataArray.map((chartDataItem: any) => {
        const chartDate = lineLabel === 'forecastTemp' ? new Date(chartDataItem.time).getTime() : new Date(chartDataItem.DateTime).getTime()
        const chartData = createChartData(chartDate, chartDataItem[lineLabel]);
        data.push(chartData);
      });
      return data;
    }

    const metricSign = additionalChartData.metric === 'AMERICA' ? '°F' : '°C'

    let dataLabels = [
      {label: 'MS 1', name: 'Temperature', tooltip: 'Temp', metric: metricSign},
      {label: 'MS DU', name: 'Dew Point', tooltip: 'Dew Point', metric: metricSign},
      {label: 'MS 3', name: 'Relative Humidity', tooltip: 'RH', metric: '%'},
      {label: 'leafWetness', name: 'Leaf Wetness', tooltip: 'Leaf Wetness', metric: '%'},
      {label: 'analog1', name: 'Analog 1', tooltip: 'Analog 1', metric: ''},
      {label: 'analog2', name: 'Analog 2', tooltip: 'Analog 2', metric: ''},
      {label: 'psi', name: 'PSI', tooltip: 'PSI', metric: ''},
      {label: 'waterTemp', name: 'Water Temperature', tooltip: 'Water Temp', metric: "°F"}
    ]

    if (nwsForecastData) {
      dataLabels.push({label: 'forecastTemp', name: 'Forecast Temp', tooltip: 'Forecast Temp', metric: metricSign})
    }

    let series: any
    let seriesColors: any = []
    dataLabels.map((dataLabel) => {
      series = chart.series.push(am5xy.SmoothedXLineSeries.new(root.current, {
        name: dataLabel.name,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        legendValueText: "{valueY}",
        tension: 0.5,
        tooltip: am5.Tooltip.new(root.current, {
          pointerOrientation: "horizontal",
          labelText: "{valueX.formatDate('yyyy-MM-dd hh:mm')}" + '\n' + '[bold]' + dataLabel.tooltip + ' - ' + "{value}" + dataLabel.metric
        }),
        snapTooltip: true,
      }));
      series.strokes.template.setAll({
        strokeWidth: 2,
      });

      let data = createChartDataArray(dataLabel.label)
      series.data.setAll(data)

      seriesColors.push(series.get('stroke'))

      series.appear();
    })

    if (setTabularDataColors) {
      setTabularDataColors(seriesColors)
    }

// Nws Forecast
    if (nwsForecastData) {
      let seriesRangeDataItem = xAxis.makeDataItem({
        value: new Date(nwsForecastData.now).getTime()
      });
      series.createAxisRange(seriesRangeDataItem);
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

      let seriesRangeDataItemDate = xAxis.makeDataItem({
        value: new Date(nwsForecastData.now).getTime(),
        endValue: new Date(nwsForecastData.now).getTime() + 86400000 * 6
      });
      series.createAxisRange(seriesRangeDataItemDate);
      seriesRangeDataItemDate.get("axisFill").setAll({
        fill: am5.color(0xF7C815),
        fillOpacity: 0.1,
        visible: true
      });

      seriesRangeDataItem.get("grid").toFront();
      seriesRangeDataItem.get("label").toFront();
    }

// Add cursor
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root.current, {
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

// Add Comments
    if (tempAddCommentItemShowed) {
      chart.events.on("click", (ev: any) => {
        let xAxis = chart.xAxes.getIndex(0);

        let xPosition = xAxis.toAxisPosition(ev.point.x / chart.plotContainer.width());

        let clickDate = xAxis.positionToDate(xPosition);

        setTempAddCommentModal(clickDate)
      });
    }
    if (tempComments && isTempCommentsShowed) {
      const colors: any = {
        'Advisory': 'F08080',
        'Plant Health': '90EE90',
        'Weather': 'ADD8E6',
        'Irrigation': 'F0F8FF',
        'Growth Stage': 'A9A9A9',
        'Chemical App': '8FBC8F',
        'Pest': 'DB7093',
        'Foliage': '9370DB',
        'Soil Type': '778899',
        'Other': '20B2AA',
        'Percolation': 'F0F8FF',
        'Root Uptake': '9F7D4C',
        'Hands-on': 'C05339',
        'Pressure Bomb': 'F0A6B4',
        'AutoWATER': '04F3FC',
        'Installation': 'FFFFFF',
      }

      let labelsArray: any[] = []

      tempComments.forEach((moistMainComment: any) => {
        const commentColor: string = moistMainComment.color_id ? `#${colors[Object.keys(colors)[moistMainComment.color_id - 1]]}` : `#FBFFA6`;
        const rangeDataItem = xAxis.makeDataItem({})
        xAxis.createAxisRange(rangeDataItem)
        let isContainerDragging: boolean = false
        const container = am5.Container.new(root.current, {
          centerX: am5.p50,
          draggable: true,
          layout: root.verticalLayout,
          dy: 4,
        })
        container.adapters.add("y", function () {
          return 0
        })
        container.adapters.add("x", function (x: any) {
          return Math.max(0, Math.min(chart.plotContainer.width(), x))
        })
        container.events.on("pointerdown", function () {
          container.set('draggable', isContainerDragging)
        })
        container.events.on("dragged", function () {
          updateLabel()
          cursor.set('behavior', 'none')
        })
        container.events.on("dragstop", function () {
          isContainerDragging = false
          cursor.set('behavior', 'zoomX')
          const position = xAxis.toAxisPosition(container.x() / chart.plotContainer.width())
          const newDate = root.current.dateFormatter.format(new Date(xAxis.positionToValue(position)), "yyyy-MM-dd HH:mm")
          new Promise((resolve: any) => {
            updateCommentDate(moistMainComment.id, newDate, userId, resolve)
          }).then(() => {
            updateCommentsArray('T')
          })
        })
        xAxis.topGridContainer.children.push(container)
        rangeDataItem.set(
          "bullet",
          am5xy.AxisBullet.new(root.current, {
            sprite: container,
          })
        )
        rangeDataItem.get("grid").setAll({
          strokeOpacity: 1,
          visible: true,
          stroke: am5.color(commentColor),
          strokeWidth: 6,
          location: 0,
        })
        container.set("background", am5.RoundedRectangle.new(root.current, {fill: am5.color(commentColor)}))

        const label = container.children.push(
          am5.Label.new(root.current, {
            text: `${moistMainComment.key}\n${moistMainComment.color_id ? `${Object.keys(colors)[moistMainComment.color_id - 1]}\n` : ''}${moistMainComment.text}`,
            fill: am5.color(0x000000),
            maxWidth: 150,
            // minHeight: moistMainComment.color_id ? 60 : 45,
            oversizedBehavior: "wrap",
            fontSize: 12,
            paddingTop: 4,
            paddingLeft: 5,
            paddingRight: 5,
            centerX: am5.p50
          })
        );

        labelsArray.push(label);
        let buttonsContainer = label.children.push(am5.Container.new(root.current, {
          layout: root.current.horizontalLayout,
          x: am5.p100,
          y: 0,
          centerX: am5.p100,
          paddingTop: 3,
          paddingRight: 3,
        }));
        let dragButton = buttonsContainer.children.push(am5.Button.new(root.current, {
          width: 20,
          height: 20,
          cursorOverStyle: "ew-resize",
          background: am5.Rectangle.new(root.current, {
            fill: am5.color(0xffffff),
            fillOpacity: 0,
          }),
          dx: -20
        }));
        dragButton.children.push(am5.Picture.new(root.current, {
          src: "https://img.icons8.com/?size=100&id=98070&format=png&color=000000",
          width: 12,
          height: 12,
          centerX: am5.p50,
          centerY: am5.p50
        }));
        dragButton.events.on('pointerdown', () => {
          isContainerDragging = true
        })
        let closeButton = buttonsContainer.children.push(am5.Button.new(root.current, {
          width: 20,
          height: 20,
          cursorOverStyle: "pointer",
          background: am5.Rectangle.new(root.current, {
            fill: am5.color(0xffffff),
            fillOpacity: 0,
          }),
        }));
        closeButton.children.push(am5.Picture.new(root.current, {
          src: "https://img.icons8.com/?size=100&id=8112&format=png&color=000000",
          width: 12,
          height: 12,
          centerX: am5.p50,
          centerY: am5.p50
        }));
        closeButton.events.on('click', () => {
          if (window.confirm('Are you sure want to delete this message?')) {
            new Promise((resolve: any) => {
              removeComment(moistMainComment.id, userId, resolve)
            }).then(() => {
              updateCommentsArray('T')
              updateChart('comments')
              label.dispose()
              rangeDataItem.dispose()
            })
          }
        })

        function updateLabel(value?: any) {
          const x = container.x()
          const position = xAxis.toAxisPosition(x / chart.plotContainer.width())

          if (value == null) {
            value = xAxis.positionToValue(position)
          }

          label.set("text", `${root.current.dateFormatter.format(new Date(value), "yyyy-MM-dd HH:mm")}\n${moistMainComment.color_id ? `${Object.keys(colors)[moistMainComment.color_id - 1]}\n` : ''}${moistMainComment.text}`)

          rangeDataItem.set("value", value)
        }
        function positionLabels() {
          let labels = labelsArray;

          labels.sort((a: any, b: any) => {
            const aParent = a.parent;
            const bParent = b.parent;
            if (!aParent || !bParent) return 0;
            return aParent.x() - bParent.x();
          });

          labels.forEach((label: any) => {
            label.set("y", 0);
          });

          for (let i = 0; i < labels.length; i++) {
            let currentLabel = labels[i];
            let yOffset = 0;
            let overlap = true;

            while (overlap) {
              overlap = false;

              for (let j = 0; j < i; j++) {
                let otherLabel = labels[j];

                if (doLabelsOverlap(currentLabel, otherLabel)) {
                  overlap = true;
                  yOffset = Math.max(
                    yOffset,
                    otherLabel.y() + otherLabel.height() + 5
                  );
                }
              }

              if (overlap) {
                currentLabel.set("y", yOffset);
              }
            }
          }
        }

        function doLabelsOverlap(label1: any, label2: any) {
          const parent1 = label1.parent;
          const parent2 = label2.parent;
          if (!parent1 || !parent2) return false;

          const x1 = parent1.x();
          const x2 = parent2.x();
          const y1 = label1.y();
          const y2 = label2.y();
          const w1 = label1.width();
          const w2 = label2.width();
          const h1 = label1.height();
          const h2 = label2.height();

          return !(x1 + w1 < x2 || x2 + w2 < x1 ||
            y1 + h1 < y2 || y2 + h2 < y1);
        }

        root.current.events.on("frameended", positionLabels)

        series.events.on("datavalidated", () => {
          const commentDate = new Date(moistMainComment.key).getTime()
          rangeDataItem.set("value", commentDate)
          updateLabel(commentDate)
        })
      });
    }

// Add legend
    let legend = chart.children.push(am5.Legend.new(root.current, {
      width: 230,
      paddingLeft: 15,
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
}