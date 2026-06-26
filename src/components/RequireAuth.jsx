import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "../lib/auth";

// Wraps protected routes. If there's no session, redirect to /login and
// remember where the user was headed so we can return there after login.
export default function RequireAuth({ children }) {
    const location = useLocation();
    if (!isLoggedIn()) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return children;
}
