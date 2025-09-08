import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Demo from "@/pages/Demo";
import Chat from "@/pages/Chat";
import PresetDemoChat from "@/pages/PresetDemoChat";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/preset-demo" element={<PresetDemoChat />} />
      </Routes>
    </Router>
  );
}
