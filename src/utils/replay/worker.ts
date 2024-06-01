import { formatMsg } from "@/utils";

import { Timer } from "./timer";

let startTime = 0,
  endTime = 0;

const timer = new Timer();

const addAction = (text: string) => {
  const list = text.split("\n");
  list.forEach((row) => {
    const [timeStr, base64] = row.split(":");
    let jsonData = "";
    try {
      jsonData = atob(base64);
    } catch (error) {
      return;
    }
    const delay = (+timeStr - startTime) / 1e3;
    timer.addAction({
      delay,
      doAction() {
        try {
          let data;
          if (jsonData[0] === "{") {
            data = jsonData;
          } else {
            const uint8buffer = new Uint8Array(jsonData.length);
            for (let i = 0; i < jsonData.length; i++) {
              uint8buffer[i] = jsonData.charCodeAt(i);
            }
            data = uint8buffer.buffer;
          }
          data = formatMsg(data);
          if (data) {
            postMessage({
              type: "data",
              data,
              delay
            });
          }
        } catch (error) {
          // console.log(error);
        }
      }
    });
  });
};

addEventListener("message", (e) => {
  const { type, data } = e.data;
  switch (type) {
    case "data":
      addAction(data);
      break;
    case "time":
      startTime = data.startTime;
      endTime = data.endTime;
      break;
    case "status":
      if (data.status === "pause") {
        timer.clear();
      } else {
        timer.start(data.time);
      }
  }
});
