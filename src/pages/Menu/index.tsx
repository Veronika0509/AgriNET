import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from "@ionic/react";
import React from "react";

const Menu = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <h1>Hello world</h1>
      </IonContent>
    </IonPage>
  )
}

export default Menu