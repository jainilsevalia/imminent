import React, { useContext } from "react";
import Header from "../components/Header";
import { Container, Row, Col } from "reactstrap";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

//CONTEXTS
import { UserContext } from "../UserProvider";

const Home = () => {
  const user = useContext(UserContext);

  const roomID = uuidv4();
  let history = useHistory();
  const isAllowForJoin = () => {
    if (user) {
      history.replace(`/joinroom/${roomID}`);
    } else {
      document.querySelector("#sign-in-msg").innerHTML =
        "Please sign in first !";
    }
  };

  return (
    <div>
      <Header user={user} isInMeeting={false} />
      <Container fluid className="main">
        <Row className="px-md-5">
          <Col xl="6" lg="6" className="main-content">
            <span id="jumbotron">
              The new way of video meeting. Understand well,explain better
            </span>
            <p>
              A app that augments live video meetings with interactive graphics
              to create a powerful and expressive environment.
            </p>
            <div className="d-inline">
              <a>
                <button className="button-basic" onClick={isAllowForJoin}>
                  New meeting
                </button>
              </a>
              &ensp;
              <input
                type="text"
                placeholder="Enter the link"
                className="input-basic"
              />
              &nbsp;
              <button className="button-transparent">Join</button>
            </div>
            <b
              id="sign-in-msg"
              className="fade-in"
              style={{ color: "#c84051", marginTop: "5px" }}
            ></b>
            <br />
          </Col>
          <Col xl="6" lg="6" id="imgCol">
            <img
              src={require("../images/video-calling.png").default}
              className="main-image"
            />
            <br />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
