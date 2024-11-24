import axios from "axios";

export const postComment = async (chartType: string, sensorId: string, date: any, selectValue: string, messageValue: string, userId: any, resolve: any) => {
  axios.post('https://app.agrinet.us/api/chart/comments?v=43',
    {
      chartId: `${chartType}-${sensorId}`,
      ...(selectValue.length !== 0 && { colorId: selectValue }),
      date,
      text: messageValue
    },
    {
      headers: {
        'user': userId
      }
    }
  ).then((response: any) => {
    resolve(response);
  }).catch((error: any) => {
    console.error('Error posting comment:', error);
  });
}