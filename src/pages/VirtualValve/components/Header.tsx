import React from 'react';
import { IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar } from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { back } from "../../Chart/functions/back";
import s from "../style.module.css";

interface HeaderProps {
  setPage: (page: number) => void;
}

const Header: React.FC<HeaderProps> = ({ setPage }) => {
  const history = useHistory();

  const onBackClick = () => {
    back(setPage, history);
  };

  return (
    <IonHeader data-chart-section="mainHeader">
      <IonToolbar className={s.header_mainToolbar}>
        <div className={s.header_contentWrapper}>
          <div className={s.header_titleSection}>
            <IonButtons slot="start">
              <IonIcon
                onClick={onBackClick}
                className={s.header_backIcon}
                size='large'
                icon={arrowBackOutline}
              />
            </IonButtons>
            <IonTitle className={s.header_title}>
              Create Virtual Valve
            </IonTitle>
          </div>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
