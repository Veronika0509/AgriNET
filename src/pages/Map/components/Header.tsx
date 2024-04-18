import React from 'react'
import s from "../style.module.css";
import {IonHeader, IonIcon, IonTitle, IonToolbar} from "@ionic/react";
import {arrowBackOutline} from "ionicons/icons";

const Header = (props: any) => {
  const back = () => {
    props.setPage(0);
  };

  return (
    <IonHeader className={s.header}>
      <IonToolbar>
        <IonIcon
          onClick={back}
          className={`${s.backIcon} ${'ion-margin-start'}`}
          slot='start'
          size='large'
          icon={arrowBackOutline}
        ></IonIcon>
        <IonTitle>List</IonTitle>
      </IonToolbar>
    </IonHeader>
  )
}

export default Header