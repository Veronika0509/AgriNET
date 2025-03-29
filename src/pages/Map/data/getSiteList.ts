import axios from "axios";

export const getSiteList = async (userId: any) => {
  return await axios.get('https://app.agrinet.us/api/map/sites', {
    params: {
      userId: userId,
    },
  })
};