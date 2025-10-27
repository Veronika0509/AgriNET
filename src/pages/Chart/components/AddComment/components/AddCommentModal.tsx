import React, {useEffect, useRef, useState} from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonModal, IonSelect, IonSelectOption,

  IonTitle,
  IonToolbar
} from "@ionic/react";
import s from '../../../style.module.css'
import {postComment} from "../data/postComment";

interface AddCommentModalProps {
  addCommentModal: Date
  type: 'main' | 'soilTemp' | 'sum' | 'temp' | 'battery'
  sensorId: string | number
  userId: string | number
  setAddCommentModal: (modal: boolean) => void
  setAddCommentItemShowed: (item: string) => void
}

const AddCommentModal = (props: AddCommentModalProps) => {
  const [timeString, setTimeString] = useState<string>('')
  const [selectValue, setSelectValue] = useState('')
  const [messageValue, setMessageValue] = useState('')
  const modalRef = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    const year = props.addCommentModal.getFullYear()
    let month: string | number = props.addCommentModal.getMonth() + 1
    const days = props.addCommentModal.getDate().toString().length === 1 ? `0${props.addCommentModal.getDate()}` : props.addCommentModal.getDate()
    const hours = props.addCommentModal.getHours().toString().length === 1 ? `0${props.addCommentModal.getHours()}` : props.addCommentModal.getHours()
    const minutes = props.addCommentModal.getMinutes().toString().length === 1 ? `0${props.addCommentModal.getMinutes()}` : props.addCommentModal.getMinutes()

    if (month.toString().length === 1) {
      month = `0${month}`
    }

    setTimeString(`${year}-${month}-${days} ${hours}:${minutes}`)
  }, []);

  const onCancel = () => {
    modalRef.current?.dismiss()
    setTimeout(() => {
      props.setAddCommentModal(false)
    }, 200)
  }

  const onSubmit = () => {
    new Promise(async (resolve: (value?: unknown) => void) => {
      let chartType: string
      if (props.type === 'main') {
        chartType = 'M'
      } else if (props.type === 'soilTemp') {
        chartType = 'MST'
      } else if (props.type === 'sum') {
        chartType = 'MSum'
      } else if (props.type === 'temp') {
        chartType = 'T'
      } else {
        chartType = 'MBattery'
      }
      await postComment(chartType, String(props.sensorId), timeString, selectValue, messageValue, props.userId, resolve)
    }).then( async (response: unknown) => {
      const res = response as { status: number }
      if (res.status === 200) {
        props.setAddCommentItemShowed('comments')
        onCancel()
      }
    })
  }

  return (
    <IonModal isOpen={true} onWillDismiss={onCancel} ref={modalRef}>
      <IonContent>
        <div className={s.mixed_modalWrapper}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>New comment for {timeString}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <textarea onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessageValue(e.target.value)} value={messageValue} className={s.addComment_textarea} placeholder='Enter a comment: '></textarea>
          <div className={s.mixed_modalFooter}>
            <IonFooter className={s.mixed_footer}>
              <IonToolbar className={s.mixed_bottomButtons}>
                <IonSelect className={s.addComment_select} placeholder="Type" slot='start' value={selectValue} onIonChange={(e: CustomEvent) => setSelectValue(e.detail.value)}>
                  <IonSelectOption value="1">Advisory</IonSelectOption>
                  <IonSelectOption value="2">Plant Health</IonSelectOption>
                  <IonSelectOption value="3">Weather</IonSelectOption>
                  <IonSelectOption value="4">Irrigation</IonSelectOption>
                  <IonSelectOption value="5">Growth Stage</IonSelectOption>
                  <IonSelectOption value="6">Chemical App</IonSelectOption>
                  <IonSelectOption value="7">Pest</IonSelectOption>
                  <IonSelectOption value="8">Foliage</IonSelectOption>
                  <IonSelectOption value="9">Soil Type</IonSelectOption>
                  <IonSelectOption value="10">Other</IonSelectOption>
                  <IonSelectOption value="11">Percolation</IonSelectOption>
                  <IonSelectOption value="12">Root Uptake</IonSelectOption>
                  <IonSelectOption value="13">Hands-on</IonSelectOption>
                  <IonSelectOption value="14">Pressure Bomb</IonSelectOption>
                  <IonSelectOption value="15">AutoWATER</IonSelectOption>
                  <IonSelectOption value="16">Installation</IonSelectOption>
                </IonSelect>
                <IonButtons slot='end'>
                  <IonButton onClick={onSubmit}>OK</IonButton>
                  <IonButton onClick={onCancel}>Cancel</IonButton>
                </IonButtons>
              </IonToolbar>
            </IonFooter>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default AddCommentModal;
