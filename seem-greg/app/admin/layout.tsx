// layout.tsx
"use client";
import { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getMe, logoutAdmin, AdminUser, ApiError } from "@/lib/api";

interface SessionCtx {
    user: AdminUser | null;
    loading: boolean;
}
const SessionContext = createContext<SessionCtx>({ user: null, loading: true });
export const useSession = () => useContext(SessionContext);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (pathname === "/admin/login") { setLoading(false); return; }

        getMe()
            .then(setUser)
            .catch((err: ApiError) => {
                if (err.status === 401 || err.status === 403) {
                    router.replace("/admin/login");
                }
            })
            .finally(() => setLoading(false));
    }, [pathname, router]);

    const handleLogout = async () => {
        try {
            await logoutAdmin();
        } finally {
            router.replace("/admin/login");
        }
    };

    if (pathname === "/admin/login") {
        return <main className="min-h-screen bg-[#07071a]">{children}</main>;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#07071a]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-cyan" />
            </div>
        );
    }

    return (
        <SessionContext.Provider value={{ user, loading }}>
            {/* ── Outer wrapper locked to exactly the screen viewport height ── */}
            <div className="flex h-screen w-screen overflow-hidden bg-[#07071a]">

                {/* ── Pinned, non-scrolling Sidebar layout panel ── */}
                <aside
                    className="w-64 border-r flex flex-col justify-between p-4 shrink-0 h-full"
                    style={{
                        background: "linear-gradient(180deg, #0b0b26 0%, #07071a 100%)",
                        borderColor: "rgba(255,255,255,0.06)"
                    }}
                >
                    <div className="space-y-6">
                        {/* Title */}
                        <div className="px-2">
                            <h1 className="font-display font-black text-white text-lg tracking-wider">
                                SEEM GREG
                            </h1>
                            <p className="text-[10px] font-display tracking-widest text-brand-cyan uppercase mt-0.5">
                                Management Control
                            </p>
                        </div>

                        {/* Navigation items */}
                        <nav className="space-y-1">
                            {[
                                { label: "🎮 Games", path: "/admin/dashboard" },
                                { label: "🛡️ Agents Panel", path: "/admin/agents" },
                                { label: "⚙️ Settings", path: "/admin/settings" },
                            ].map((item) => {
                                const active = pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-semibold transition-all"
                                        style={{
                                            background: active ? "rgba(0,212,255,0.08)" : "transparent",
                                            border: `1px solid ${active ? "rgba(0,212,255,0.2)" : "transparent"}`,
                                            color: active ? "#00d4ff" : "rgba(255,255,255,0.4)",
                                        }}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bottom identity badge + Navigation controls */}
                    <div className="pt-4 border-t space-y-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        {/* Profile Info Display */}
                        <div className="px-3 py-2 mb-1">
                            <p className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.3)" }}>Logged in as</p>
                            <p className="text-xs font-body font-semibold text-white truncate">{user?.email || "—"}</p>
                            <p className="text-[10px] font-display tracking-widest mt-0.5 uppercase" style={{ color: "rgba(230,57,70,0.6)" }}>
                                {user?.role || ""}
                            </p>
                        </div>

                        {/* ── Back to Live Site Button ── */}
                        <Link
                            href="/"
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body font-semibold transition-all"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(0,212,255,0.08)";
                                e.currentTarget.style.color = "#00d4ff";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                            }}
                        >
                            <span>🏠</span> Back to Site
                        </Link>

                        {/* Logout Trigger Action */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body font-semibold transition-all"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(230,57,70,0.1)";
                                e.currentTarget.style.color = "#e63946";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                            }}
                        >
                            <span>🚪</span> Logout
                        </button>
                    </div>
                </aside>

                {/* ── Independent content panel pane that absorbs all scrolling ── */}
                <main className="flex-1 overflow-y-auto h-full p-6 md:p-8">
                    {children}
                </main>
            </div>
        </SessionContext.Provider>
    );
}