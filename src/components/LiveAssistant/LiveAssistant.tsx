import { useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user"
};

const LiveAssistant = () => {
  const webcamRef = useRef(null);
  const capture = useCallback(
    () => {

      if (webcamRef) {
        const imageSrc = webcamRef.current.getScreenshot();
        console.log(imageSrc);
      }
    },
    [webcamRef]
  );

  useEffect(() => {
    setInterval(capture, 1000);
  }, []);


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
