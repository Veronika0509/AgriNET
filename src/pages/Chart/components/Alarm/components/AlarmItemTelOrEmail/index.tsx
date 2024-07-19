import s from '../../../../style.module.css'
import {IonActionSheet, IonButton, IonItem, IonText, useIonAlert} from "@ionic/react";
import React, {useEffect, useRef, useState} from "react";
import {setTelOrEmail} from "../../functions/setTelOrEmail";
import {removeTelOrEmail} from "../../functions/removeTelOrEmail";

export const AlarmItemTelOrEmail = (props: any) => {
  const [presentAlert] = useIonAlert();
  const [presentErrorAlert] = useIonAlert();
  const [setText, setSetText] = useState('Unset')
  const setTextRef = useRef(setText);
  const [actionSheetButtons, setActionSheetButtons] = useState([
    {
      text: 'Email',
      handler: () => presentTelOrEmail('email')
    },
    {
      text: 'SMS',
      handler: () => presentTelOrEmail('sms')
    }
  ])

  useEffect(() => {
    if (props.data !== null) {
      setSetText(props.data)
    }
  }, []);

  useEffect(() => {
    setTextRef.current = setText;
  }, [setText]);

  const presentTelOrEmail = (typeOfAction: string, inputValue?: string) => {
    presentAlert({
      header: typeOfAction === 'email' ? 'Enter email' : 'Enter Phone Number',
      inputs: [
        {
          placeholder: typeOfAction === 'email' ? undefined : 'Only digits please',
          type: typeOfAction === 'email' ? 'email' : 'tel',
          cssClass: s.alarmActionInput,
          value: inputValue ? inputValue : undefined
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: (event) => onTelOrEmailSubmit(typeOfAction, event)
        },
      ]
    })
  }
  const onRemoveTelOrEmailSubmit = () => {
    setSetText('Unset')
    removeTelOrEmail()
  }

  const validationErrorPresent = (typeOfAction: string, value: any) => {
    presentErrorAlert({
      header: 'Validation Error',
      message: 'Email must contain @',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Retry',
          role: 'confirm',
          handler: () => presentTelOrEmail(typeOfAction, value)
        },
      ]
    })
  }
  const onTelOrEmailSubmit = (typeOfAction: string, event: any) => {
    if (typeOfAction === 'sms') {
      const validate = new RegExp("^\\d+$").test(event[0])
      if (validate) {
        setSetText(event[0])
        setTelOrEmail(typeOfAction, event[0])
      } else {
        validationErrorPresent(typeOfAction, event[0])
      }
    } else {
      const validate = event[0].indexOf("@") > 0
      if (validate) {
        setSetText(event[0])
        setTelOrEmail(typeOfAction, event[0])
      } else {
        validationErrorPresent(typeOfAction, event[0])
      }
    }

  }
  const updateButtons = (buttons: any) => {
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
                handler: onRemoveTelOrEmailSubmit
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
  useEffect(() => {
    if (setText === 'Unset') {
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
      setActionSheetButtons(updateButtons(actionSheetButtons));
    }
  }, [setText]);

  return (
    <IonItem className={s.alarmItemContainer}>
      <div className={s.alarmItem}>
        <IonText>{props.name}</IonText>
        <div className={s.alarmSetContainer}>
          <IonText className={`${s.alarmItemContent} ${setText !== 'Unset' && s.active}`}>{setText}</IonText>
          <IonButton fill={setText === 'Unset' ? 'solid' : 'clear'}
                     id={'set-' + props.name}>{setText === 'Unset' ? 'Set' : 'Change'}</IonButton>
          <IonActionSheet
            trigger={'set-' + props.name}
            header="Action Type"
            buttons={actionSheetButtons}
          ></IonActionSheet>
        </div>
      </div>
    </IonItem>
  )
}