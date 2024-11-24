import React from 'react'
import {IonHeader, IonIcon, IonTitle, IonToolbar} from "@ionic/react";
import {back} from "../../functions/back";
import s from "../../style.module.css";
import {arrowBackOutline} from "ionicons/icons";
import {useHistory} from "react-router-dom";

const Header = (props: any) => {
  const history = useHistory();

  const onBackClick = () => {
    if (props.type === 'chartPage') {
      back(props.setPage, history)
    } else {
      props.setAlarm(false)
    }
  }

  return (
    <IonHeader>
      <IonToolbar>
        <IonIcon
          onClick={onBackClick}
          className={`${s.header_backIcon} ${'ion-margin-start'}`}
          slot='start'
          size='large'
          icon={arrowBackOutline}
        ></IonIcon>
        <IonTitle>{props.type === 'chartPage' ? (
          <>{props.siteName} / {props.siteId}</>
        ) : (
          <>Alarm Configuration</>
        )}</IonTitle>
      </IonToolbar>
    </IonHeader>
  )
}

export default Header