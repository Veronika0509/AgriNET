import React, { useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  useIonToast,
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { BudgetEditorTab } from '../Map/components/tabs/BudgetEditorTab';
import { getSiteList } from '../Map/data/getSiteList';
import type { UserId, Site } from '../../types';

interface BudgetEditorPageProps {
  userId: UserId;
  siteList: Site[];
  setSiteList: React.Dispatch<React.SetStateAction<Site[]>>;
  isGoogleApiLoaded: boolean;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const BudgetEditorPage: React.FC<BudgetEditorPageProps> = (props) => {
  const history = useHistory();
  const [present] = useIonToast();

  // Load site list if not already loaded
  useEffect(() => {
    const loadSites = async () => {
      if (props.siteList.length === 0 && props.userId) {
        const sites = await getSiteList(props.userId);

        // Check if API call failed
        if ("success" in sites && sites.success === false) {
          console.error("Failed to load sites:", sites.error);
          present({
            message: sites.error,
            duration: 5000,
            color: "danger",
            position: "top",
            buttons: ["Dismiss"],
          });
          props.setSiteList([]);
          return;
        }

        // API call successful
        props.setSiteList(sites.data);
      }
    };

    loadSites();
  }, [props.userId, props.siteList.length]);

  const handleBack = () => {
    props.setPage(0);
    history.push('/menu');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon slot="icon-only" icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Budget Lines Editor</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ "--background": "white" }}>
        <div style={{ height: "100%", padding: "16px" }}>
          <BudgetEditorTab
            siteList={props.siteList}
            userId={props.userId}
            isGoogleApiLoaded={props.isGoogleApiLoaded}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BudgetEditorPage;
