import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { apiUrl } from "../lib/api";
import { setSession, isLoggedIn } from "../lib/auth";
import { Lock, User as UserIcon, LogIn, ShieldCheck } from "lucide-react";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const redirectTarget =
        searchParams.get("next") || location.state?.from?.pathname || "/dashboard";

    // Already logged in → skip the login screen.
    useEffect(() => {
        if (isLoggedIn()) navigate(redirectTarget, { replace: true });
    }, [navigate, redirectTarget]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch(apiUrl("/auth/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username.trim(), password }),
            });

            if (!res.ok) {
                setError(
                    res.status === 401
                        ? "Username atau password salah."
                        : "Gagal login. Coba lagi sebentar."
                );
                return;
            }

            const data = await res.json();
            setSession(data.access_token, data.user);
            navigate(redirectTarget, { replace: true });
        } catch {
            setError("Tidak bisa terhubung ke server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-dvh bg-[#e9eef3] flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="neo-surface p-6 sm:p-8 flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="neo-inset w-14 h-14 rounded-2xl flex items-center justify-center text-slate-600">
                            <ShieldCheck size={26} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-700">SmartSkin</h1>
                        <p className="text-sm text-slate-500">
                            Masuk untuk mengakses dashboard & log sensor.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <label className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                <UserIcon size={13} /> Username
                            </span>
                            <input
                                type="text"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                                className="neo-inset px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 outline-none"
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                <Lock size={13} /> Password
                            </span>
                            <input
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="neo-inset px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 outline-none"
                            />
                        </label>

                        {error && (
                            <div className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="neo-pill px-4 py-2.5 text-sm font-semibold text-slate-700 active:scale-[0.99] disabled:opacity-60 inline-flex items-center justify-center gap-2"
                        >
                            <LogIn size={16} />
                            {loading ? "Masuk…" : "Masuk"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
