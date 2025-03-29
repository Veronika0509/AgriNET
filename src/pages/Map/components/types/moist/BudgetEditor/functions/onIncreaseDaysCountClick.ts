import {setDays} from "./setDays";
import s from '../../../../../style.module.css'

export const onIncreaseDaysCountClick = (props: any) => {
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
        handler: (event: any) => setDays({
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