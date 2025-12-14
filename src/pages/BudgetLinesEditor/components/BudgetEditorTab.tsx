import React from "react"
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
  const { budgetEditorReturnPage, setBudgetEditorReturnPage, setPage, navigationHistory, popFromNavigationHistory, clearNavigationHistory } = useAppContext()

  const handleBack = () => {
    const previousPage = popFromNavigationHistory()

    if (previousPage) {
      // Navigate to the previous page from our custom history
      // First navigate with router
      history.push(previousPage.path)

      // Then set page state if different
      if (previousPage.page !== 0) {
        setPage(previousPage.page)
      }

      // If we're going back to chart, clear the return flag
      if (previousPage.path === '/chart') {
        setBudgetEditorReturnPage(null)
      }
    } else {
      // Fallback to old behavior if navigation history is empty
      if (budgetEditorReturnPage === 'chart') {
        setBudgetEditorReturnPage(null)
        setPage(2)
        history.push('/chart')
      } else {
        history.goBack()
      }
    }
  }

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