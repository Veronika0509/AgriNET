import {
  IonButton,
  IonCol,
  IonContent,
  IonImg,
  IonInput,
  IonPage,
  IonRow,
  IonText,
} from '@ionic/react';
import axios from 'axios';
import s from './style.module.css';
import Logo from '../../assets/images/logo.png';
import {useState} from "react";
import { useHistory } from 'react-router-dom';
import type { UserId } from '../../types';

interface LoginProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setUserId: React.Dispatch<React.SetStateAction<UserId>>;
}

const Login: React.FC<LoginProps> = (props) => {
  const [usernameInputValue, setUsernameInputValue] = useState('');
  const [passwordInputValue, setPasswordInputValue] = useState('');
  const [message, setMessage] = useState(false);
  const history = useHistory();
  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    axios.get('https://app.agrinet.us/api/auth/try?v=43', {
      params: {
        username: usernameInputValue,
        password: passwordInputValue,
      },
    }).then(response => {
      // Store all user data from the response
      if (response.data) {
        // Store individual fields
        if (response.data.role) {
          localStorage.setItem('userRole', response.data.role);
        }

        // Store the complete user data object as JSON
        localStorage.setItem('userData', JSON.stringify(response.data));
      }

      props.setPage(1);
      history.push('/map');
      props.setUserId(response.data.id as UserId);
    }).catch(() => {
      setMessage(true)
    })
  };

  return (
    <IonPage>
      <IonContent className={s.contentWrapper}>
        <IonRow class="ion-justify-content-center" className={s.content}>
          <IonCol size="11" sizeMd="6" sizeLg="6" sizeXl="3" className="col">
            <form onSubmit={onFormSubmit}>
              <IonImg className={s.img} src={Logo} alt="logo"/>
              <IonInput
                label="Username"
                labelPlacement="floating"
                required={true}
                errorText="Username is empty"
                onInput={(e: React.FormEvent<HTMLIonInputElement>) => {
                  const inputValue = (e.target as HTMLIonInputElement).value as string;
                  setUsernameInputValue(inputValue)
                }}
              ></IonInput>
              <IonInput
                label="Password"
                labelPlacement="floating"
                type="password"
                required={true}
                errorText="Password is incorrect"
                onInput={(e: React.FormEvent<HTMLIonInputElement>) => {
                  const inputValue = (e.target as HTMLIonInputElement).value as string;
                  setPasswordInputValue(inputValue)
                }}
              ></IonInput>
              {message && <IonText color="danger">Incorrect login or password</IonText>}
              <IonButton expand="full" type="submit" className={`${s.button} ${'ion-margin-top'}`}>
                sign in
              </IonButton>
            </form>
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default Login;