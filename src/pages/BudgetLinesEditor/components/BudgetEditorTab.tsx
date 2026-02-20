import React, { useCallback } from "react"
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon } from "@ionic/react"
import { arrowBackOutline } from "ionicons/icons"
import { useHistory } from "react-router-dom"
import { useAppContext } from "../../../context/AppContext"
import BudgetEditor from "../index"
import type { Site, UserId } from "@/types"

interface BudgetEditorTabProps {
  siteList: Site[]
  userId: UserId
  isGoogleApiLoaded: boolean
}

export const BudgetEditorTab: React.FC<BudgetEditorTabProps> = ({ siteList, userId, isGoogleApiLoaded }) => {
  const history = useHistory()
  const { budgetEditorReturnPage, setBudgetEditorReturnPage, setPage, popFromNavigationHistory } = useAppContext()

  const handleBack = useCallback(() => {
    const previousPage = popFromNavigationHistory()

    if (previousPage) {
      history.push(previousPage.path)
      if (previousPage.page !== 0) {
        setPage(previousPage.page)
      }
      if (previousPage.path === '/chart') {
        setBudgetEditorReturnPage(null)
      }
    } else {
      if (budgetEditorReturnPage === 'chart') {
        setBudgetEditorReturnPage(null)
        setPage(2)
        history.push('/chart')
      } else {
        history.push('/menu')
      }
    }
  }, [history, popFromNavigationHistory, setPage, setBudgetEditorReturnPage, budgetEditorReturnPage])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon slot="icon-only" icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Budget Lines Editor</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <BudgetEditor siteList={siteList} userId={userId} isGoogleApiLoaded={isGoogleApiLoaded} />
      </IonContent>
    </IonPage>
  )
}