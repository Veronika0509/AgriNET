import { Header } from '../../../components/Header';
export default Header;
  const history = useHistory();
  const back = () => {
    history.push('/AgriNET/');
    props.setPage(0);
    window.location.reload()
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
