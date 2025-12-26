import {updateButtons} from "./updateButtons";

interface ActionSheetButton {
  text: string;
  role?: string;
  data?: { action: string };
}

export const onEmailOrTelChange = (
  emailOrTel: string,
  setActionSheetButtons: (buttons: ActionSheetButton[] | ((prev: ActionSheetButton[]) => ActionSheetButton[])) => void,
  setTextRef: { current: string },
  presentAlert: (alert: unknown) => void,
  sensorId: string,
  name: string | number,
  setEmailOrTel: (value: string) => void,
  setIsLowSetpointEnabled: (enabled: boolean) => void,
  setIsHighSetpointEnabled: (enabled: boolean) => void,
  presentRemoveAlert: (alert: unknown) => void,
  actionSheetButtons: ActionSheetButton[]
) => {
  if (emailOrTel === 'Unset') {
    setActionSheetButtons((buttons: ActionSheetButton[]) => {
      const hasCancel = buttons.some((button: ActionSheetButton) => button.role === 'cancel');
      const hasRemove = buttons.some((button: ActionSheetButton) => button.role === 'remove');
      const updatedButtons = hasRemove
        ? buttons.filter((button: ActionSheetButton) => button.role !== 'remove')
        : buttons;

      if (hasCancel) {
        return updatedButtons;
      }

      return [
        ...updatedButtons,
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ];
    });
  } else {
    setActionSheetButtons(updateButtons(
      setTextRef,
      presentAlert,
      sensorId,
      name,
      setEmailOrTel,
      setIsLowSetpointEnabled,
      setIsHighSetpointEnabled,
      presentRemoveAlert,
      actionSheetButtons
    ));
  }
}