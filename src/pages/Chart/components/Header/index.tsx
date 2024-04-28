import React from 'react'
import {IonHeader, IonIcon, IonTitle, IonToolbar} from "@ionic/react";
import {back} from "../../functions/back";
import s from "../../style.module.css";
import {arrowBackOutline} from "ionicons/icons";
import {useHistory} from "react-router-dom";

const Header = (props: any) => {
  const history = useHistory();

  return (
    <IonHeader>
      <IonToolbar>
        <IonIcon
          onClick={() => back(props.setPage, history)}
          className={`${s.backIcon} ${'ion-margin-start'}`}
          slot='start'
          size='large'
          icon={arrowBackOutline}
        ></IonIcon>
        <IonTitle>{props.siteName} / {props.siteId}</IonTitle>
      </IonToolbar>
    </IonHeader>
  )
}

export default Header