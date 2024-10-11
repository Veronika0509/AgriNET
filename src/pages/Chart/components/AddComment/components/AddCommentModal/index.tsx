import React, {useEffect, useRef, useState} from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonModal, IonSelect, IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import s from '../../style.module.css'
import login from "../../../../../Login";
import {postComment} from "../../data/postComment";
import {getComments} from "../../data/getComments";

const AddCommentModal = (props: any) => {
  const [timeString, setTimeString] = useState<any>()
  const [selectValue, setSelectValue] = useState('')
  const [messageValue, setMessageValue] = useState('')
  const modalRef = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    const year = props.moistAddCommentModal.getFullYear()
    let month = props.moistAddCommentModal.getMonth() + 1
    const days = props.moistAddCommentModal.getDate().toString().length === 1 ? `0${props.moistAddCommentModal.getDate()}` : props.moistAddCommentModal.getDate()
    const hours = props.moistAddCommentModal.getHours().toString().length === 1 ? `0${props.moistAddCommentModal.getHours()}` : props.moistAddCommentModal.getHours()
    const minutes = props.moistAddCommentModal.getMinutes().toString().length === 1 ? `0${props.moistAddCommentModal.getMinutes()}` : props.moistAddCommentModal.getMinutes()

    if (month.toString().length === 1) {
      month = `0${month}`
    }

    setTimeString(`${year}-${month}-${days} ${hours}:${minutes}`)
  }, []);

  const onCancel = () => {
    modalRef.current?.dismiss()
    setTimeout(() => {
      props.setMoistAddCommentModal(false)
    }, 200)
  }

  const onSubmit = () => {
    new Promise(async (resolve: any) => {
      const response = await postComment('M', props.sensorId, timeString, selectValue, messageValue, props.userId, resolve)
    }).then( async (response: any) => {
      if (response.status === 200) {
        const comments = await getComments('M', props.sensorId)
        if (comments.status === 200) {
          props.setMoistMainComments(comments.data)
        }
        onCancel()
      }
    })
  }

  return (
    <IonModal isOpen={true} onWillDismiss={onCancel} ref={modalRef}>
      <IonContent>
        <div className={s.modalWrapper}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>New comment for {timeString}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <textarea onChange={(e: any) => setMessageValue(e.target.value)} value={messageValue} className={s.textarea} placeholder='Enter a comment: '></textarea>
          <div className={s.modalFooter}>
            <IonFooter className={s.footer}>
              <IonToolbar className={s.bottomButtons}>
                <IonSelect className={s.select} placeholder="Type" slot='start' value={selectValue} onIonChange={(e: any) => setSelectValue(e.detail.value)}>
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
