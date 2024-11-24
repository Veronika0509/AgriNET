import {updateButtons} from "./updateButtons";

export const onEmailOrTelChange = (
  emailOrTel: any,
  setActionSheetButtons: any,
  setTextRef: any,
  presentAlert: any,
  sensorId: string,
  name: any,
  setEmailOrTel: any,
  setIsLowSetpointEnabled: any,
  setIsHighSetpointEnabled: any,
  presentRemoveAlert: any,
  actionSheetButtons: any
) => {
  if (emailOrTel === 'Unset') {
    setActionSheetButtons((buttons: any) => {
      const hasCancel = buttons.some((button: any) => button.role === 'cancel');
      const hasRemove = buttons.some((button: any) => button.role === 'remove');
      const updatedButtons = hasRemove
        ? buttons.filter((button: any) => button.role !== 'remove')
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