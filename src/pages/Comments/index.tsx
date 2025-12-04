import React from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { Comments } from '../Map/components/Comments';
import type { UserId } from '../../types';

interface CommentsPageProps {
  userId: UserId;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const CommentsPage: React.FC<CommentsPageProps> = ({ userId, setPage }) => {
  const history = useHistory();

  const handleBack = () => {
    setPage(0);
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
          <IonTitle>Comments</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ "--background": "white" }}>
        <div style={{ height: "100%", padding: "16px" }}>
          <Comments userId={userId} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CommentsPage;