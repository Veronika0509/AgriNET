import axios from "axios";
import {getComments} from "../getComments";

export const removeComment = async (commentId: any, userId: any, resolve: any) => {
  axios.delete(`https://app.agrinet.us/api/chart/comments/remove/${commentId}?v=43&userId=${userId}`).then(() => {
    resolve()
  })
}