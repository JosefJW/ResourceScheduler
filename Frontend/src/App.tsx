import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Family from "./pages/Family";
import AddItem from "./pages/AddItem";
import ReserveItem from "./pages/ReserveItem";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/family/:id" element={<Family />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/reserve/:itemId" element={<ReserveItem />} />
      </Routes>
    </Router>
  );
}

export default App;