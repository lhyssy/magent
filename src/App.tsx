import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Upload from "@/pages/Upload";
import Diagnosis from "@/pages/Diagnosis";
import Debate from "@/pages/Debate";
import Report from "@/pages/Report";
import Patients from "@/pages/Patients";
import Login from "@/pages/Login";
import Demo from "@/pages/Demo";
import Chat from "@/pages/Chat";
import Monitor from "@/pages/Monitor";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/diagnosis/:id" element={<Diagnosis />} />
        <Route path="/debate/:sessionId" element={<Debate />} />
        <Route path="/report/:id" element={<Report />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/login" element={<Login />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/monitor" element={<Monitor />} />
      </Routes>
    </Router>
  );
}
