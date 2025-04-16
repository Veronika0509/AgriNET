import axios from "axios";

export const getCommentsTypes = async () => {
  return await axios.get('https://app.agrinet.us/api/comments/types?v=43');
}