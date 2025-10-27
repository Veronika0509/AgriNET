import axios from "axios";

export const removeComment = async (commentId: string | number, userId: string | number, resolve: () => void) => {
  axios.delete(`https://app.agrinet.us/api/chart/comments/remove/${commentId}?v=43&userId=${userId}`).then(() => {
    resolve()
  })
}