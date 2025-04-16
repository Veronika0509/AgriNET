import axios from "axios";

export const saveComment = async (body: any) => {
  return await axios.post(`https://app.agrinet.us/api/comments/save?v=43`, body)
}

// fetch("https://app.agrinet.us/api/comments/save", {
//     "body": "{\"id\":2192,\"chartKind\":\"MSum\",\"sensorId\":\"ANM00099\",\"field\":\"Meyer Improved Lemon\",\"date\":\"2024-10-09 04:23\",\"type\":null,\"text\":\"321321\",\"opts\":{\"cssClass\":\"edit-comment\",\"showBackdrop\":true,\"enableBackdropDismiss\":true}}",
//     "cache": "default",
//     "credentials": "omit",
//     "headers": {
//         "Accept": "application/json, text/plain, */*",
//         "Accept-Language": "ru",
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