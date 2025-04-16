import axios from "axios";

export const deleteComment = async (id: any) => {
  return await axios.delete(`https://app.agrinet.us/api/comments/${id}?v=43`)
}