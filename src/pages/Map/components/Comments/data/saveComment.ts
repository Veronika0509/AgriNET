import axios from "axios";

export const saveComment = async (body: any) => {
  return await axios.post(`https://app.agrinet.us/api/comments/save?v=43`, body)
}