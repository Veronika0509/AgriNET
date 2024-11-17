import { Header } from '../../../../components/Header';
export default Header;
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
          className={`${s.backIcon} ${'ion-margin-start'}`}
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
