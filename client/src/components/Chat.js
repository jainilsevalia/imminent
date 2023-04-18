import React, { useState, useContext } from "react";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";
import { WebcamContext } from "../WebcamProvider";

//ICONS
import { MdSend } from "react-icons/md";
// import { BsPeople, BsChatSquare } from "react-icons/bs";

const Chat = ({ messages }) => {
  const { peers, socketRef, user } = useContext(WebcamContext);
  const [activeTab, setActiveTab] = useState("1");
  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const [inputMessage, setInputMessage] = useState("");

  const sendMessage = () => {
    const messageObject = {
      body: inputMessage,
      userName: user.displayName,
      userID: socketRef.current.id,
    };
    setInputMessage("");
    socketRef.current.emit("send message", messageObject);
  };

  const handleChange = (e) => {
    setInputMessage(e.target.value);
  };

  return (
    <div className="chat-section">
      <div className="chat-window">
        <Nav tabs justified className="nav">
          <NavItem>
            <NavLink
              className={classnames("navlink", { active: activeTab === "1" })}
              onClick={() => {
                toggle("1");
              }}
            >
              People
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames("navlink", { active: activeTab === "2" })}
              onClick={() => {
                toggle("2");
              }}
            >
              Chat
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab} id="tab-content">
          <TabPane tabId="1" id="people-body">
            <div id="people">
              <div className="person">
                <img
                  src={user.photoURL}
                  width="40px"
                  className="rounded-circle"
                />
                <span className="person-name">You</span>
              </div>
              {peers.map((peer) => {
                return (
                  <div className="person" key={peer.peerID}>
                    {peer.userImage ? (
                      <img
                        src={peer.userImage}
                        width="40px"
                        className="rounded-circle"
                      />
                    ) : (
                      <img
                        src={require("../images/login-avatar.jpg").default}
                        width="40px"
                        className="rounded-circle"
                      />
                    )}
                    <span className="person-name">{peer.userName}</span>
                  </div>
                );
              })}
            </div>
          </TabPane>
          <TabPane tabId="2" id="chat-body">
            <div id="chats">
              {messages.map((message, index) => {
                if (message.userID === socketRef.current.id) {
                  return (
                    <span className="chat-bubble" key={index}>
                      <span className="chat-user">You</span>
                      <span className="chat-message">{message.body}</span>
                    </span>
                  );
                } else {
                  return (
                    <span className="chat-bubble" key={index}>
                      <span className="chat-user">{message.userName}</span>
                      <span className="chat-message">{message.body}</span>
                    </span>
                  );
                }
              })}
            </div>
            <div id="chat-action">
              <input
                type="text"
                placeholder="Type a message..."
                style={{
                  border: "none",
                  borderRadius: "30px",
                  padding: "6px 8px",
                  fontWeight: "bold",
                  fontSize: ".8em",
                  marginRight: "5px",
                  width: "100%",
                }}
                className="type-message"
                onChange={handleChange}
                value={inputMessage}
              />
              <button
                style={{
                  border: "none",
                  borderRadius: "100%",
                  backgroundColor: " #0252af",
                  width: "30px",
                  height: "30px",
                }}
                onClick={sendMessage}
              >
                <MdSend style={{ color: "white", margin: "0 0 2px 2px" }} />
              </button>
            </div>
          </TabPane>
        </TabContent>
      </div>
    </div>
  );
};

export default Chat;
