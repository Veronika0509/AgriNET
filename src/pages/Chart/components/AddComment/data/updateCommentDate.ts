import axios from "axios";
import { debugLog } from "../../../../../utils/debugConfig";

export const updateCommentDate = async (commentId: string | number, newDate: string, userId: string | number, resolve: () => void) => {
  debugLog.comments(`Updating comment ${commentId} date to ${newDate} for user ${userId}`);
  axios.post(`https://app.agrinet.us/api/chart/comments/update-date?v=43&userId=${userId}`, {
    id: commentId,
    date: newDate
  }).then(() => {
    debugLog.comments(`Comment ${commentId} date updated successfully`);
    resolve();
  }).catch((error: unknown) => {
    debugLog.commentsError('Error updating comment date:', error);
  });
}

//fetch("https://app.agrinet.us/api/chart/comments/update-date", {
//     "body": "{\"id\":2297,\"date\":\"2024-12-03 00:48\"}",
//     "cache": "default",
//     "credentials": "omit",
//     "headers": {
//         "Accept": "application/json, text/plain, */*",
//         "Accept-Language": "en-GB,en;q=0.9",
//         "Content-Type": "application/json",
//         "Priority": "u=3, i",
//         "User": "103",
//         "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
//         "Version": "42.2.1"
//     },
//     "method": "POST",
//     "mode": "cors",
//     "redirect": "follow",
//     "referrer": "https://app.agrinet.us/",
//     "referrerPolicy": "strict-origin-when-cross-origin"
// })

//fetch("https://app.agrinet.us/api/chart/comments?v=43&chartId=MST-ANM00099", {
//     "cache": "default",
//     "credentials": "omit",
//     "headers": {
//         "Accept": "application/json, text/plain, */*",
//         "Accept-Language": "en-GB,en;q=0.9",
//         "Priority": "u=3, i",
//         "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15"
//     },
//     "method": "GET",
//     "mode": "cors",
//     "redirect": "follow",
//     "referrer": "http://localhost:8100/",
//     "referrerPolicy": "strict-origin-when-cross-origin"
// })