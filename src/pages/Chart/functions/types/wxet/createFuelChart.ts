import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";

interface FuelChartDataItem {
  time: string;
  value: number;
}

interface FuelComment {
  id: string;
  key: string;
  text: string;
  color_id?: number;
  [key: string]: unknown;
}

interface RootRef {
  current: am5.Root | null;
}

interface SetCommentModalParams {
  date: Date;
  type: string;
}

type SetterFunction<T> = (value: T) => void;

export const createFuelChart = (
  chartData: FuelChartDataItem[],
  root: RootRef,
  fuelAddCommentItemShowed: boolean,
  setFuelAddCommentModal: (params: SetCommentModalParams) => void,
  fuelComments: FuelComment[],
  isFuelCommentsShowed: boolean,
): void => {
  if (root.current) {
    root.current.dispose();
    root.current = null;
  }

  if (!root.current) {
    root.current = am5.Root.new("fuelChartDiv");

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
      maxTooltipDistance: undefined,
      layout: root.current.horizontalLayout,
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
    function createChartDataArray() {
      const data: Array<{ date: number; value: number }> = [];
      chartData.forEach((chartDataItem: FuelChartDataItem) => {
        const chartDate = new Date(chartDataItem.time).getTime()
        const chartData = {
          date: chartDate,
          value: Number(chartDataItem.value),
        };
        data.push(chartData);
      });
      return data;
    }

    const series = chart.series.push(am5xy.SmoothedXLineSeries.new(root.current, {
      name: 'Fuel Series',
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      legendValueText: "{valueY}",
      tension: 0.5,
      tooltip: am5.Tooltip.new(root.current, {
        pointerOrientation: "horizontal",
        labelText: "{valueX.formatDate('yyyy-MM-dd hh:mm')}" + '\n' + '[bold]' + "{value}"
      }),
      snapTooltip: true,
    }));
    series.strokes.template.setAll({
      strokeWidth: 2,
    });

    const data = createChartDataArray()

    series.data.setAll(data)

    series.appear();

    // Add Comments
    if (fuelAddCommentItemShowed) {
      chart.events.on("click", (ev: am5.ISpritePointerEvent) => {
        const xAxis = chart.xAxes.getIndex(0);

        const xPosition = xAxis.toAxisPosition(ev.point.x / chart.plotContainer.width());

        const clickDate = (xAxis as any).positionToDate(xPosition);

        setFuelAddCommentModal({date: clickDate, type: 'main'})
      });
    }
    if (fuelComments && isFuelCommentsShowed) {
      const colors: Record<string, string> = {
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

      const labelsArray: am5.Container[] = []

      fuelComments.forEach((moistMainComment: FuelComment) => {
        const commentColor: string = moistMainComment.color_id ? `#${colors[Object.keys(colors)[moistMainComment.color_id - 1]]}` : `#FBFFA6`;
        const rangeDataItem = xAxis.makeDataItem({})
        xAxis.createAxisRange(rangeDataItem)
        let isContainerDragging: boolean = false
        const container = am5.Container.new(root.current, {
          centerX: am5.p50,
          draggable: true,
          layout: (root as any).verticalLayout,
          dy: 4,
        })
        container.adapters.add("y", function () {
          return 0
        })
        container.adapters.add("x", function (x: number) {
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
          // new Promise((resolve: any) => {
          //   updateCommentDate(moistMainComment.id, newDate, props.userId, resolve)
          // }).then(() => {
          //   props.updateCommentsArray('M')
          // })
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
        const buttonsContainer = label.children.push(am5.Container.new(root.current, {
          layout: root.current.horizontalLayout,
          x: am5.p100,
          y: 0,
          centerX: am5.p100,
          paddingTop: 3,
          paddingRight: 3,
        }));
        const dragButton = buttonsContainer.children.push(am5.Button.new(root.current, {
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
        const closeButton = buttonsContainer.children.push(am5.Button.new(root.current, {
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
            // new Promise((resolve: any) => {
            //   removeComment(moistMainComment.id, props.userId, resolve)
            // }).then(() => {
            //   props.updateCommentsArray('M')
            //   props.updateChart('comments')
            //   label.dispose()
            //   rangeDataItem.dispose()
            // })
          }
        })

        function updateLabel(value?: number) {
          const x = container.x()
          const position = xAxis.toAxisPosition(x / chart.plotContainer.width())

          if (value == null) {
            value = xAxis.positionToValue(position)
          }

          label.set("text", `${root.current.dateFormatter.format(new Date(value), "yyyy-MM-dd HH:mm")}\n${moistMainComment.color_id ? `${Object.keys(colors)[moistMainComment.color_id - 1]}\n` : ''}${moistMainComment.text}`)

          rangeDataItem.set("value", value)
        }

        function positionLabels() {
          const labels = labelsArray;

          labels.sort((a: am5.Container, b: am5.Container) => {
            const aParent = a.parent;
            const bParent = b.parent;
            if (!aParent || !bParent) return 0;
            return aParent.x() - bParent.x();
          });

          labels.forEach((label: am5.Container) => {
            label.set("y", 0);
          });

          for (let i = 0; i < labels.length; i++) {
            const currentLabel = labels[i];
            let yOffset = 0;
            let overlap = true;

            while (overlap) {
              overlap = false;

              for (let j = 0; j < i; j++) {
                const otherLabel = labels[j];

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

        function doLabelsOverlap(label1: am5.Container, label2: am5.Container) {
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

    chart.appear(1000, 100);
  }
}