import React, {useEffect, useState} from 'react';
import s from "../../../../../style.module.css";
import {IonButton, useIonAlert} from "@ionic/react";
import {updateBudgetLine} from "../../../../../data/types/moist/updateBudgetLine";
import {getNewData} from "../functions/getNewData";
import {updateChart} from "../functions/updateChart";

function BudgetEditorLine(props: any) {
  const [value, setValue] = useState(props.chartData.budgetLines[props.index - 1]?.value)
  const [label, setLabel] = useState(props.index === 1 ? 'Top' : props.index === 6 ? 'Bottom' : props.chartData.budgetLines[props.index - 1].label)
  const [presentAlert] = useIonAlert();
  const [presentErrorAlert] = useIonAlert();

  const onSettingClick = (type: string) => {
    presentAlert({
      header: `New ${type} of line`,
      inputs: [
        {
          cssClass: s.budget_lineInput,
          value: type === 'value' ? value === 0 || value === '0' ? '' : value : label,
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
          handler: (event: any) => {
            onUpdateSubmit(type, event[0])
          }
        },
      ]
    })
  }
  const onUpdateSubmit = (type: any, newValue: any) => {
    if (type === 'value') {
      new Promise((resolve: any, reject) => {
        if (((props.index != 3 && props.index != 4) || newValue) && !/^\d+(\.\d+)?$/.test(String(newValue))) {
          reject(`Invalid number value: ${newValue}`)
          return
        }

        let prev = props.index > 1 && props.chartData.budgetLines[props.index - 2].value;
        let next = props.index < 6 && props.chartData.budgetLines[props.index].value;
        switch (props.index) {
          case 1: {
            if (newValue <= next) {
              reject(`Value should be more than line below: ${next}`);
              return
            }
            break
          }
          case 2: {
            if (newValue >= prev) {
              reject(`Value should be less than line under: ${prev}`);
              return
            }
            break
          }
          case 5: {
            if (newValue <= next) {
              reject(`Value should be more than line below: ${next}`);
              return
            }
            break
          }
          case 6: {
            if (newValue >= prev) {
              reject(`Value should be less than line under: ${prev}`);
              return
            }
            break
          }
        }
        resolve()
      })
        .then(async () => {
          setValue(newValue)
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
      new Promise((resolve: any, reject) => {
        if (newValue.length > 50) {
          reject(`Too long name`);
          return
        }
        resolve()
      })
        .then(async () => {
          setLabel(newValue)
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
    setValue(props.chartData.budgetLines[props.index - 1].value);
    setLabel(props.index === 1 ? 'Top' : props.index === 6 ? 'Bottom' : props.chartData.budgetLines[props.index - 1].label)
  }, [props.chartData, props.currentSensorId]);

  const truncateText = (text: string, maxLength = 17) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  };

  return (
    <div className={s.budget_setting}>
      <IonButton fill='clear' onClick={() => onSettingClick('value')}
                 className={s.budget_settingValue}>{!value || value === '0' ? "No" : value}</IonButton>
      <IonButton fill='clear' onClick={() => onSettingClick('label')}
                 disabled={props.index === 1 || props.index === 6 && true}
                 className={s.budget_settingLabel}>{!label || label.length === 0 ? "Unset" : truncateText(label)}</IonButton>
    </div>
  );
}

export default BudgetEditorLine;