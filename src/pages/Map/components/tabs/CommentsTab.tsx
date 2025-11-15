import React from "react"
import {Comments} from "../Comments/index";
import type { UserId } from "@/types"

interface CommentsTabProps {
  userId: UserId
}

export const CommentsTab: React.FC<CommentsTabProps> = ({ userId }) => {
  return (
    <div style={{ height: "100%", padding: "16px" }}>
      <section>
        <Comments userId={userId} />
      </section>
    </div>
  )
}
