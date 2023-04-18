import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Container } from "reactstrap";

const LeftMeeting = () => {
  let history = useHistory();
  const { roomID } = useParams();
  return (
    <Container fluid id="leftmeeting-main">
      <span style={{ fontSize: "2.5em", fontWeight: "bold" }}>
        You left meeting.
      </span>
      <img
        src={require("../images/leftmeeting-img.svg").default}
        id="leftmeeting-img"
      />
      <div>
        <button
          className="mx-2"
          style={{
            border: "3px solid",
            borderRadius: "10px",
            padding: "7px",
            fontWeight: "bold",
            backgroundColor: "white",
          }}
          onClick={() => {
            history.replace(`/joinroom/${roomID}`);
          }}
        >
          Rejoin
        </button>
        <button
          className="button-basic"
          onClick={() => {
            history.replace("/");
          }}
        >
          Return to home screen
        </button>
      </div>
    </Container>
  );
};

export default LeftMeeting;
