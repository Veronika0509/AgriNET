import axios from "axios";

export const getCommentsData = async (props: any) => {
  //sort: any, startIndex: any, , userId: any, sensorId?: any
  let data: any = {
    commentTypeId: props.type,
    sort: props.sort,
    startIndex: props.startIndex,
  }
  props.sensorId.length !== 0 && (data = {...data, sensorId: props.sensorId});
  return await axios.post('https://app.agrinet.us/api/comments/find?v=43', data, {
    headers: {
      "User": props.userId.toString(),
    }
  });
}

//fetch("https://app.agrinet.us/api/comments/find", {
//     "body": "{\"commentTypeId\":0,\"sort\":\"dateDesc\",\"startIndex\":79}",
//     "cache": "default",
//     "credentials": "omit",
//     "headers": {
//         "Accept": "application/json, text/plain, */*",
//         "Accept-Language": "ru",
//         "Content-Type": "application/json",
//         "Priority": "u=3, i",
//         "User": "103",
//         "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1.1 Safari/605.1.15",
//         "Version": "42.2.1"
//     },
//     "method": "POST",
//     "mode": "cors",
//     "redirect": "follow",
//     "referrer": "http://app.agrinet.us/",
//     "referrerPolicy": "strict-origin-when-cross-origin"
// })