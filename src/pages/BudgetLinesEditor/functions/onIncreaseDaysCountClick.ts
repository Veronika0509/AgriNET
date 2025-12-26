import {setDays} from "./setDays";
import s from '../../Map/style.module.css'

interface OnIncreaseDaysCountClickProps {
  presentAlert: (options: unknown) => void;
  currentAmountOfDays: number;
  setCurrentAmountOfDays: (days: number) => void;
  presentErrorAlert: (options: unknown) => void;
}

export const onIncreaseDaysCountClick = (props: OnIncreaseDaysCountClickProps) => {
  props.presentAlert({
    header: 'Increase Days Count',
    inputs: [
      {
        type: 'number',
        value: props.currentAmountOfDays,
        cssClass: s.budget_lineInput,
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
        handler: (event: string[]) => setDays({
          value: Number(event[0]),
          setCurrentAmountOfDays: props.setCurrentAmountOfDays,
          presentErrorAlert: props.presentErrorAlert,
          presentAlert: props.presentAlert,
          currentAmountOfDays: props.currentAmountOfDays
        })
      },
    ]
  })
}