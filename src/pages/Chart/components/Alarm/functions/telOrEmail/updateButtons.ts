import {onRemoveTelOrEmailSubmit} from "./onRemoveTelOrEmailSubmit";

interface ActionSheetButton {
  text: string;
  role?: string;
  data?: { action: string };
  handler?: () => void;
}

export const updateButtons = (
  setTextRef: { current: string },
  presentAlert: (options: unknown) => void,
  sensorId: string,
  name: number,
  setEmailOrTel: (value: string) => void,
  setIsLowSetpointEnabled: (enabled: boolean) => void,
  setIsHighSetpointEnabled: (enabled: boolean) => void,
  presentRemoveAlert: (options: unknown) => void,
  buttons: ActionSheetButton[]
) => {
  const hasRemove = buttons.some((button: ActionSheetButton) => button.role === 'remove');
  const hasCancel = buttons.some((button: ActionSheetButton) => button.role === 'cancel');

  if (hasRemove && hasCancel) {
    return buttons;
  }

  const newButtons = [...buttons];
  if (!hasRemove) {
    newButtons.push({
      text: 'Remove',
      role: 'remove',
      data: {
        action: 'remove',
      },
      handler: () => {
        const currentTextInsideHandler = setTextRef.current;
        presentAlert({
          header: 'Email or Phone Number Removing',
          message: "Are you sure want to remove email or phone number " + currentTextInsideHandler + '?',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Remove',
              role: 'confirm',
              handler: () => onRemoveTelOrEmailSubmit(
                sensorId,
                name,
                setEmailOrTel,
                setIsLowSetpointEnabled,
                setIsHighSetpointEnabled,
                presentRemoveAlert
              )
            },
          ]
        })
      },
    });
  }

  if (!hasCancel) {
    newButtons.push({
      text: 'Cancel',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    });
  }

  return newButtons;
};