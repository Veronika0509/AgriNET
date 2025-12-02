import {
  IonButton,
  IonContent,
  IonPage,
  IonText,
  IonIcon,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { mapOutline, logOutOutline } from 'ionicons/icons';
import s from './style.module.css';
import { useAppContext } from '../../context/AppContext';

interface MenuProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const Menu: React.FC<MenuProps> = (props) => {
  const history = useHistory();
  const { logout } = useAppContext();

  const navigateToMap = () => {
    props.setPage(1);
    history.push('/map');
  };

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  return (
    <IonPage>
      <IonContent className={s.content}>
        <div className={s.container}>
          <IonText>
            <h1 className={s.title}>Welcome to AgriNET</h1>
          </IonText>

          <div className={s.menuButtons}>
            <IonButton
              expand="block"
              size="large"
              className={s.menuButton}
              onClick={navigateToMap}
            >
              <IonIcon slot="start" icon={mapOutline} />
              Map
            </IonButton>

            <IonButton
              expand="block"
              size="large"
              color="danger"
              className={s.menuButton}
              onClick={handleLogout}
            >
              <IonIcon slot="start" icon={logOutOutline} />
              Logout
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Menu;
