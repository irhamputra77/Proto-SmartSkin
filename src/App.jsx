import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import DetailPage from "./pages/DetailPage";
import LogsPage from "./pages/LogsPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/:sensor"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/logs"
          element={
            <RequireAuth>
              <LogsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/sensor/:sensorKey"
          element={
            <RequireAuth>
              <DetailPage />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
