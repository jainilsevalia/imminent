import React, { useState, useContext, useEffect, useRef } from "react";
import { BiMicrophone, BiMicrophoneOff, BiChalkboard } from "react-icons/bi";
import { FiVideo, FiVideoOff } from "react-icons/fi";
import { CgScreen } from "react-icons/cg";
import { MdBlurOn, MdBlurOff } from "react-icons/md";
import { FaRegFileAudio } from "react-icons/fa";
import { WebcamContext } from "../WebcamProvider";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

//CONTEXT
import { IconContext } from "react-icons";

const MeetingFooter = ({ roomID, toggleCanvasState }) => {
  const {
    webcamRef,
    videoState,
    microphoneState,
    toggleMicrophone,
    toggleVideo,
    socketRef,
    shareScreen,
    aiCanvasRef,
    runBodySegment,
    webcamState,
    aiCanvasState,
    changeBackground,
    setOriginalBackground,
  } = useContext(WebcamContext);

  const { transcript, resetTranscript } = useSpeechRecognition();

  let iconStyleOff = { backgroundColor: "#3C64A5", color: "white" };
  let iconStyleOn = {
    margin: "0 8px",
    padding: "13px",
    width: "50px",
    height: "50px",
    borderRadius: "15px",
    boxShadow: "3px 5px 15px 0px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
  };

  // let history = useHistory();
  const leftMeeting = () => {
    if (webcamRef.current.srcObject) {
      const tracks = webcamRef.current.srcObject.getTracks();
      tracks.forEach(function (track) {
        track.stop();
      });
    }
    socketRef.current.disconnect();
    // history.replace(`/leftmeeting/${roomID}`);
    window.location.href = `/leftmeeting/${roomID}`;
  };

  const [blur, setBlur] = useState(false);

  const blurBackground = () => {
    webcamState[1](!webcamState[0]);
    aiCanvasState[1](!aiCanvasState[0]);
    if (blur) {
      setBlur(false);
      console.log("Stop blur");
      for (let i = 1; i < 100; i++) window.clearInterval(i);
      let ctx = aiCanvasRef.current.getContext("2d");
      ctx.clearRect(
        0,
        0,
        aiCanvasRef.current.width,
        aiCanvasRef.current.height
      );
      setOriginalBackground();
    } else {
      setBlur(true);
      console.log("Start blur");
      runBodySegment();
      changeBackground();
    }
  };

  const [captionState, setCaptionState] = useState(false);

  const toggleCaption = () => {
    if (captionState) {
      console.log("off SpeechRecognition");
      SpeechRecognition.stopListening();
      resetTranscript();
      setCaptionState(false);
    } else {
      console.log("on SpeechRecognition");
      SpeechRecognition.startListening({ continuous: true });
      setCaptionState(true);
    }
  };

  const transcriptEndRef = useRef(null);

  const scrollToBottom = () => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transcript]);

  return (
    <div className="d-flex flex-column align-items-center">
      <div className="font-weight-bold caption">
        {transcript}
        <div ref={transcriptEndRef} />
      </div>
      <div id="footer">
        <IconContext.Provider
          value={{
            style: iconStyleOn,
          }}
        >
          <span
            onClick={() => {
              toggleCanvasState[1](!toggleCanvasState[0]);
            }}
          >
            {toggleCanvasState[0] ? (
              <BiChalkboard style={iconStyleOff} />
            ) : (
              <BiChalkboard />
            )}
          </span>

          <span>
            <CgScreen />
          </span>

          <span onClick={blurBackground}>
            {blur ? <MdBlurOn style={iconStyleOff} /> : <MdBlurOff />}
          </span>

          <span onClick={toggleCaption}>
            {captionState ? (
              <FaRegFileAudio style={iconStyleOff} />
            ) : (
              <FaRegFileAudio />
            )}
          </span>

          <span id="leave-meeting" onClick={leftMeeting}>
            <img
              src={require("../images/leave-meeting.png").default}
              style={{ width: "80px", marginTop: "3px" }}
            />
          </span>
          <span onClick={toggleMicrophone}>
            {microphoneState[0] ? (
              <BiMicrophone />
            ) : (
              <BiMicrophoneOff style={iconStyleOff} />
            )}
          </span>
          <span onClick={toggleVideo}>
            {videoState[0] ? <FiVideo /> : <FiVideoOff style={iconStyleOff} />}
          </span>
        </IconContext.Provider>
      </div>
    </div>
  );
};

export default MeetingFooter;
