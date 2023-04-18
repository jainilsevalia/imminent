import React, { useState, useRef, createContext, useContext } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { UserContext } from "./UserProvider";
//TENSORFLOW
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";

export const WebcamContext = createContext(null);
export default ({ children }) => {
  const user = useContext(UserContext);
  const webcamRef = useRef();
  const aiCanvasRef = useRef();
  const aiCanavsStreamRef = useRef();
  const socketRef = useRef();
  const peersRef = useRef([]);
  const streamRef = useRef();
  const sendersRef = useRef([]);
  // const screenPeersRef = useRef([]);
  const screenStreamRef = useRef();
  // const screenSendersRef = useRef([]);

  const [peers, setPeers] = useState([]);
  // const [screenPeers, setScreenPeers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [videocam, setVideocam] = useState(true);
  const [microphone, setMicrophone] = useState(true);

  const [showWebcam, setWebcam] = useState(true);
  const [showAiCanvas, setAiCanvas] = useState(false);

  // var localstream = new MediaStream();

  const [room, setRoom] = useState(null);

  const getMedia = (c) => {
    //for the person who is joining
    navigator.mediaDevices
      .getUserMedia(c)
      .then((stream) => {
        //FIXME: (FIXED WITH HACK WHICH IS USING USER AS DEPENDENCY IN USEEFFECT)
        webcamRef.current.srcObject = stream;
        webcamRef.current.srcObject.getAudioTracks()[0].enabled = microphone;
        streamRef.current = stream;
        // console.log("userstream");
        // console.log(streamRef.current.getTracks());
      })
      .catch(function (err) {
        console.log(err);
      });
    return true;
  };

  const userGoingToJoinRoom = (roomID) => {
    socketRef.current = io.connect("/");
    socketRef.current.emit("going to join", roomID);
    socketRef.current.on("all users in room", (users) => {
      // console.log("all users in room");
      if (users) {
        const allUsersArray = [];
        users.forEach((user) => {
          allUsersArray.push({
            userID: user.id,
            userName: user.userName,
            userImage: user.userImage,
          });
        });
        setAllUsers(allUsersArray);
        // console.log(allUsersArray);
      }
    });
  };

  const userJoinsRoom = (roomID) => {
    setRoom(roomID);
    if (typeof socketRef.current === "undefined") {
      socketRef.current = io.connect("/");
    }
    socketRef.current.emit(
      "join room",
      roomID,
      user.displayName,
      user.photoURL
    );
    // console.log("you have joined room");
    socketRef.current.on("all users", (users) => {
      console.log("all users");

      users.forEach((userObj) => {
        const peer = createPeer(
          userObj.id,
          socketRef.current.id,
          streamRef.current,
          user.displayName,
          user.photoURL
        );
        peersRef.current.push({
          peerID: userObj.id,
          peer,
          userName: userObj.userName,
          userImage: userObj.userImage,
        });

        sendersRef.current.push(peer._pc.getSenders()[1]);
      });

      setPeers([...peersRef.current]);
      console.log("peers all users:", peersRef.current);
    });

    //for the person/people who is already joined
    socketRef.current.on("user joined", (payload) => {
      console.log("other user joined");
      const peer = addPeer(payload.signal, payload.callerID, streamRef.current);
      peersRef.current.push({
        peerID: payload.callerID,
        peer,
        userName: payload.userName,
        userImage: payload.userImage,
      });
      sendersRef.current.push(peer._pc.getSenders()[1]);
      console.log("peers user joined:", peersRef.current);
      setPeers([...peersRef.current]);
    });

    socketRef.current.on("receiving returned signal", (payload) => {
      // console.log("receiving returned signal");
      const item = peersRef.current.find((p) => p.peerID === payload.id);
      item.peer.signal(payload.signal);
    });

    socketRef.current.on("user left", (id) => {
      // console.log("user left");
      const peerObj = peersRef.current.find((p) => p.peerID === id);
      if (peerObj) {
        peerObj.peer.destroy();
      }
      const peers = peersRef.current.filter((p) => p.peerID !== id);
      peersRef.current = peers;
      setPeers(peers);
      // console.log("user left event peer :", peersRef.current);
      sendersRef.current.pop();
      // console.log(sendersRef.current);
    });

    socketRef.current.on("resend video", () => {
      console.log("resend video");
      sendersRef.current.forEach((sender) => {
        sender.replaceTrack(streamRef.current.getVideoTracks()[0]);
      });
    });

    socketRef.current.on("send changed background video", () => {
      console.log("send changed background video");
      sendersRef.current.forEach((sender) => {
        sender.replaceTrack(aiCanavsStreamRef.current.getVideoTracks()[0]);
      });
    });

    socketRef.current.on("renegotiation offer", handleRecieveOffer);

    socketRef.current.on("renegotiation answer", handleRecieveAnswer);
  };

  const createPeer = (userToSignal, callerID, stream, userName, userImage) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });
    peer.on("signal", (signal) => {
      // console.log("sending signal");
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
        userName,
        userImage,
      });
    });
    return peer;
  };

  const addPeer = (incomingSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });
    peer.on("signal", (signal) => {
      // console.log("returning signal");
      socketRef.current.emit("returning signal", { signal, callerID });
    });
    peer.signal(incomingSignal);
    return peer;
  };

  const toggleMicrophone = () => {
    webcamRef.current.srcObject.getAudioTracks()[0].enabled = !webcamRef.current.srcObject.getAudioTracks()[0]
      .enabled;
    setMicrophone(!microphone);
    // console.log(webcamRef.current.srcObject.getAudioTracks()[0].enabled);
  };

  const toggleVideo = () => {
    if (videocam) {
      setVideocam(false);
      webcamRef.current.srcObject.getVideoTracks()[0].enabled = false;
      setTimeout(() => {
        webcamRef.current.srcObject.getVideoTracks()[0].stop();
      }, 100);
    } else {
      setVideocam(true);
      var isDone = getMedia({ audio: true, video: true });
      setTimeout(() => {
        if (room && isDone) {
          socketRef.current.emit("turning back video");
        }
      }, 500);
    }
    // if (webcamRef.current.srcObject) {
    //   webcamRef.current.srcObject.getVideoTracks()[0].enabled = !webcamRef.current.srcObject.getVideoTracks()[0]
    //     .enabled;
    // } else {
    //   webcamRef.current.srcObject = streamRef.current;
    // }
    // setVideocam(!videocam);
  };

  const handleRecieveOffer = async (payload) => {
    console.log("renegotiation offer");
    const peer = peersRef.current.find(
      (peer) => peer.peerID === payload.caller
    );
    const pc = peer.peer._pc;
    const desc = new RTCSessionDescription(payload.sdp);
    console.log(desc);
    await pc
      .setRemoteDescription(desc)
      .then(() => {
        return pc.createAnswer();
      })
      .then((answer) => {
        return pc.setLocalDescription(answer);
      })
      .then(() => {
        const answerPayload = {
          target: payload.caller,
          caller: socketRef.current.id,
          sdp: pc.localDescription,
        };
        // socketRef.current.emit("sending renegotiation answer", answerPayload);
      });
  };

  const handleRecieveAnswer = (payload) => {
    console.log("renegotiation answer");
    const desc = new RTCSessionDescription(payload.sdp);
    const item = peersRef.current.find((p) => p.peerID === payload.caller);
    item.peer._pc.setRemoteDescription(desc).catch((e) => console.log(e));
  };

  const shareScreen = () => {
    peersRef.current.forEach((peer) => {
      const pc = peer.peer._pc;
      pc.onnegotiationneeded = () => {
        console.log("negotiation neeeded");
        pc.createOffer()
          .then((offer) => {
            return pc.setLocalDescription(offer);
          })
          .then(() => {
            const payload = {
              target: peer.peerID,
              caller: socketRef.current.id,
              sdp: pc.localDescription,
            };
            console.log("sending renegotiation offer");
            socketRef.current.emit("sending renegotiation offer", payload);
          })
          .catch((e) => console.log(e));
      };
    });

    navigator.mediaDevices
      .getDisplayMedia({ cursor: true })
      .then((stream) => {
        screenStreamRef.current = stream;
        peersRef.current.forEach((peer) => {
          peer.peer.addTrack(stream.getVideoTracks()[0], streamRef.current);
        });
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  //Code for change background of user video
  const runBodySegment = async () => {
    const net = await bodyPix.load();
    console.log("BodyPix model loaded");
    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    const video = webcamRef.current;
    if (typeof video !== "undefined" && video !== null) {
      const person = await net.segmentPerson(video, {
        flipHorizontal: false,
        internalResolution: "medium",
        segmentationThreshold: 0.7,
      });
      const videoWidth = webcamRef.current.videoWidth;
      const videoHeight = webcamRef.current.videoHeight;

      webcamRef.current.width = videoWidth;
      webcamRef.current.height = videoHeight;

      const canvas = aiCanvasRef.current;
      const backgroundBlurAmount = 5;
      const edgeBlurAmount = 2;
      const flipHorizontal = false;

      bodyPix.drawBokehEffect(
        canvas,
        video,
        person,
        backgroundBlurAmount,
        edgeBlurAmount,
        flipHorizontal
      );
    }
  };

  const changeBackground = () => {
    aiCanavsStreamRef.current = aiCanvasRef.current.captureStream(30);
    console.log(aiCanavsStreamRef.current);
    socketRef.current.emit("changing background");
  };

  const setOriginalBackground = () => {
    socketRef.current.emit("turning back video");
  };

  const webcamHelper = {
    user: user,
    allUsers: allUsers,
    webcamRef: webcamRef,
    videoState: [videocam, setVideocam],
    microphoneState: [microphone, setMicrophone],
    getMedia: getMedia,
    toggleMicrophone: toggleMicrophone,
    toggleVideo: toggleVideo,
    peers: peers,
    userJoinsRoom: userJoinsRoom,
    userGoingToJoinRoom: userGoingToJoinRoom,
    socketRef: socketRef,
    shareScreen: shareScreen,
    aiCanvasRef: aiCanvasRef,
    runBodySegment: runBodySegment,
    webcamState: [showWebcam, setWebcam],
    aiCanvasState: [showAiCanvas, setAiCanvas],
    changeBackground: changeBackground,
    setOriginalBackground: setOriginalBackground,
  };

  return (
    <WebcamContext.Provider value={webcamHelper}>
      {children}
    </WebcamContext.Provider>
  );
};
