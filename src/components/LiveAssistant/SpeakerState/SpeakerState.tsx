import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
// import WebSocket from "ws";
import { socket } from "../../../socket";
import { AudioRecorder, blobToBase64 } from "./AudioRecord";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";
import {
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Chart as ChartJS } from "chart.js/auto";

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  scales: {
    x: {
      type: "time",
    },
  },
};

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

const SpeakerState = ({participants, pState, conf}) => {


  let loc = "";
  Object.keys(pState).forEach((id) => {
    if(pState[id].isLocal) {
      loc = id;
      return;
    }
  });

  const webcamRef = useRef<any>(null);
  const wsRef = useRef<any>(null);
  const backendWSRef = useRef(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const [speakerTone, setSpeakerTone] = useState("");
  const [audienceTone, setAudienceTone] = useState("");
  const [dataMap, setDataMap] = useState({});
  const [localID, setLocalID] = useState(loc);
  const {isSpeaking} = pState[localID] || {};
  const currentInterval: any = useRef([]);
  const speakingIntervals:any = useRef([]);
  const pastSpeakerTones:any = useRef([]);

  useEffect(() => {
    if(speakerTone !== "") {
      pastSpeakerTones.current.push({tone: speakerTone, time: new Date()});
    }
    console.log(pastSpeakerTones.current);
  }, [speakerTone])

  useEffect(() => {

    const currDate = new Date();
    if(isSpeaking) {
      if(currentInterval.current.length == 0) {
        console.log("pushing");
        currentInterval.current.push(new Date());
      } else if(currentInterval.current.length == 2) {
        const currDate = new Date();
        if(currDate.getTime() - currentInterval.current[1].getTime() < 5000) {
          currentInterval.current.pop();
        } else {
          speakingIntervals.current.push(currentInterval.current);
          currentInterval.current = [];
        }
      } 
      console.log("start", currDate);
    } else {
      if(currentInterval.current.length == 1) {
        currentInterval.current.push(new Date());
      } else if(currentInterval.current.length == 2) {
        const currDate = new Date();
        if(currDate.getTime() - currentInterval.current[1].getTime() < 5000) {
          currentInterval.current[1] = currDate;
        } else {
          speakingIntervals.current.push(currentInterval.current);
          currentInterval.current = [];
        }
      }
      console.log("end", currDate);
    }
  }, [isSpeaking])

  // Function to add a new object to the array
  function addObject(emotion_in: any, x_in: any, y_in: any) {
    if (!dataMap[emotion_in]) {
      dataMap[emotion_in] = [];
    }
    dataMap[emotion_in].push({ x: x_in, y: y_in });

    setDataMap({ ...dataMap });
  }

  async function recordAndSend() {
    recorderRef.current = await AudioRecorder.create();
    const blob = await recorderRef.current.record(2000);
    const encodedBlob = await blobToBase64(blob);
    const sendAudioProsodyPayload = (base64Audio: any) => {
      const payload = {
        models: {
          prosody: {},
        },
        data: base64Audio,
      };
      wsRef.current.send(JSON.stringify(payload));
    };
    sendAudioProsodyPayload(encodedBlob);
  }

  const prosodyHandler = (apiInput: string) => {
    const data = JSON.parse(apiInput);
    if (data.error) {
      return;
    }
    if (data["prosody"]["warning"]) {
      return;
    }
    const emotions = data["prosody"]["predictions"][0]["emotions"];
    // console.log(emotions);
    let maxScore = 0;
    let maxEmotion = "";
    for (let i = 0; i < emotions.length; i++) {
      if (emotions[i]["score"] > maxScore) {
        maxEmotion = emotions[i]["name"];
        maxScore = emotions[i]["score"];
      }
    }
    // console.log(maxEmotion, maxScore);
    setSpeakerTone(maxEmotion);
  };

  const capture = useCallback(() => {
    if (webcamRef) {
      const imageSrc = webcamRef.current.getScreenshot();
      sendImageFacePayload(imageSrc);
    }
  }, [webcamRef]);

  useEffect(() => {
    setInterval(recordAndSend, 4000);

    // setInterval(() => {
    //   wsRef.current = new WebSocket("wss://api.hume.ai/v0/stream/models?apikey=q7KqeFZxKy8uM3aDw0tgGnYQmXIrdC8de43cz5XKr0rrFpjq");
    // }, 50000)

    wsRef.current = new WebSocket(
      "wss://api.hume.ai/v0/stream/models?apikey=q7KqeFZxKy8uM3aDw0tgGnYQmXIrdC8de43cz5XKr0rrFpjq"
    );

    const openHandler = () => {
      console.log("WebSocket connection established");
    };

    const closeHandler = () => {
      console.log("WebSocket connection closed");
      setTimeout(() => {
        console.log("reconnecting");
        wsRef.current = null;
        wsRef.current = new WebSocket(
          "wss://api.hume.ai/v0/stream/models?apikey=q7KqeFZxKy8uM3aDw0tgGnYQmXIrdC8de43cz5XKr0rrFpjq"
        );

        wsRef.current.onopen = openHandler;
        wsRef.current.onclose = closeHandler;
        wsRef.current.onerror = errorHandler;
        wsRef.current.onmessage = messageHandler;

        // console.log(wsRef.current);
      }, 2000);
    };

    const errorHandler = (error: any) => {
      console.log(error.ErrorEvent);
    };

    const messageHandler = (event: any) => {
      // console.log(event.data);
      if (event.data.length >= 2 && event.data.charAt(2) === "f") {
        socket.emit("face", event.data);
      } else {
        prosodyHandler(event.data);
      }
    };

    wsRef.current.onopen = openHandler;
    wsRef.current.onclose = closeHandler;
    wsRef.current.onerror = errorHandler;
    wsRef.current.onmessage = messageHandler;

    socket.on("face_emit", (data) => {
      // console.log(data);
      setAudienceTone(data);
      // console.log(speakerTone, audienceTone)
      //Getting Max Value
    });

    socket.on("face_total_emit", (data) => {
      // console.log(data);
      let json = JSON.parse(data);
      let emotions = json["data"]["emotions"];
      // console.log("JSON", json)
      // console.log("EMOTION", emotions)
      const keys = Object.keys(emotions);
      let time = json["time"];

      const inputDate = new Date(time);

      // Format the date
      const year = inputDate.getFullYear();
      const month = (inputDate.getMonth() + 1).toString().padStart(2, "0");
      const day = inputDate.getDate().toString().padStart(2, "0");

      // Format the time
      const hours = inputDate.getHours().toString().padStart(2, "0");
      const minutes = inputDate.getMinutes().toString().padStart(2, "0");
      const seconds = inputDate.getSeconds().toString().padStart(2, "0");

      // Construct the formatted string
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      // console.log("DATE", formattedDate);

      // Loop through the keys
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = emotions[key];
        // console.log(`Key: ${key}, Value: ${value}`);
        let emotion = key;
        let y = value;
        addObject(emotion, formattedDate, y);
      }

      // console.log("DATAMAP", JSON.stringify(dataMap["Sadness"], null, "\t"));
    });

    setInterval(capture, 10000);
    // example
    socket.connect();
  }, []);

  useEffect(() => {}, [dataMap]);

  const sendImageFacePayload = (base64Image: any) => {
    const payload = {
      models: {
        face: {
          facs: {},
          descriptions: {},
        },
      },
      data: base64Image,
    };

    wsRef.current.send(JSON.stringify(payload));
  };

  return (
    <>
      <Webcam
        audio={true}
        height={180}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={320}
        videoConstraints={videoConstraints}
      />
      <Line
        // options={{
        //   scales: {
        //     x: {
        //       type: "time",
        //     },
        //   },
        // }}
        data={{
          datasets: [
            {
              data:
                // [
                //   {
                //     x: "2023-06-18 02:16:33",
                //     y: 0,
                //   },
                //   {
                //     x: "2023-06-18 02:16:33",
                //     y: 0,
                //   },
                //   {
                //     x: "2023-06-18 02:16:33",
                //     y: 0,
                //   },
                //   {
                //     x: "2023-06-18 02:16:33",
                //     y: 0,
                //   },
                //   {
                //     x: "2023-06-18 02:16:46",
                //     y: 0,
                //   },
                //   {
                //     x: "2023-06-18 02:16:46",
                //     y: 0,
                //   },
                //   {
                //     x: "2023-06-18 02:16:46",
                //     y: 0,
                //   },
                //   {
                //     x: "2023-06-18 02:16:46",
                //     y: 0,
                //   },
                //   {
                //     x: "2023-06-18 02:16:55",
                //     y: 0.20710834860801697,
                //   },
                //   {
                //     x: "2023-06-18 02:16:55",
                //     y: 0.20710834860801697,
                //   },
                //   {
                //     x: "2023-06-18 02:16:55",
                //     y: 0.20710834860801697,
                //   },
                //   {
                //     x: "2023-06-18 02:16:55",
                //     y: 0.20710834860801697,
                //   },
                //   {
                //     x: "2023-06-18 02:17:04",
                //     y: 0,
                //   },
                //   {
                //     x: "2023-06-18 02:17:04",
                //     y: 0,
                //   },
                //   {
                //     x: "2023-06-18 02:17:04",
                //     y: 0,
                //   },
                //   {
                //     x: "2023-06-18 02:17:04",
                //     y: 0,
                //   },
                // ],

                dataMap["Sadness"],
            },
          ],
        }}
      />
    </>
  );
};

export default SpeakerState;
