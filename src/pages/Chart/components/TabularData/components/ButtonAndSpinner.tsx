import {IonButton, IonIcon, IonSpinner} from "@ionic/react";
import {onTabularDataClick} from "../../../functions/onTabularDataClick";
import s from "../../types/moist/style.module.css";
import {gridOutline} from "ionicons/icons";
import React from "react";
import type { SensorType } from "../../../../../types";

interface ButtonAndSpinnerProps {
  data: unknown;
  setData: (data: unknown) => void;
  setIsLoading: (loading: boolean) => void;
  sensorId: string;
  chartCode: string;
  isLoading: boolean;
  type?: SensorType;
}

export const ButtonAndSpinner: React.FC<ButtonAndSpinnerProps> = ({data, setData, setIsLoading, sensorId, chartCode, isLoading, type}) => {
  return (
    <div>
      <IonButton
        fill={data ? 'outline' : 'solid'}
        onClick={() => onTabularDataClick(type, data as any, setData, setIsLoading, sensorId, chartCode)}
        className={s.tabularButton}
        disabled={isLoading}
        id={'tabularDataTrigger'}
      >
        <IonIcon slot="start" icon={gridOutline}></IonIcon>
        Tabular Data
      </IonButton>
      <IonSpinner name="circular" color='primary' className={s.tabularDataSpinner}
                  style={{display: isLoading ? 'block' : 'none'}}></IonSpinner>
    </div>
  )
}