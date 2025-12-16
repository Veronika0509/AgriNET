import axios from "axios";

export const getCommentsData = async (props: any) => {
  //sort: any, startIndex: any, , userId: any, sensorId?: any
  const currentYear = new Date().getFullYear();

  let data: any = {
    commentTypeId: props.type,
    sort: props.sort,
    startIndex: props.startIndex,
    year: currentYear, // Only load comments for current year
  }
  props.sensorId.length !== 0 && (data = {...data, sensorId: props.sensorId});
  return await axios.post('https://app.agrinet.us/api/comments/find?v=43', data, {
    headers: {
      "User": props.userId.toString(),
    }
  });
}