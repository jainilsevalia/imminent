import React, { useContext, useEffect, useState } from "react";
import Header from "../components/Header";
import { Container, Row, Col } from "reactstrap";
import { useHistory, useParams } from "react-router-dom";

//CONTEXTS
import { UserContext } from "../UserProvider";
import { WebcamContext } from "../WebcamProvider";
//ICONS
import { IconContext } from "react-icons";
import { BiMicrophone, BiMicrophoneOff } from "react-icons/bi";
import { FiVideo, FiVideoOff } from "react-icons/fi";

const JoinRoom = () => {
  const user = useContext(UserContext);
  const {
    webcamRef,
    videoState,
    microphoneState,
    getMedia,
    toggleMicrophone,
    toggleVideo,
    allUsers,
    userGoingToJoinRoom,
  } = useContext(WebcamContext);

  const { roomID } = useParams();

  let history = useHistory();
  const isAllowForJoin = () => {
    if (user) {
      // console.log(webcamRef.current.srcObject);
      if (webcamRef.current.srcObject) {
        const tracks = webcamRef.current.srcObject.getTracks();
        tracks.forEach(function (track) {
          track.stop();
        });
      }
      history.replace(`/room/${roomID}`);
    } else {
      document.querySelector("#sign-in-msg").innerHTML =
        "Please sign in first !";
    }
  };

  useEffect(() => {
    if (user) {
      if (videoState[0]) {
        userGoingToJoinRoom(roomID);
        getMedia({ audio: true, video: true });
        setTimeout(() => {
          document.querySelector(".webcam").style.display = "initial";
          document.querySelector(".toggles").style.display = "initial";
        }, 1000);
      }
    }
  }, [user]);

  return (
    <div>
      <Header user={user} isInMeeting={false} />
      <Container fluid className="main">
        <Row className="mx-0" style={{ width: "100%" }}>
          <Col
            className="d-flex flex-column justify-content-center text-center"
            xl="6"
            lg="6"
          >
            <span id="jumbotron">Ready to join?</span>
            {allUsers.length ? (
              <p>
                {allUsers.map((user, i) => {
                  if (allUsers.length === i + 1) {
                    return <b key={user.userID}>{user.userName} </b>;
                  } else {
                    return <b key={user.userID}>{user.userName}, </b>;
                  }
                })}
                present in the room.
              </p>
            ) : (
              <p>No user in the meeting</p>
            )}
            <div className="d-inline">
              <a>
                <button className="button-basic" onClick={isAllowForJoin}>
                  Join now
                </button>
              </a>
            </div>
            <b
              id="sign-in-msg"
              className="fade-in"
              style={{ color: "#c84051", marginTop: "5px" }}
            ></b>
            <br />
          </Col>
          <Col xl="6" lg="6" id="imgCol" style={{ width: "100%" }}>
            <div className="webcam-container">
              <video
                ref={webcamRef}
                className="webcam fade-in"
                autoPlay
                muted
              />
              <div className="toggles">
                <IconContext.Provider
                  value={{
                    style: {
                      fontSize: "2.7em",
                      margin: "0px 10px",
                      backgroundColor: "white",
                      padding: "10px",
                      borderRadius: "15px",
                      boxShadow: "1px 8px 20px 0px rgba(0,0,0,0.6)",
                      color: " rgb(80, 80, 80 )",
                      cursor: "pointer",
                    },
                  }}
                >
                  <span onClick={toggleVideo}>
                    {videoState[0] ? (
                      <FiVideo />
                    ) : (
                      <FiVideoOff
                        style={{
                          backgroundColor: "#3C64A5",
                          color: "white",
                        }}
                      />
                    )}
                  </span>
                  <span onClick={toggleMicrophone}>
                    {microphoneState[0] ? (
                      <BiMicrophone />
                    ) : (
                      <BiMicrophoneOff
                        style={{
                          backgroundColor: "#3C64A5",
                          color: "white",
                        }}
                      />
                    )}
                  </span>
                </IconContext.Provider>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default JoinRoom;
