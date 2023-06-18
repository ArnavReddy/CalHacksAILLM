

import AudienceState from "./AudienceState/AudienceState";
import SpeakerState from "./SpeakerState/SpeakerState";

const LiveAssistant = () => {

  return (
    <div style={{ borderLeft: "dashed red;", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ flex: 1 }}>
        <AudienceState />
      </div>
      <div style={{ flex: 1 }}>
        <SpeakerState />
      </div>
    </div>
  );
};

export default LiveAssistant;
