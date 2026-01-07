import {useEffect, useState, Dispatch, SetStateAction} from 'react';
import s from "../../Map/style.module.css";
import {IonButton, useIonAlert} from "@ionic/react";
import {getNewData} from "../functions/getNewData";
import {updateChart} from "../functions/updateChart";
import {updateBudgetLine} from "../functions/updateBudgetLine";
import type { ChartDataState, MoistOverlay } from '../types';

interface BudgetEditorLineProps {
  chartData: ChartDataState;
  index: number;
  currentSensorId: string | undefined;
  userId: number;
  currentAmountOfDays: number;
  setChartData: (data: unknown) => void;
  setDataExists: (exists: boolean) => void;
  moistOverlays: MoistOverlay[];
  setMoistOverlays: Dispatch<SetStateAction<MoistOverlay[]>>;
  moistOverlaysRef: React.MutableRefObject<MoistOverlay[]>;
}

function BudgetEditorLine(props: BudgetEditorLineProps) {
  const [value, setValue] = useState(props.chartData.budgetLines?.[props.index - 1]?.value)
  const [label, setLabel] = useState(props.index === 1 ? 'Top' : props.index === 6 ? 'Bottom' : props.chartData.budgetLines?.[props.index - 1]?.label ?? '')
  const [presentAlert] = useIonAlert();
  const [presentErrorAlert] = useIonAlert();

  // Helper function to safely convert string | number to number
  const toNumber = (value: string | number): number => {
    return typeof value === 'number' ? value : Number(value);
  };

  const onSettingClick = (type: string) => {
    presentAlert({
      header: `New ${type} of line`,
      inputs: [
        {
          cssClass: s.budget_lineInput,
          value: type === 'value' ? (value === 0 || String(value) === '0' ? '' : String(value)) : label,
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Update',
          role: 'confirm',
          handler: (event: string[]) => {
            onUpdateSubmit(type, event[0])
          }
        },
      ]
    })
  }
  const onUpdateSubmit = (type: string, newValue: string | number) => {
    if (type === 'value') {
      new Promise((resolve: (value?: unknown) => void, reject: (reason?: string) => void) => {
        if (((props.index != 3 && props.index != 4) || newValue) && !/^\d+(\.\d+)?$/.test(String(newValue))) {
          reject(`Invalid number value: ${newValue}`)
          return
        }

        const prev = props.index > 1 && props.chartData.budgetLines?.[props.index - 2]?.value;
        const next = props.index < 6 && props.chartData.budgetLines?.[props.index]?.value;
        const newValueNum = toNumber(newValue);

        switch (props.index) {
          case 1: {
            if (typeof next === 'number' && newValueNum <= next) {
              reject(`Value should be more than line below: ${next}`);
              return
            }
            break
          }
          case 2: {
            if (typeof prev === 'number' && newValueNum >= prev) {
              reject(`Value should be less than line under: ${prev}`);
              return
            }
            break
          }
          case 5: {
            if (typeof next === 'number' && newValueNum <= next) {
              reject(`Value should be more than line below: ${next}`);
              return
            }
            break
          }
          case 6: {
            if (typeof prev === 'number' && newValueNum >= prev) {
              reject(`Value should be less than line under: ${prev}`);
              return
            }
            break
          }
        }
        resolve()
      })
        .then(async () => {
          if (!props.currentSensorId) return;
          setValue(Number(newValue))
          const data = {value: newValue, label}
          await updateBudgetLine(props.currentSensorId, props.index, data, props.userId)
          getNewData(
            props.currentAmountOfDays,
            props.currentSensorId,
            props.setChartData,
            props.setDataExists
          )
          updateChart(props.currentSensorId, props.userId, props.moistOverlays, props.setMoistOverlays, props.moistOverlaysRef)
        })
        .catch(error => {
          presentErrorAlert({
            header: `Validation Error`,
            message: error,
            buttons: ['Close'],
          })
        });
    } else {
      new Promise((resolve: (value?: unknown) => void, reject: (reason?: string) => void) => {
        if (String(newValue).length > 50) {
          reject(`Too long name`);
          return
        }
        resolve()
      })
        .then(async () => {
          if (!props.currentSensorId) return;
          setLabel(String(newValue))
          const data = {value, label: newValue}
          await updateBudgetLine(props.currentSensorId, props.index, data, props.userId)
          getNewData(
            props.currentAmountOfDays,
            props.currentSensorId,
            props.setChartData,
            props.setDataExists
          )
        })
        .catch(error => {
          presentErrorAlert({
            header: `Validation Error`,
            message: error,
            buttons: ['Close'],
          })
        });
    }
  }

  useEffect(() => {
    setValue(props.chartData.budgetLines?.[props.index - 1]?.value);
    setLabel(props.index === 1 ? 'Top' : props.index === 6 ? 'Bottom' : props.chartData.budgetLines?.[props.index - 1]?.label ?? '')
  }, [props.chartData, props.currentSensorId]);

  const truncateText = (text: string, maxLength = 17) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  };

  return (
    <div className={s.budget_setting}>
      <IonButton fill='clear' onClick={() => onSettingClick('value')}
                 className={s.budget_settingValue}>{!value || String(value) === '0' ? "No" : value}</IonButton>
      <IonButton fill='clear' onClick={() => onSettingClick('label')}
                 disabled={props.index === 1 || props.index === 6 && true}
                 className={s.budget_settingLabel}>{!label || label.length === 0 ? "Unset" : truncateText(label)}</IonButton>
    </div>
  );
}

export default BudgetEditorLine;