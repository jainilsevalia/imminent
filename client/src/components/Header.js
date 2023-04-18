import React from "react";
import { switchAccount } from "../firebase";
//ICONS
import { MdChat } from "react-icons/md";
//ANIMATION
import { Spring } from "react-spring/renderprops";

const Header = ({ user, isInMeeting, toggleChat = false }) => {
  return (
    <nav className="navbar navbar-expand my-0 py-0">
      <a className="navbar-brand" href="/">
        <div className="navbar-header d-flex">
          <img
            src={require("../images/imminent-logo1.jpg").default}
            width="40px"
            height="40px"
            className="rounded-circle"
          />
          &ensp;
          <h3 style={{ marginTop: "1px" }}>
            <b>imminent</b>
          </h3>
        </div>
      </a>

      {user ? (
        <Spring from={{ opacity: 0 }} to={{ opacity: 1 }}>
          {(props) => (
            <ul
              className="navbar-nav ml-auto d-flex align-items-center"
              style={props}
            >
              {isInMeeting ? (
                <span style={{ display: "flex", alignItems: "center" }}>
                  <li
                    className="header-icons"
                    style={{ cursor: "pointer" }}
                    onClick={toggleChat}
                  >
                    <MdChat id="header-chatbtn" />
                  </li>
                  <span className="header-icons" style={{ fontSize: "36px" }}>
                    &nbsp;&nbsp;|&nbsp;
                  </span>
                </span>
              ) : (
                <li className="user-name-email">
                  <b
                    style={{
                      fontSize: "0.9em",
                      textAlign: "right",
                      lineHeight: "0.9",
                    }}
                  >
                    {user.displayName}
                  </b>
                  <span
                    style={{
                      fontSize: "0.7em",
                      fontFamily: "'Roboto Mono', monospace",
                    }}
                  >
                    {user.email}
                  </span>
                </li>
              )}

              <li className="nav-item">
                <a className="nav-link" onClick={switchAccount}>
                  <img
                    src={user.photoURL}
                    width="40px"
                    className="rounded-circle mb-1"
                  />
                </a>
              </li>
            </ul>
          )}
        </Spring>
      ) : (
        <Spring from={{ opacity: 0 }} to={{ opacity: 1 }}>
          {(props) => (
            <ul className="navbar-nav ml-auto" style={props}>
              <li className="nav-item">
                <a className="nav-link" onClick={switchAccount}>
                  <b>Sign in</b>
                  &ensp;
                  <img
                    src={require("../images/login-avatar.jpg").default}
                    width="40px"
                    className="rounded-circle mb-1"
                  />
                </a>
              </li>
            </ul>
          )}
        </Spring>
      )}
    </nav>
  );
};

export default Header;
