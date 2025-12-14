import React from "react"
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/react"
import BudgetEditor from "../index"
import type { Site, UserId } from "@/types"

interface BudgetEditorTabProps {
  siteList: Site[]
  userId: UserId
  isGoogleApiLoaded: boolean
}

export const BudgetEditorTab: React.FC<BudgetEditorTabProps> = ({ siteList, userId, isGoogleApiLoaded }) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Budget Lines Editor</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <BudgetEditor siteList={siteList} userId={userId} isGoogleApiLoaded={isGoogleApiLoaded} />
      </IonContent>
    </IonPage>
  )
}