import React from "react"
import type { UserId } from "../../../../types"
import Comments from "../Comments"

export interface CommentsTabProps {
  userId: UserId
}

/**
 * Comments Tab - Wrapper for Comments component
 */
const CommentsTab: React.FC<CommentsTabProps> = ({ userId }) => {
  return (
    <div style={{ height: "100%", padding: "16px" }}>
      <section>
        <Comments userId={userId} />
      </section>
    </div>
  )
}

export default CommentsTab