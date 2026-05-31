// middleware.ts — runs on the Edge before every /admin/* request.
// Checks for the sg_access cookie. If missing, redirect to login.
// This is a fast first-line defence — the real validation happens
// in the Express API when the cookie is actually used.

import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    // ── Cross-Domain Auth Fix ──────────────────────────────────────────────
    // Because the frontend (vercel.app) and backend (onrender.com) are on 
    // different domains, the browser will NOT send the 'sg_access' cookie to Vercel.
    // Therefore, this middleware cannot see the cookie.
    // The authentication check is now fully handled client-side in layout.tsx via getMe().
    return NextResponse.next();
}

export const config = {
    // Run middleware on all /admin/* paths
    matcher: ["/admin/:path*"],
};