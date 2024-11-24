import axios from "axios";

export const getSiteList = async (userId: any, setSiteList: any) => {
  try {
    const response = await axios.get('https://app.agrinet.us/api/map/sites', {
      params: {
        userId: userId,
      },
    })
    setSiteList(response.data)
  } catch (error) {
    console.log('Error: ' + error)
  }
};