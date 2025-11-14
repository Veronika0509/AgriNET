import React from "react"
import type { Site, UserId } from "../../../../types"
import BudgetEditor from "../types/moist/BudgetEditor"

export interface BudgetTabProps {
  siteList: Site[]
  userId: UserId
  isGoogleApiLoaded: boolean
}

/**
 * Budget Editor Tab - Wrapper for BudgetEditor component
 */
const BudgetTab: React.FC<BudgetTabProps> = ({ siteList, userId, isGoogleApiLoaded }) => {
  return (
    <div style={{ height: "100%" }}>
      <section style={{ height: "100%" }}>
        <BudgetEditor siteList={siteList} userId={userId} isGoogleApiLoaded={isGoogleApiLoaded} />
      </section>
    </div>
  )
}

export default BudgetTab