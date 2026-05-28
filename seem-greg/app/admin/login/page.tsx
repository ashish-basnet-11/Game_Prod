"use client";
import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAdmin, getMe, ApiError } from "@/lib/api";

export default function AdminLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [captchaSvg, setCaptchaSvg] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    async function loadCaptcha() {
        try {
            const res = await fetch("/api/captcha");
            const data = await res.json();
            setCaptchaSvg(data.svg);
        } catch {
            // Ignore error
        }
        setCaptchaInput("");
    }

    // If already logged in, skip login page
    useEffect(() => {
        loadCaptcha();
        getMe()
            .then(() => router.replace("/admin/dashboard"))
            .catch(() => setChecking(false));
    }, [router]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await loginAdmin(email, password, captchaInput);
            // Cookies are now set by the browser automatically.
            // No token stored in JS — nothing to steal via XSS.
            const next = searchParams.get("next") || "/admin/dashboard";
            router.replace(next);
        } catch (err) {
            // Reload CAPTCHA on failure
            loadCaptcha();

            if (err instanceof ApiError) {
                setError(err.status === 401
                    ? "Invalid email or password"
                    : err.status === 429
                        ? "Too many attempts. Please wait a few minutes."
                        : err.message || "Login failed. Please try again."
                );
            } else {
                setError("Could not connect to the API or Invalid CAPTCHA.");
            }
        } finally {
            setLoading(false);
        }
    }

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#06060f" }}>
                <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ background: "linear-gradient(160deg, #07071a 0%, #10082e 55%, #07071a 100%)" }}
        >
            {/* Hex grid bg */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V17L28 1l28 16v33z' fill='none' stroke='%2300d4ff' stroke-width='0.5'/%3E%3C/svg%3E")`,
                    backgroundSize: "56px 100px",
                }}
            />
            {/* Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(108,63,197,0.2) 0%, transparent 70%)", filter: "blur(20px)" }} />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(230,57,70,0.12) 0%, transparent 70%)", filter: "blur(20px)" }} />

            <div className="relative w-full max-w-sm px-4">
                <div
                    className="rounded-2xl p-8"
                    style={{
                        background: "rgba(13,13,43,0.92)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
                        backdropFilter: "blur(12px)",
                    }}
                >
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-brand-red rounded-xl flex items-center justify-center glow-red mx-auto mb-3">
                            <span className="text-white font-bold font-display">SG</span>
                        </div>
                        <h1 className="font-display font-black text-white text-lg tracking-widest">SEEM GREG</h1>
                        <p className="font-body text-xs tracking-[0.3em] mt-0.5" style={{ color: "#e63946" }}>
                            ADMIN PORTAL
                        </p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div
                            className="mb-5 px-4 py-3 rounded-lg text-sm font-body flex items-start gap-2"
                            style={{ background: "rgba(230,57,70,0.1)", border: "1px solid rgba(230,57,70,0.3)", color: "#e63946" }}
                        >
                            <span className="shrink-0 mt-0.5">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block font-display text-[10px] tracking-widest text-white/50 uppercase mb-2">
                                Email
                            </label>
                            <input
                                type="email" required autoComplete="email"
                                value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="admin@seemgreg.com"
                                className="w-full px-4 py-3 rounded-lg font-body text-sm text-white placeholder-white/20 outline-none transition-all"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                                onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,212,255,0.5)")}
                                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block font-display text-[10px] tracking-widest text-white/50 uppercase mb-2">
                                Password
                            </label>
                            <input
                                type="password" required autoComplete="current-password"
                                value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-lg font-body text-sm text-white placeholder-white/20 outline-none transition-all"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                                onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,212,255,0.5)")}
                                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                            />
                        </div>

                        {/* Custom CAPTCHA */}
                        <div>
                            <label className="block font-display text-[10px] tracking-widest text-white/50 uppercase mb-2">
                                Verify you are human
                            </label>
                            <div className="flex gap-3 items-center mb-2">
                                <div
                                    className="px-4 py-2 rounded-lg select-none relative overflow-hidden flex-1 text-center flex items-center justify-center min-h-[60px]"
                                    style={{
                                        background: "linear-gradient(45deg, #10082e, #07071a)",
                                        color: "#00d4ff",
                                        border: "1px dashed rgba(0,212,255,0.3)"
                                    }}
                                    dangerouslySetInnerHTML={{ __html: captchaSvg }}
                                />
                                <button
                                    type="button"
                                    onClick={loadCaptcha}
                                    className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg transition-all"
                                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "1.2rem" }}
                                    title="Reload CAPTCHA"
                                >
                                    ↻
                                </button>
                            </div>
                            <input
                                type="text" required autoComplete="off" maxLength={4}
                                value={captchaInput} onChange={e => setCaptchaInput(e.target.value)}
                                placeholder="Type the 4 digits..."
                                className="w-full px-4 py-3 rounded-lg font-body text-sm text-white placeholder-white/20 outline-none transition-all text-center tracking-[0.2em]"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                                onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,212,255,0.5)")}
                                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full py-3 rounded-lg font-display font-bold text-sm tracking-widest uppercase transition-all mt-2"
                            style={{
                                background: loading ? "rgba(230,57,70,0.4)" : "linear-gradient(135deg, #e63946, #c1121f)",
                                color: "white",
                                boxShadow: loading ? "none" : "0 4px 20px rgba(230,57,70,0.4)",
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : "Sign In"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs font-body mt-4" style={{ color: "rgba(255,255,255,0.18)" }}>
                    Seem Greg Admin · Restricted Access
                </p>
            </div>
        </div>
    );
}