

import SpeakerState from "./SpeakerState/SpeakerState";
import { useConference, useParticipants } from "@dolbyio/comms-uikit-react";

const LiveAssistant = () => {
  const {conference} = useConference();
  const {participants, participantsStatus} = useParticipants();

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "start" }}>
      <SpeakerState participants={participants} pState={participantsStatus} conf={conference}/>
    </div>);
};

export default LiveAssistant;
