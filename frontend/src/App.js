import "./App.css";

import Homepage from "./Pages/Homepage";
import { Route } from "react-router-dom";
import Chatpage from "./Pages/Chatpage";
import ChatDashboard from "./Pages/dashboard";

function App() {
  return (
    <div className="App">
      <Route path="/" component={Homepage} exact />
      <Route path="/chats" component={Chatpage} />
      <Route path="/dashboard" component={ChatDashboard} />
    </div>
  );
}

export default App;
