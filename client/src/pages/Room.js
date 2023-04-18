import React, { useState, useContext, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import classnames from "classnames";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
//ANIMATION
import { useTransition, animated } from "react-spring";
import { Transition } from "react-spring/renderprops";
//COMPONENTS
import Header from "../components/Header";
import Canvas from "../components/Canvas";
import Chat from "../components/Chat";
import Footer from "../components/MeetingFooter";
//CONTEXTS
import { WebcamContext } from "../WebcamProvider";

const { largestSquare } = require("rect-scaler");
const OtherUsersWebcam = ({ peer }) => {
  const ref = useRef();
  const stream = ref.current && ref.current.srcObject;
  useEffect(() => {
    grabPeerStream();
  }, [stream]);

  const grabPeerStream = async () => {
    await peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  };

  const [show, set] = useState(true);

  return (
    <Transition
      items={show}
      from={{ opacity: 0 }}
      enter={{ opacity: 1 }}
      leave={{ opacity: 0 }}
    >
      {(show) =>
        show &&
        ((props) => {
          return (
            <div className="room-webcam-container" style={props}>
              <video autoPlay ref={ref} className="room-webcam" muted />
            </div>
          );
        })
      }
    </Transition>
  );
};

const Room = () => {
  const {
    user,
    webcamRef,
    videoState,
    getMedia,
    peers,
    userJoinsRoom,
    socketRef,
    aiCanvasRef,
    webcamState,
    aiCanvasState,
  } = useContext(WebcamContext);

  const { roomID } = useParams();

  useEffect(() => {
    if (user) {
      if (videoState[0]) {
        getMedia({ audio: true, video: true });
      }
      userJoinsRoom(roomID);
      window.onbeforeunload = () => {
        localStorage.removeItem(roomID);
      };
      socketRef.current.on("message", (message) => {
        receiveMessage(message);
        if (message.userID !== socketRef.current.id) {
          toast(
            <div>
              <span style={{ color: "#0252af" }}>{message.userName}:</span>
              <span> {message.body}</span>
            </div>
          );
        }
      });
    }
  }, [user]);

  //Chatting code
  let localMsgs = JSON.parse(localStorage.getItem(roomID));
  localMsgs = localMsgs ? localMsgs : [];
  const [messages, setMessages] = useState(localMsgs);

  const receiveMessage = (message) => {
    if (localMsgs) {
      localMsgs.push(message);
    } else {
      localMsgs = [message];
    }
    localStorage.setItem(roomID, JSON.stringify(localMsgs));
    setMessages([...localMsgs]);
  };

  //Maintining layout Of user-cams
  const recalculateLayout = () => {
    const mainContainer = document.querySelector("#meeting-section");
    const containerWidth = document
      .querySelector("#main-section")
      .getBoundingClientRect().width;
    const containerHeight = document
      .querySelector("#main-section")
      .getBoundingClientRect().height;
    const videoCount = document.getElementsByClassName("room-webcam").length;
    const { cols, width, height } = largestSquare(
      containerWidth,
      containerHeight,
      videoCount
    );

    mainContainer.style.setProperty("--width", width + "px");
    mainContainer.style.setProperty("--height", height + "px");
    mainContainer.style.setProperty("--cols", cols + "");
  };

  const debouncedRecalculateLayout = debounce(recalculateLayout, 50);
  window.addEventListener("resize", debouncedRecalculateLayout);
  debouncedRecalculateLayout();

  //Chat slideIn slideOut animation

  const [showCanvas, setCanvas] = useState(false);

  const [show, set] = useState(false);
  const chatTransitions = useTransition(show, null, {
    from: { transform: "translate(300px,0)" },
    enter: { transform: "translate(0px,0)" },
    leave: { transform: "translate(300px,0)" },
  });

  return (
    <div>
      <Header
        user={user}
        isInMeeting={true}
        toggleChat={() => {
          set(!show);
        }}
      />
      <Toaster
        toastOptions={{
          style: { fontSize: "0.9em", fontWeight: "bold", padding: "3px" },
        }}
      />
      <div id="meeting-main">
        {/* <Canvas /> */}
        <Transition
          items={showCanvas}
          from={{ transform: "translate(-520px,0)" }}
          enter={{ transform: "translate(0px,0)" }}
          leave={{ transform: "translate(-520px,0)" }}
        >
          {(showCanvas) =>
            showCanvas &&
            ((props) => (
              <div style={props} id="canvas">
                <Canvas />
              </div>
            ))
          }
        </Transition>
        <div id="main-section">
          <div id="meeting-section">
            <div
              className={classnames("room-webcam-container", {
                "hide-element": webcamState[0] === false,
              })}
            >
              <video className="room-webcam" ref={webcamRef} autoPlay muted />
            </div>
            <div
              className={classnames("room-webcam-container", {
                "hide-element": aiCanvasState[0] === false,
              })}
            >
              <canvas className="room-webcam" ref={aiCanvasRef} />
            </div>

            {/* {console.log("peers: \n", peers)} */}
            {peers.map((peer) => {
              return <OtherUsersWebcam key={peer.peerID} peer={peer.peer} />;
            })}
          </div>
        </div>
        {chatTransitions.map(
          ({ item, key, props }) =>
            item && (
              <animated.div key={key} style={props}>
                <Chat messages={messages} />
              </animated.div>
            )
        )}
      </div>
      <Footer roomID={roomID} toggleCanvasState={[showCanvas, setCanvas]} />
    </div>
  );
};

export default Room;
