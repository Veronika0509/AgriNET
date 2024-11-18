import axios from "axios";

export const updateCommentDate = async (commentId: any, newDate: any, userId: any, resolve: any) => {
  axios.post(`https://app.agrinet.us/api/chart/comments/update-date?v=43&userId=${userId}`, {
    id: commentId,
    date: newDate
  }).then(() => {
    resolve()
  })
}