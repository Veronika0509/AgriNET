import {onIncreaseDaysCountClick} from "./onIncreaseDaysCountClick";

interface SetDaysProps {
  value: number;
  setCurrentAmountOfDays: (days: number) => void;
  presentErrorAlert: (options: unknown) => void;
  presentAlert: (options: unknown) => void;
  currentAmountOfDays: number;
}

export const setDays = (props: SetDaysProps) => {
  new Promise<void>((resolve, reject) => {
    if (/^\d+?$/.test(String(props.value))) resolve(); else reject("Value should be positive integer")
  })
    .then(() => {
      props.setCurrentAmountOfDays(props.value)
    })
    .catch((err) => {
      props.presentErrorAlert({
        header: 'Validation Error',
        message: err,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Retry',
            role: 'confirm',
            handler: () => onIncreaseDaysCountClick({
              presentAlert: props.presentAlert,
              currentAmountOfDays: props.currentAmountOfDays,
              setCurrentAmountOfDays: props.setCurrentAmountOfDays,
              presentErrorAlert: props.presentErrorAlert
            })
          },
        ]
      })
    });
}