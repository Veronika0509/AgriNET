import React from "react"
import Info from "../../../Info"

/**
 * Info Tab - Wrapper for Info component
 */
const InfoTab: React.FC = () => {
  return (
    <div style={{ height: "100%", padding: "16px" }}>
      <section>
        <Info />
      </section>
    </div>
  )
}

export default InfoTab