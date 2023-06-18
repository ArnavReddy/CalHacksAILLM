import { useCallback, useEffect, useRef } from "react";
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
    const blob = await recorderRef.current.record(4000);
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
    setInterval(recordAndSend, 10000);

    wsRef.current = new WebSocket("wss://api.hume.ai/v0/stream/models?apikey=q7KqeFZxKy8uM3aDw0tgGnYQmXIrdC8de43cz5XKr0rrFpjq");


    wsRef.current.onopen = () => {
      console.log("WebSocket connection established");
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    wsRef.current.onerror = function (error) {
      console.log(error.ErrorEvent);
    };

    wsRef.current.onmessage = function (event) {

      if(event.data.length >= 3 && event.data.charAt(2) === 'f') {
        socket.emit("face", event.data);
      } else {
        socket.emit("prosody", event.data);
      }

    };

    socket.on("face_emit", (data) => {
        console.log(data); 
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