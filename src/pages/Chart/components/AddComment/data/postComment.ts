import axios from "axios";
import { debugLog } from "../../../../../utils/debugConfig";

export const postComment = async (chartType: string, sensorId: string, date: string, selectValue: string, messageValue: string, userId: string | number, resolve: (value?: unknown) => void) => {
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
  ).then((response: unknown) => {
    resolve(response);
  }).catch((error: unknown) => {
    debugLog.commentsError('Error posting comment:', error);
  });
}