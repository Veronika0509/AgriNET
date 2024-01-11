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

interface LoginProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setUserId: React.Dispatch<React.SetStateAction<number>>;
}

const Login: React.FC<LoginProps> = (props) => {
  const [usernameInputValue, setUsernameInputValue] = useState('');
  const [passwordInputValue, setPasswordInputValue] = useState('');
  const [message, setMessage] = useState(false);
  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    axios.get('https://app.agrinet.us/api/auth/try', {
      params: {
        username: usernameInputValue,
        password: passwordInputValue,
      },
    }).then(response => {
      props.setPage(1);
      props.setUserId(response.data.id);
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
                onInput={(e: any) => {
                  const inputValue = e.target.value;
                  setUsernameInputValue(inputValue)
                }}
              ></IonInput>
              <IonInput
                label="Password"
                labelPlacement="floating"
                type="password"
                required={true}
                errorText="Password is incorrect"
                onInput={(e: any) => {
                  const inputValue = e.target.value;
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