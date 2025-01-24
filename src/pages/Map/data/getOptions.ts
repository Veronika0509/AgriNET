import axios from "axios";

export const getOptions = async () => {
  return await axios.get('https://app.agrinet.us/api/options?v=43');
}