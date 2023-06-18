import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
// import WebSocket from "ws";
import { socket } from '../../../socket';
import { AudioRecorder, blobToBase64 } from "./AudioRecord";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user"
};


const SpeakerState = () => {
  const webcamRef = useRef(null);
  const wsRef = useRef(null);
  const backendWSRef = useRef(null);
  const recorderRef = useRef<AudioRecorder | null>(null);

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
    }
    sendAudioProsodyPayload(encodedBlob);
  }

  const prosodyHandler = (apiInput:string) => {

    const data = JSON.parse(apiInput);
    if(data.error) {
      return;
    }
    if(data["prosody"]["warning"]) {
      return;
    }
    const emotions = data["prosody"]["predictions"][0]["emotions"];
    // console.log(emotions);
    let maxScore = 0;
    let maxEmotion = "";
    for(let i = 0; i < emotions.length; i++ ) {
      if(emotions[i]["score"] > maxScore) {
        maxEmotion = emotions[i]['name'];
        maxScore = emotions[i]['score'];
      }
    }
    console.log(maxEmotion, maxScore);
  }



  const capture = useCallback(
    () => {

      if (webcamRef) {
        const imageSrc = webcamRef.current.getScreenshot();
        sendImageFacePayload(imageSrc);
      }
    },
    [webcamRef]
  );


  useEffect(() => {
    setInterval(recordAndSend, 4000);

    // setInterval(() => {
    //   wsRef.current = new WebSocket("wss://api.hume.ai/v0/stream/models?apikey=q7KqeFZxKy8uM3aDw0tgGnYQmXIrdC8de43cz5XKr0rrFpjq");
    // }, 50000)

    wsRef.current = new WebSocket("wss://api.hume.ai/v0/stream/models?apikey=q7KqeFZxKy8uM3aDw0tgGnYQmXIrdC8de43cz5XKr0rrFpjq");

    const openHandler = () => {
      console.log("WebSocket connection established");
    };

    const closeHandler = () => {
      console.log("WebSocket connection closed");
      setTimeout(() => {
        console.log('reconnecting');
        wsRef.current = null;
        wsRef.current = new WebSocket("wss://api.hume.ai/v0/stream/models?apikey=q7KqeFZxKy8uM3aDw0tgGnYQmXIrdC8de43cz5XKr0rrFpjq");

        wsRef.current.onopen = openHandler;
        wsRef.current.onclose = closeHandler;
        wsRef.current.onerror = errorHandler;
        wsRef.current.onmessage =  messageHandler;

        console.log(wsRef.current);
      }, 2000);
    };

    const errorHandler = (error)  => {
      console.log(error.ErrorEvent);
    };

    const messageHandler = (event)  => {
      // console.log(event.data);
      if(event.data.length >= 2 && event.data.charAt(2) === 'f') {
        socket.emit("face", event.data);
      } else {
        prosodyHandler(event.data);
      }
    };


    wsRef.current.onopen = openHandler;
    wsRef.current.onclose = closeHandler;
    wsRef.current.onerror = errorHandler;
    wsRef.current.onmessage =  messageHandler;

    socket.on("face_emit", (data) => {
        // console.log(data); 
        //Getting Max Value
    })

    setInterval(capture, 10000);
    // example
    socket.connect();
  }, []);

  const sendImageFacePayload = (base64Image) => {
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
  }



  return (
    <>
      <h2>Speaker</h2>
      <Webcam
        audio={true}
        height={180}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={320}
        videoConstraints={videoConstraints}
      />
    </>

  );
};

export default SpeakerState;