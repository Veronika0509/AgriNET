import s from '../style.module.css'
import {IonCheckbox, IonItem} from "@ionic/react";
import {useEffect, useState} from "react";
import { OverlayItem } from '../types/OverlayItem';

// interface Site {
//   name: string;
//   layers: Layer[];
//   [key: string]: unknown;
// }

// interface Layer {
//   name: string;
//   markers: Marker[];
//   [key: string]: unknown;
// }

// interface Marker {
//   chartData: {
//     sensorId: string;
//     [key: string]: unknown;
//   };
//   [key: string]: unknown;
// }

// interface LayerListProps {
//   siteList: Site[];
//   secondMap: string;
//   allOverlays: OverlayItem[];
//   activeOverlays: OverlayItem[];
//   setActiveOverlays: (overlays: OverlayItem[] | ((prev: OverlayItem[]) => OverlayItem[])) => void;
//   [key: string]: unknown;
// }

const LayerList = (props: any) => {
  const [checkedLayers, setCheckedLayers] = useState<{[key: string]: boolean}>({});

  // Add safety checks to prevent errors
  if (!props.siteList || !Array.isArray(props.siteList) || !props.secondMap) {
    return <div style={{ display: 'none' }} />;
  }

  // Extract layer names from site data
  const layers: string[] = [];
  if (props.siteList && Array.isArray(props.siteList)) {
    props.siteList.forEach((site: any) => {
      if (site && site.name === props.secondMap && site.layers && Array.isArray(site.layers)) {
        site.layers.forEach((layer: any) => {
          if (layer && layer.name && !layers.includes(layer.name)) {
            layers.push(layer.name);
          }
        });
      }
    });
  }

  useEffect(() => {
    // Initialize all layers as checked
    const initialCheckedState: {[key: string]: boolean} = {};
    layers.forEach(layerName => {
      initialCheckedState[layerName] = true;
    });
    setCheckedLayers(initialCheckedState);
  }, [props.secondMap, props.siteList]);

  const toggleLayer = (layerName: string) => {
    const newCheckedState = !checkedLayers[layerName];
    setCheckedLayers(prev => ({
      ...prev,
      [layerName]: newCheckedState
    }));

    if (props.allOverlays && Array.isArray(props.allOverlays)) {
      props.allOverlays.forEach((overlay: OverlayItem) => {
        const chartDataLayerName = overlay?.chartData?.layerName;
        if (overlay && chartDataLayerName === layerName) {
          if (newCheckedState) {
            if (overlay.show && typeof overlay.show === 'function') {
              overlay.show();
            }
            if (props.activeOverlays && !props.activeOverlays.includes(overlay)) {
              props.setActiveOverlays((prevActiveOverlays: OverlayItem[]) => {
                const exists = prevActiveOverlays.some(
                    (existingOverlay: OverlayItem) => existingOverlay && existingOverlay.chartData && overlay.chartData && existingOverlay.chartData.sensorId === overlay.chartData.sensorId
                );
                return exists ? prevActiveOverlays : [...prevActiveOverlays, overlay];
              });
            }
          } else {
            if (overlay.hide && typeof overlay.hide === 'function') {
              overlay.hide();
            }
            props.setActiveOverlays((prevActiveOverlays: OverlayItem[]) =>
                prevActiveOverlays.filter((active: OverlayItem) => active && active.chartData && overlay.chartData && active.chartData.sensorId !== overlay.chartData.sensorId)
            );
          }
        }
      })
    }
  }

  return (
    <div className={s.modernLayerList}>
      {layers.map((layer: string) => {
        const displayName = layer === 'SoilTemp' ? 'Temp/RH' : layer;
        const isChecked = checkedLayers[layer];
        
        return (
          <div 
            key={layer} 
            className={s.layerItem}
            onClick={() => toggleLayer(layer)}
          >
            <span className={s.layerName}>{displayName}</span>
            <div className={`${s.checkbox} ${isChecked ? s.checked : ''}`}>
              {isChecked && (
                <svg className={s.checkmark} viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M9 12l2 2 4-4" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
        );
      })}
    </div>
  )
}

export default LayerList
