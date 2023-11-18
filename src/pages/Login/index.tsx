import {
  IonButton, IonCol, IonContent, IonImg, IonInput,IonPage,IonRow,
} from '@ionic/react';
import '../../theme/variables.css';

import React, {useState} from "react";
import s from './style.module.css'
import Logo from '../../assets/images/logo.png'

const Login: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <IonRow class="ion-justify-content-center" className={s.content}>
          <IonCol size="11" sizeMd="8" sizeLg="6" sizeXl="3" className='col'>
            <div>
              <IonImg className={s.img} src={Logo} alt='logo'/>
              <IonInput label="Username" labelPlacement="floating" required={true}
                        errorText='Username is empty'></IonInput>
              <IonInput label="Passwort" labelPlacement="floating" type='password' required={true}
                        errorText='Password is incorrect'></IonInput>
              <IonButton expand='full' type='submit' className={`${s.button} ${'ion-margin-top'}`}>sign in</IonButton>
            </div>
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  )
};

export default Login;
