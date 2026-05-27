"use client";
import { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getMe, logoutAdmin, AdminUser, ApiError } from "@/lib/api";

// ── Session context — share user across admin pages ───────────────────────────
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
        // Skip session check on the login page
        if (pathname === "/admin/login") { setLoading(false); return; }

        getMe()
            .then(setUser)
            .catch((err: ApiError) => {
                // Any auth error — go to login
                if (err.status === 401 || err.status === 403) {
                    router.replace("/admin/login");
                }
            })
            .finally(() => setLoading(false));
    }, [pathname, router]);

    const handleLogout = async () => {
        try {
            await logoutAdmin(); // clears httpOnly cookies server-side
        } finally {
            router.replace("/admin/login");
        }
    };

    // Login page — render with no shell
    if (pathname === "/admin/login") {
        return <SessionContext.Provider value={{ user, loading }}>{children}</SessionContext.Provider>;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#06060f" }}>
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="font-display text-xs tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
                        VERIFYING SESSION...
                    </p>
                </div>
            </div>
        );
    }

    const navItems = [
        { href: "/admin/games", label: "Games", icon: "🎮" },
        { href: "/", label: "View Site", icon: "🌐", external: true },
    ];

    return (
        <SessionContext.Provider value={{ user, loading }}>
            <div className="min-h-screen flex" style={{ background: "#06060f" }}>

                {/* ── Sidebar ── */}
                <aside
                    className="w-56 shrink-0 flex flex-col"
                    style={{
                        background: "linear-gradient(180deg, #0d0d2b 0%, #07071a 100%)",
                        borderRight: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    {/* Logo */}
                    <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <Link href="/admin/games" className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-brand-red rounded flex items-center justify-center glow-red">
                                <span className="text-white text-xs font-bold font-display">SG</span>
                            </div>
                            <div>
                                <p className="font-display font-bold text-white text-xs tracking-widest leading-tight">SEEM GREG</p>
                                <p className="font-body text-[10px] tracking-widest" style={{ color: "#e63946" }}>ADMIN</p>
                            </div>
                        </Link>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 p-3 space-y-1">
                        {navItems.map(item => {
                            const isActive = pathname.startsWith(item.href) && item.href !== "/";
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    target={item.external ? "_blank" : undefined}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-body font-semibold"
                                    style={{
                                        background: isActive ? "rgba(230,57,70,0.12)" : "transparent",
                                        color: isActive ? "#e63946" : "rgba(255,255,255,0.5)",
                                        border: isActive ? "1px solid rgba(230,57,70,0.25)" : "1px solid transparent",
                                    }}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                    {item.external && <span className="ml-auto text-xs opacity-40">↗</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User info + logout */}
                    <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <div className="px-3 py-2 mb-1">
                            <p className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.3)" }}>Logged in as</p>
                            <p className="text-xs font-body font-semibold text-white truncate">{user?.email || "—"}</p>
                            <p className="text-[10px] font-display tracking-widest mt-0.5 uppercase" style={{ color: "rgba(230,57,70,0.6)" }}>
                                {user?.role || ""}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body font-semibold transition-all"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(230,57,70,0.1)"; e.currentTarget.style.color = "#e63946"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                        >
                            <span>🚪</span> Logout
                        </button>
                    </div>
                </aside>

                {/* ── Main ── */}
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </SessionContext.Provider>
    );
}