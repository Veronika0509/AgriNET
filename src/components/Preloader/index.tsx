import {IonPage} from '@ionic/react';
import '../../theme/variables.css';
import {useEffect, useState} from "react";
import s from './style.module.css'
import preloaderLogo from '../../assets/images/logo.png'

const Preloader = () => {
  const [hidden, setHidden] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setHidden(true)
      setTimeout (() => {
        setDone(true)
      }, 800)
    }, 300);
  }, []);

  return (
    <IonPage className={`${s.container} ${hidden && s.hidden} ${done && s.done}`}>
      <div className={s.logoContainer}>
        <img src={preloaderLogo} alt="Logo"/>
      </div>
    </IonPage>
  );
}

export default Preloader;
