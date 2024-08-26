import {onRemoveTelOrEmailSubmit} from "../onRemoveTelOrEmailSubmit";

export const updateButtons = (
  setTextRef: any,
  presentAlert: any,
  sensorId: string,
  name: any,
  setEmailOrTel: any,
  setIsLowSetpointEnabled: any,
  setIsHighSetpointEnabled: any,
  presentRemoveAlert: any,
  buttons: any
) => {
  const hasRemove = buttons.some((button: any) => button.role === 'remove');
  const hasCancel = buttons.some((button: any) => button.role === 'cancel');

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