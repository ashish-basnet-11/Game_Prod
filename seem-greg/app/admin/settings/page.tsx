"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "../layout";
import {
    ApiError,
    Session,
    updateEmail,
    updatePassword,
    getActiveSessions,
    revokeSessionById,
    revokeAllSessions,
} from "@/lib/api";

// ── UA parser helper ──────────────────────────────────────────────────────────
function parseUserAgent(ua: string | null): { browser: string; os: string; icon: string } {
    if (!ua) return { browser: "Unknown", os: "Unknown", icon: "🖥️" };

    let browser = "Unknown";
    let os = "Unknown";
    let icon = "🖥️";

    // Browser detection
    if (ua.includes("Firefox")) { browser = "Firefox"; icon = "🦊"; }
    else if (ua.includes("Edg/")) { browser = "Edge"; icon = "🌐"; }
    else if (ua.includes("Chrome") && !ua.includes("Edg")) { browser = "Chrome"; icon = "🌐"; }
    else if (ua.includes("Safari") && !ua.includes("Chrome")) { browser = "Safari"; icon = "🧭"; }
    else if (ua.includes("Opera") || ua.includes("OPR")) { browser = "Opera"; icon = "🔴"; }

    // OS detection
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    return { browser, os, icon };
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
}

// ── Shared card wrapper ───────────────────────────────────────────────────────
function SettingsCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
    return (
        <div
            className="rounded-2xl p-6"
            style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
            }}
        >
            <div className="mb-5">
                <h2 className="font-display font-bold text-white text-base tracking-wide">{title}</h2>
                <p className="font-body text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {subtitle}
                </p>
            </div>
            {children}
        </div>
    );
}

// ── Styled input ──────────────────────────────────────────────────────────────
function SettingsInput({
    label, type = "text", value, onChange, placeholder, id,
}: {
    label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; id: string;
}) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="block text-[10px] font-display font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-lg font-body text-sm text-white placeholder-white/20 outline-none transition-all"
                style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,212,255,0.4)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
        </div>
    );
}

// ── Save button ───────────────────────────────────────────────────────────────
function SaveButton({ onClick, loading, label = "Save Changes" }: { onClick: () => void; loading: boolean; label?: string }) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
                background: "linear-gradient(135deg, #00d4ff, #0097a7)",
                boxShadow: "0 4px 20px rgba(0,212,255,0.3)",
                color: "#07071a",
            }}
        >
            {loading && <span className="w-4 h-4 border-2 border-[#07071a] border-t-transparent rounded-full animate-spin" />}
            {label}
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdminSettingsPage() {
    const router = useRouter();
    const { user } = useSession();

    // ── Email form ──
    const [newEmail, setNewEmail] = useState("");
    const [emailPassword, setEmailPassword] = useState("");
    const [emailLoading, setEmailLoading] = useState(false);

    // ── Password form ──
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [pwLoading, setPwLoading] = useState(false);

    // ── Sessions ──
    const [sessions, setSessions] = useState<Session[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [revokingAll, setRevokingAll] = useState(false);

    const isSuperAdmin = user?.role === "superadmin";

    // Prefill current email
    useEffect(() => {
        if (user?.email) setNewEmail(user.email);
    }, [user?.email]);

    // Fetch sessions
    const fetchSessions = useCallback(async () => {
        if (!isSuperAdmin) return;
        try {
            setSessionsLoading(true);
            const data = await getActiveSessions();
            setSessions(data);
        } catch (err) {
            if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
                router.replace("/admin/login");
            } else {
                toast.error("Failed to load sessions");
            }
        } finally {
            setSessionsLoading(false);
        }
    }, [isSuperAdmin, router]);

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    // ── Handlers ──

    const handleEmailUpdate = async () => {
        if (!newEmail.trim() || !emailPassword.trim()) {
            toast.error("Please fill all fields"); return;
        }
        if (newEmail === user?.email) {
            toast.error("That's already your current email"); return;
        }
        setEmailLoading(true);
        try {
            await toast.promise(updateEmail(emailPassword, newEmail), {
                loading: "Updating email…",
                success: "Email updated! Reloading…",
                error: (err) => err?.message || "Failed to update email",
            });
            setEmailPassword("");
            // Reload to refresh session context
            setTimeout(() => window.location.reload(), 1000);
        } catch {
            // handled by toast
        } finally {
            setEmailLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!currentPw || !newPw || !confirmPw) {
            toast.error("Please fill all fields"); return;
        }
        if (newPw.length < 8) {
            toast.error("New password must be at least 8 characters"); return;
        }
        if (newPw !== confirmPw) {
            toast.error("New passwords don't match"); return;
        }
        setPwLoading(true);
        try {
            await toast.promise(updatePassword(currentPw, newPw), {
                loading: "Changing password…",
                success: "Password changed! All other sessions revoked.",
                error: (err) => err?.message || "Failed to change password",
            });
            setCurrentPw(""); setNewPw(""); setConfirmPw("");
            fetchSessions();
        } catch {
            // handled by toast
        } finally {
            setPwLoading(false);
        }
    };

    const handleRevokeSession = async (id: string) => {
        setRevokingId(id);
        try {
            await toast.promise(revokeSessionById(id), {
                loading: "Revoking session…",
                success: "Session revoked",
                error: "Failed to revoke session",
            });
            setSessions(prev => prev.filter(s => s.id !== id));
        } catch {
            // handled by toast
        } finally {
            setRevokingId(null);
        }
    };

    const handleRevokeAll = async () => {
        setRevokingAll(true);
        try {
            await toast.promise(revokeAllSessions(), {
                loading: "Revoking all sessions…",
                success: "All sessions revoked. Redirecting…",
                error: "Failed to revoke sessions",
            });
            setTimeout(() => router.replace("/admin/login"), 1500);
        } catch {
            // handled by toast
        } finally {
            setRevokingAll(false);
        }
    };

    // ── Access denied for non-superadmins ──
    if (user && !isSuperAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-6xl">🔒</div>
                    <h1 className="font-display font-black text-xl text-white">Access Denied</h1>
                    <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Only superadmin users can access settings.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display font-black text-2xl text-white tracking-wide">Settings</h1>
                    <p className="font-body text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Manage your account, security, and active sessions
                    </p>
                </div>
                <div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl"
                    style={{ background: "rgba(230,57,70,0.08)", border: "1px solid rgba(230,57,70,0.2)" }}
                >
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="font-display font-bold text-[10px] tracking-widest uppercase" style={{ color: "#e63946" }}>
                        SUPERADMIN
                    </span>
                </div>
            </div>

            <div className="grid gap-6 max-w-2xl">
                {/* ── Section 1: Change Email ── */}
                <SettingsCard title="✉️ Account Email" subtitle="Update your login email address. Requires password confirmation.">
                    <div className="space-y-4">
                        <SettingsInput
                            id="settings-new-email"
                            label="New Email"
                            type="email"
                            value={newEmail}
                            onChange={setNewEmail}
                            placeholder="you@example.com"
                        />
                        <SettingsInput
                            id="settings-email-password"
                            label="Current Password"
                            type="password"
                            value={emailPassword}
                            onChange={setEmailPassword}
                            placeholder="Enter your password to confirm"
                        />
                        <div className="pt-1">
                            <SaveButton onClick={handleEmailUpdate} loading={emailLoading} label="Update Email" />
                        </div>
                    </div>
                </SettingsCard>

                {/* ── Section 2: Change Password ── */}
                <SettingsCard title="🔐 Change Password" subtitle="Choose a strong password. All other sessions will be revoked.">
                    <div className="space-y-4">
                        <SettingsInput
                            id="settings-current-password"
                            label="Current Password"
                            type="password"
                            value={currentPw}
                            onChange={setCurrentPw}
                            placeholder="Enter current password"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SettingsInput
                                id="settings-new-password"
                                label="New Password"
                                type="password"
                                value={newPw}
                                onChange={setNewPw}
                                placeholder="At least 8 characters"
                            />
                            <SettingsInput
                                id="settings-confirm-password"
                                label="Confirm New Password"
                                type="password"
                                value={confirmPw}
                                onChange={setConfirmPw}
                                placeholder="Re-enter new password"
                            />
                        </div>

                        {/* Password strength indicator */}
                        {newPw.length > 0 && (
                            <div className="space-y-1.5">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map(i => (
                                        <div
                                            key={i}
                                            className="h-1 flex-1 rounded-full transition-all duration-300"
                                            style={{
                                                background:
                                                    newPw.length >= i * 4
                                                        ? i <= 1 ? "#e63946"
                                                            : i <= 2 ? "#ffa726"
                                                                : i <= 3 ? "#00d4ff"
                                                                    : "#22c55e"
                                                        : "rgba(255,255,255,0.08)",
                                            }}
                                        />
                                    ))}
                                </div>
                                <p className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.3)" }}>
                                    {newPw.length < 8 ? "Too short" : newPw.length < 12 ? "Fair" : newPw.length < 16 ? "Strong" : "Very strong"}
                                </p>
                            </div>
                        )}

                        {/* Match indicator */}
                        {confirmPw.length > 0 && (
                            <p className="text-xs font-body" style={{ color: newPw === confirmPw ? "#22c55e" : "#e63946" }}>
                                {newPw === confirmPw ? "✓ Passwords match" : "✗ Passwords do not match"}
                            </p>
                        )}

                        <div className="pt-1">
                            <SaveButton onClick={handlePasswordUpdate} loading={pwLoading} label="Change Password" />
                        </div>
                    </div>
                </SettingsCard>

                {/* ── Section 3: Active Sessions ── */}
                <SettingsCard title="📱 Active Sessions" subtitle="Devices currently logged in to your account.">
                    {sessionsLoading ? (
                        <div className="py-10 text-center">
                            <div className="w-6 h-6 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Loading sessions…</p>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="text-3xl mb-2">🔒</p>
                            <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>No active sessions found</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                {sessions.map(session => {
                                    const { browser, os, icon } = parseUserAgent(session.userAgent);
                                    return (
                                        <div
                                            key={session.id}
                                            className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all"
                                            style={{
                                                background: session.isCurrent
                                                    ? "rgba(0,212,255,0.05)"
                                                    : "rgba(255,255,255,0.02)",
                                                border: session.isCurrent
                                                    ? "1px solid rgba(0,212,255,0.15)"
                                                    : "1px solid rgba(255,255,255,0.05)",
                                            }}
                                        >
                                            {/* Device icon */}
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                                                style={{
                                                    background: session.isCurrent
                                                        ? "rgba(0,212,255,0.1)"
                                                        : "rgba(255,255,255,0.04)",
                                                }}
                                            >
                                                {icon}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-display font-bold text-sm text-white truncate">
                                                        {browser} on {os}
                                                    </p>
                                                    {session.isCurrent && (
                                                        <span
                                                            className="px-2 py-0.5 rounded-md text-[9px] font-display font-bold tracking-wider uppercase shrink-0"
                                                            style={{
                                                                background: "rgba(34,197,94,0.12)",
                                                                color: "#22c55e",
                                                                border: "1px solid rgba(34,197,94,0.25)",
                                                            }}
                                                        >
                                                            THIS DEVICE
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-body text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                                                    {session.ipAddress || "IP unknown"} · {timeAgo(session.createdAt)}
                                                </p>
                                            </div>

                                            {/* Revoke */}
                                            {!session.isCurrent && (
                                                <button
                                                    onClick={() => handleRevokeSession(session.id)}
                                                    disabled={revokingId === session.id}
                                                    className="px-3 py-1.5 rounded-lg font-display font-bold text-[10px] tracking-wider uppercase transition-all disabled:opacity-50"
                                                    style={{
                                                        background: "rgba(230,57,70,0.08)",
                                                        border: "1px solid rgba(230,57,70,0.2)",
                                                        color: "#e63946",
                                                    }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(230,57,70,0.18)")}
                                                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(230,57,70,0.08)")}
                                                >
                                                    {revokingId === session.id ? "…" : "Revoke"}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Revoke All */}
                            {sessions.filter(s => !s.isCurrent).length > 0 && (
                                <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                    <button
                                        onClick={handleRevokeAll}
                                        disabled={revokingAll}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-[10px] tracking-widest uppercase transition-all disabled:opacity-50"
                                        style={{
                                            background: "rgba(230,57,70,0.06)",
                                            border: "1px solid rgba(230,57,70,0.15)",
                                            color: "#e63946",
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(230,57,70,0.14)")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(230,57,70,0.06)")}
                                    >
                                        {revokingAll && <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />}
                                        ⚠️ Revoke All Sessions (You&apos;ll be logged out)
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </SettingsCard>
            </div>
        </div>
    );
}
