import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
// import WebSocket from "ws";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  Text,
} from "@chakra-ui/react";
import {
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-moment";
import { Line } from "react-chartjs-2";
import { socket } from "../../../socket";
import { AudioRecorder, blobToBase64 } from "./AudioRecord";

import Emoji from "@src/components/Emoji/Emoji";
import { Chart as ChartJS } from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
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

const SpeakerState = ({ participants, pState, conf }) => {
  let loc = "";
  Object.keys(pState).forEach((id) => {
    if (pState[id].isLocal) {
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
  let [dataEmotionMap, setDataEmotionMap] = useState({});
  const [dataMap, setDataMap] = useState({});
  const [localID, setLocalID] = useState(loc);
  const { isSpeaking } = pState[localID] || {};
  const currentInterval: any = useRef([]);
  const speakingIntervals: any = useRef([]);
  const pastSpeakerTones: any = useRef([]);

  console.log("speakerTone", speakerTone);
  console.log("audienceTone", audienceTone["emotions"]);

  useEffect(() => {
    if (speakerTone !== "") {
      pastSpeakerTones.current.push({ tone: speakerTone, time: new Date() });
    }
    // console.log(pastSpeakerTones.current);
  }, [speakerTone]);

  useEffect(() => {
    const currDate = new Date();
    if (isSpeaking) {
      if (currentInterval.current.length == 0) {
        // console.log("pushing");
        currentInterval.current.push(new Date());
      } else if (currentInterval.current.length == 2) {
        const currDate = new Date();
        if (currDate.getTime() - currentInterval.current[1].getTime() < 5000) {
          currentInterval.current.pop();
        } else {
          speakingIntervals.current.push(currentInterval.current);
          currentInterval.current = [];
        }
      }
      // console.log("start", currDate);
    } else {
      if (currentInterval.current.length == 1) {
        currentInterval.current.push(new Date());
      } else if (currentInterval.current.length == 2) {
        const currDate = new Date();
        if (currDate.getTime() - currentInterval.current[1].getTime() < 5000) {
          currentInterval.current[1] = currDate;
        } else {
          speakingIntervals.current.push(currentInterval.current);
          currentInterval.current = [];
        }
      }
      // console.log("end", currDate);
    }
  }, [isSpeaking]);

  // Function to add a new object to the array
  function addObject(emotion_in: any, x_in: any, y_in: any) {
    if (!dataEmotionMap[emotion_in]) {
      dataEmotionMap[emotion_in] = [];
    }
    dataEmotionMap[emotion_in].push({ x: x_in, y: y_in });

    setDataEmotionMap({ ...dataEmotionMap });
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
      // console.log("IMAGE", imageSrc);
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
      var total_data = {
        data: JSON.parse(event.data),
        members: participants.length,
      };
      if (event.data.length >= 2 && event.data.charAt(2) === "f") {
        socket.emit("face", JSON.stringify(total_data));
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
      let descriptions = json["data"]["descriptions"];
      let facs = json["data"]["facs"];
      // console.log("JSON", json);
      // console.log("EMOTION", emotions)
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
      let keys = Object.keys(emotions);
      for (let i = 0; i < keys.length; i++) {
        let emotion = keys[i];
        let y = emotions[keys[i]];
        addObject(emotion, formattedDate, y);
      }

      keys = Object.keys(descriptions);
      for (let i = 0; i < keys.length; i++) {
        let description = keys[i];
        let y = descriptions[keys[i]];
        addObject(description, formattedDate, y);
      }

      keys = Object.keys(facs);
      for (let i = 0; i < keys.length; i++) {
        let fac = keys[i];
        let y = facs[keys[i]];
        addObject(fac, formattedDate, y);
      }

      // console.log("DATAMAP", JSON.stringify(dataEmotionMap, null, "\t"));
    });

    setInterval(capture, 10000);
    // example
    socket.connect();
  }, []);

  useEffect(() => {}, [dataEmotionMap]);

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
      <Card>
        <CardHeader>
          <Heading color="white" size="lg">
            Speaker Tone
          </Heading>
        </CardHeader>
        <CardBody>
          {speakerTone && (
            <>
              <Text color="white" size="lg">
                {speakerTone}
              </Text>
              <Emoji name={speakerTone} />
            </>
          )}
        </CardBody>
      </Card>
      <Divider />
      <Card>
        <CardHeader>
          <Heading color="white" size="lg">
            Audience Tone
          </Heading>
        </CardHeader>
        <CardBody>
          {audienceTone && (
            <>
              <Text color="white" size="lg">
                {audienceTone["emotions"]}{" "}
              </Text>
              <Emoji name={audienceTone["emotions"]} />
            </>
          )}
        </CardBody>
      </Card>
      <Divider />
      <Line
        // options={{
        //   scales: {
        //     x: {
        //       type: "time",
        //     },
        //   },
        // }}
        options={{
          responsive: true,
          scales: {
            // x: {
            //   type: "time",
            // },
            x: {
              type: "time",
              ticks: {
                font: {
                  size: 14,
                },
              },
            },
            y: {
              ticks: {
                font: {
                  size: 14,
                },
              },
            },
          },
          plugins: {
            tooltip: {
              enabled: true,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              titleColor: "#fff",
              bodyColor: "#fff",
              borderColor: "rgba(0, 0, 0, 0.8)",
              borderWidth: 1,
            },
            legend: {
              labels: {
                font: {
                  size: 14,
                },
              },
            },
            // annotation: {
            //   annotations: {
            //     box1: {
            //       type: "box",
            //       yMin: 0.2,
            //       yMax: 0.8,
            //       backgroundColor: "rgba(255, 99, 132, 0.25)",
            //     },
            //   },
            // },
          },
          animation: {
            duration: 2000,
          },
          elements: {
            line: {
              tension: 1, // Adjust the line tension as needed (0.0 to 1.0)
              borderWidth: 3,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
            },
            point: {
              radius: 6,
              backgroundColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
              borderColor: "#fff",
              hoverRadius: 6,
              hoverBackgroundColor: "#fff",
              hoverBorderWidth: 2,
            },
          },
        }}
        data={{
          datasets: [
            {
              data: dataEmotionMap["Sadness"],
            },
          ],
        }}
      />
      <Webcam
        audio={true}
        height={180}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={320}
        videoConstraints={videoConstraints}
        style={{ visibility: "hidden" }}
      />
    </>
  );
};

export default SpeakerState;
