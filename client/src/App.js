import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import { Switch, BrowserRouter as Router, Route } from "react-router-dom";
//COMPONENTS
import Home from "./pages/Home";
import JoinRoom from "./pages/JoinRoom";
import Room from "./pages/Room";
import LeftMeeting from "./pages/LeftMeeting";

//PROVIDERS
import UserProvider from "./UserProvider";
import WebcamProvider from "./WebcamProvider";

function App() {
  return (
    <UserProvider>
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <WebcamProvider>
            <Route path="/joinroom/:roomID" component={JoinRoom} />
            <Route path="/room/:roomID" component={Room} />
            <Route path="/leftmeeting/:roomID" component={LeftMeeting} />
          </WebcamProvider>
        </Switch>
      </Router>
    </UserProvider>
  );
}

export default App;
