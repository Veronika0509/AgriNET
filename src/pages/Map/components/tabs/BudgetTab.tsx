import React from "react"
import type { Site, UserId } from "../../../../types"
import BudgetEditor from "../types/moist/BudgetEditor"
import {findFirstResult, isHigherPrecedenceThanAwait} from "@typescript-eslint/eslint-plugin/dist/util";
import axios from "axios";
import { useAppContext } from "../../../../context/AppContext";

export interface BudgetTabProps {
  siteList: Site[]
  userId: UserId
  isGoogleApiLoaded: boolean
}

/**
 * Budget Editor Tab - Wrapper for BudgetEditor component
 */
const BudgetTab: React.FC<BudgetTabProps> = async ({ siteList, userId, isGoogleApiLoaded }) => {
  const { selectedSensorIdForBudgetEditor } = useAppContext();

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

export default BudgetTab