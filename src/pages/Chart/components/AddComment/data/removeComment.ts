import axios from "axios";
import { debugLog } from "../../../../../utils/debugConfig";

export const removeComment = async (commentId: string | number, userId: string | number, resolve: () => void) => {
  debugLog.comments(`Removing comment ${commentId} for user ${userId}`);
  axios.delete(`https://app.agrinet.us/api/chart/comments/remove/${commentId}?v=43&userId=${userId}`)
    .then(() => {
      debugLog.comments(`Comment ${commentId} removed successfully`);
      resolve();
    })
    .catch((error: unknown) => {
      debugLog.commentsError('Error removing comment:', error);
    });
}