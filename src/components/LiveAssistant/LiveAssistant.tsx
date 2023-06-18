import { useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";
// import WebSocket from "ws";
import {socket} from '../../socket';
import { usingBrowserWebSocket } from "engine.io-client/build/esm/transports/websocket-constructor";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user"
};


const LiveAssistant = () => {
  const webcamRef = useRef(null);
  const wsRef = useRef(null);
  const backendWSRef = useRef(null);

  const capture = useCallback(
    () => {

      if (webcamRef) {
        const imageSrc = webcamRef.current.getScreenshot();
         console.log(imageSrc);
         sendImageFacePayload(imageSrc);
        // sendAudioProsodyPayload();
      }
    },
    [webcamRef]
  );

  useEffect(() => {
    // wsRef.current = new WebSocket("wss://api.hume.ai/v0/stream/models", {
    //   headers: {
    //     Authorization: "q7KqeFZxKy8uM3aDw0tgGnYQmXIrdC8de43cz5XKr0rrFpjq",
    //     "X-Hume-Api-Key": "q7KqeFZxKy8uM3aDw0tgGnYQmXIrdC8de43cz5XKr0rrFpjq",
    //   },
    // });

    // wsRef.current = new WebSocket("ws://api.hume.ai/v0/stream/models",
    //   headers: {
    //   Authorization: "q7KqeFZxKy8uM3aDw0tgGnYQmXIrdC8de43cz5XKr0rrFpjq",
    //   "X-Hume-Api-Key": "q7KqeFZxKy8uM3aDw0tgGnYQmXIrdC8de43cz5XKr0rrFpjq",
    // });

    wsRef.current = new WebSocket("wss://api.hume.ai/v0/stream/models?apikey=q7KqeFZxKy8uM3aDw0tgGnYQmXIrdC8de43cz5XKr0rrFpjq");
    backendWSRef.current = new WebSocket("ws://localhost:3001/face");
    // wsRef.current.headers = {
    //   Authorization: "q7KqeFZxKy8uM3aDw0tgGnYQmXIrdC8de43cz5XKr0rrFpjq",
    //   "X-Hume-Api-Key": "q7KqeFZxKy8uM3aDw0tgGnYQmXIrdC8de43cz5XKr0rrFpjq",
    // }

    
    wsRef.current.onopen = () => {
      console.log("WebSocket connection established");
    };
    backendWSRef.current.onopen = () => {
      console.log("Backend WebSocket connection established");
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    backendWSRef.current.onclose = () => {
      console.log("Backend WebSocket connection closed");
    };

    wsRef.current.onerror = function (error) {
      console.log(error.ErrorEvent);
    };

    backendWSRef.current.onerror = function (error) {
      console.log("BACKEND");
      console.log(error.ErrorEvent);
    };

    wsRef.current.onmessage = function (event) {
      console.log(`${event.data}`);
    };


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

  const sendAudioProsodyPayload = (base64Audio) => {
    const payload = {
    models: {
      prosody: {},
    },
    data: base64Audio,
  };

  wsRef.current.send(JSON.stringify(payload));
  }

  // const convertImageToBase64 = (imageSrc) => {
  //   console.log(imageSrc);
  // }


  return (<>
    <Webcam
      audio={false}
      height={720}
      ref={webcamRef}
      screenshotFormat="image/jpeg"
      width={1280}
      videoConstraints={videoConstraints}
    />

  </>
  );
};

export default LiveAssistant;
