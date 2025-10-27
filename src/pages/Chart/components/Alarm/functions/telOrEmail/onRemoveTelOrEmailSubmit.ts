import {getAlarmData} from "../../data/getAlarmData";
import {removeTelOrEmail} from "../../data/telOrEmail/removeTelOrEmail";
import {enableSetpoint} from "../../data/setpoints/enableSetpoint";

export const onRemoveTelOrEmailSubmit = async (
  sensorId: string,
  name: number,
  setEmailOrTel: (value: string) => void,
  setIsLowSetpointEnabled: (enabled: boolean) => void,
  setIsHighSetpointEnabled: (enabled: boolean) => void,
  presentRemoveAlert: (options: { header: string; message: string; buttons: Array<{ text: string; role: string; handler?: () => void }> }) => void
) => {
  const alarmData = await getAlarmData(sensorId)

  const indicesToCheck: number[] = [0, 1, 2].filter(index => index !== name - 1);
  const isNoEmailsOrTelMore: boolean = indicesToCheck.every(index => !alarmData.data.emailsAndPhoneNumbers[index]);

  const removeTelOrEmailFunc = () => {
    new Promise<void>((resolve) => {
      removeTelOrEmail(sensorId, name, resolve)
    }).then(() => {
      setEmailOrTel('Unset')
    })
  }

  const disableSetpointFunc = () => {
    new Promise<void>((resolve) => {
      const labelsToDisable: string[] = ['low', 'high'].filter(label => alarmData.data[`${label}Enabled`])
      labelsToDisable.map((labelToDisable: string) => {
        new Promise<boolean>((resolve) => {
          enableSetpoint(sensorId, labelToDisable, false, resolve)
        }).then((response: boolean) => {
          const functionToDisable = labelToDisable === 'low' ? setIsLowSetpointEnabled : setIsHighSetpointEnabled
          functionToDisable(response)
        })
      })
    })
  }

  if ((alarmData.data.lowEnabled || alarmData.data.highEnabled) && isNoEmailsOrTelMore) {
    presentRemoveAlert({
      header: 'Confirmation',
      message: 'All Setpoints will be disabled due to no emails. Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Disable setpoints',
          role: 'confirm',
          handler: () => {
            removeTelOrEmailFunc()
            disableSetpointFunc()
          }
        },
      ]
    })
  } else {
    removeTelOrEmailFunc()
  }
}