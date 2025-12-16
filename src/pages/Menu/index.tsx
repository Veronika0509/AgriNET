import {
  IonButton,
  IonContent,
  IonPage,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  useIonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { logOutOutline } from 'ionicons/icons';
import { useEffect } from 'react';
import axios from 'axios';
import s from './style.module.css';
import { useAppContext } from '../../context/AppContext';
import { getSiteList } from '../Map/data/getSiteList';

interface MenuProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  userId: any;
}

const Menu: React.FC<MenuProps> = (props) => {
  const history = useHistory();
  const { logout, setSiteList } = useAppContext();
  const [present] = useIonToast();

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

  // Fetch site list when menu page loads
  useEffect(() => {
    const fetchSiteList = async () => {
      if (!props.userId) return;

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
        // Set empty array to prevent crashes
        setSiteList([]);
        return;
      }

      // API call successful
      setSiteList(sites.data);
    };

    fetchSiteList();
  }, [props.userId, setSiteList, present]);

  // Fetch and log user site groups when menu page loads
  useEffect(() => {
    const fetchSiteGroups = async () => {
      if (!props.userId) return;

      try {
        const response = await axios.get('https://app.agrinet.us/api/add-unit/user-site-groups', {
          params: {
            userId: props.userId,
          },
        });
        console.log('User Site Groups:', response.data);
        console.log('Request sent with userId:', props.userId);
      } catch (error) {
        console.error('Error fetching user site groups:', error);
      }
    };

    fetchSiteGroups();
  }, [props.userId]);

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
