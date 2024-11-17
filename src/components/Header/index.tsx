import React from 'react'
import {IonHeader, IonIcon, IonTitle, IonToolbar} from "@ionic/react";
import {arrowBackOutline} from "ionicons/icons";
import {useHistory} from "react-router-dom";
import s from "./style.module.css";

interface HeaderProps {
  type?: 'chartPage' | 'mapPage';
  setPage?: React.Dispatch<React.SetStateAction<number>>;
  siteName?: string;
  siteId?: string;
  setAlarm?: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ type, setPage, siteName, siteId, setAlarm }) => {
  const history = useHistory();

  const onBackClick = () => {
    if (type === 'chartPage') {
      history.push('/AgriNET/');
      setPage?.(0);
    } else if (type === 'mapPage') {
      history.push('/AgriNET/');
      setPage?.(0);
      window.location.reload();
    } else {
      setAlarm?.(false);
    }
  }

  return (
    <IonHeader>
      <IonToolbar>
        <IonIcon
          onClick={onBackClick}
          className={`${s.backIcon} ${'ion-margin-start'}`}
          slot='start'
          size='large'
          icon={arrowBackOutline}
        ></IonIcon>
        <IonTitle>
          {type === 'chartPage' && (
            <>{siteName} / {siteId}</>
          )}
          {type === 'mapPage' && (
            <>List</>
          )}
          {!type && (
            <>Alarm Configuration</>
          )}
        </IonTitle>
      </IonToolbar>
    </IonHeader>
  )
}

export default Header
