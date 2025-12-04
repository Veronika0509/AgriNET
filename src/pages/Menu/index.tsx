import {
  IonButton,
  IonContent,
  IonPage,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { logOutOutline } from 'ionicons/icons';
import s from './style.module.css';
import { useAppContext } from '../../context/AppContext';

interface MenuProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  userId: any;
}

const Menu: React.FC<MenuProps> = (props) => {
  const history = useHistory();
  const { logout } = useAppContext();

  // Get username from localStorage
  const userData = localStorage.getItem('userData');
  const username = userData ? JSON.parse(userData).name : 'User';

  const navigateToMap = () => {
    props.setPage(1);
    history.push('/map');
  };

  const navigateToComments = () => {
    props.setPage(5);
    history.push('/comments');
  };

  const navigateToAddUnit = () => {
    props.setPage(6);
    history.push('/addunit');
  };

  const navigateToInfo = () => {
    props.setPage(0);
    history.push('/info');
  };

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle slot="start">{username}</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={handleLogout}>
              Logout
              <IonIcon slot="end" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className={s.content}>
        <div className={s.container}>
          <div className={s.menuGrid}>
            <div className={s.menuRow}>
              <IonButton
                className={s.menuBlock}
                onClick={navigateToMap}
              >
                Map
              </IonButton>
              <IonButton
                className={s.menuBlock}
                onClick={navigateToComments}
              >
                Comments
              </IonButton>
            </div>
            <div className={s.menuRow}>
              <IonButton
                className={s.menuBlock}
                onClick={navigateToAddUnit}
              >
                Add Unit
              </IonButton>
              <IonButton
                className={s.menuBlock}
              >
                Block 4
              </IonButton>
            </div>
            <IonButton
              className={`${s.menuBlockWide} ${s.menuBlock}`}
              onClick={navigateToInfo}
            >
              AgriNET Contact
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Menu;
