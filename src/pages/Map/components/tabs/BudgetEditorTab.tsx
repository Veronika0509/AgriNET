import React from "react"
import BudgetEditor from "../types/moist/BudgetEditor"
import type { Site, UserId } from "@/types"
import { useAppContext } from "../../../../context/AppContext"

interface BudgetEditorTabProps {
  siteList: Site[]
  userId: UserId
  isGoogleApiLoaded: boolean
}

export const BudgetEditorTab: React.FC<BudgetEditorTabProps> = ({ siteList, userId, isGoogleApiLoaded }) => {
  const { selectedSensorIdForBudgetEditor } = useAppContext()

  return (
    <div style={{ height: "100%" }}>
      <section style={{ height: "100%" }}>
        <BudgetEditor
          siteList={siteList}
          userId={userId}
          isGoogleApiLoaded={isGoogleApiLoaded}
          initialSensorId={selectedSensorIdForBudgetEditor}
        />
      </section>
    </div>
  )
}
