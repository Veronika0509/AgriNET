import {setDays} from "./setDays";
import s from '../../Map/style.module.css'
import type { AlertButton, AlertOptions } from '@ionic/react';
import type { HookOverlayOptions } from '@ionic/react/dist/types/hooks/HookOverlayOptions';

interface OnIncreaseDaysCountClickProps {
  presentAlert: {
    (message: string, buttons?: AlertButton[] | undefined): Promise<void>;
    (options: AlertOptions & HookOverlayOptions): Promise<void>;
  };
  currentAmountOfDays: number;
  setCurrentAmountOfDays: (days: number) => void;
  presentErrorAlert: {
    (message: string, buttons?: AlertButton[] | undefined): Promise<void>;
    (options: AlertOptions & HookOverlayOptions): Promise<void>;
  };
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