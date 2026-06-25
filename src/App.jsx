import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import DetailPage from "./pages/DetailPage";
import LogsPage from "./pages/LogsPage";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/:sensor" element={<DashboardPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/sensor/:sensorKey" element={<DetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}


