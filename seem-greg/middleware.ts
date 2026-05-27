// middleware.ts — runs on the Edge before every /admin/* request.
// Checks for the sg_access cookie. If missing, redirect to login.
// This is a fast first-line defence — the real validation happens
// in the Express API when the cookie is actually used.

import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Only guard /admin routes (but not /admin/login itself)
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        const accessCookie = req.cookies.get("sg_access");

        if (!accessCookie?.value) {
            const loginUrl = new URL("/admin/login", req.url);
            // Preserve intended destination so we can redirect back after login
            loginUrl.searchParams.set("next", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    // Run middleware on all /admin/* paths
    matcher: ["/admin/:path*"],
};