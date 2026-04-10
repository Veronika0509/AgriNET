import {onIncreaseDaysCountClick} from "./onIncreaseDaysCountClick";
import type { AlertButton, AlertOptions } from '@ionic/react';
import type { HookOverlayOptions } from '@ionic/react/dist/types/hooks/HookOverlayOptions';

type IonAlertPresenter = {
  (message: string, buttons?: AlertButton[]): Promise<void>;
  (options: AlertOptions & HookOverlayOptions): Promise<void>;
};

interface SetDaysProps {
  value: number;
  setCurrentAmountOfDays: (days: number) => void;
  presentErrorAlert: IonAlertPresenter;
  presentAlert: IonAlertPresenter;
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