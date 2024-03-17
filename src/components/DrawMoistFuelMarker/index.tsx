import s from '../../pages/Main/style.module.css';
import {createRoot} from 'react-dom/client';

class CustomOverlay extends google.maps.OverlayView {
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

  /**
   * onAdd is called when the map's panes are ready and the overlay has been
   * added to the map.
   */
  onAdd() {
    const onAddContent = new Promise((resolve) => {
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

      // document.body.appendChild(this.div);
      const root = createRoot(this.div);
      root.render(content);

      resolve(content);
    }).then((content) => {
      this.setOverlayIsReady(true);
    })
  }

  draw() {
    // We use the south-west and north-east
    // coordinates of the overlay to peg it to the correct position and size.
    // To do this, we need to retrieve the projection from the overlay.
    const overlayProjection = this.getProjection();
    // console.log(overlayProjection, this.bounds.getSouthWest(), this.bounds.getNorthEast())

    // Retrieve the south-west and north-east coordinates of this overlay
    // in LatLngs and convert them to pixel coordinates.
    // We'll use these coordinates to resize the div.
    const sw = overlayProjection.fromLatLngToDivPixel(
      this.bounds.getSouthWest()
    )!;
    const ne = overlayProjection.fromLatLngToDivPixel(
      this.bounds.getNorthEast()
    )!;

    // Resize the image's div to fit the indicated dimensions.
    if (this.div) {
      this.div.style.left = sw.x + "px";
      this.div.style.top = ne.y + "px";
      this.div.style.width = "100px";
      this.div.style.height = "130px";
    }
  }

  /**
   * The onRemove() method will be called automatically from the API if
   * we ever set the overlay's map property to 'null'.
   */
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

  setVisible(visible: boolean) {
    if (visible) {
      this.show();
    } else {
      this.hide();
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
// AIzaSyAQ9J1_SwUUP6NCLvaTUNRSqbPt15lKBvY

export default CustomOverlay;