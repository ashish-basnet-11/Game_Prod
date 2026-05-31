import { NextResponse } from 'next/server';
import crypto from 'crypto';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function POST(req: Request) {
    try {
        const { email, password, captcha } = await req.json();
        
        // Retrieve captcha cookie
        const cookieStore = req.headers.get('cookie') || '';
        const match = cookieStore.match(/(?:^|;\s*)sg_captcha=([^;]+)/);
        const hash = match ? match[1] : null;

        // Prepare the response early so we can clear the cookie regardless of outcome
        // We will build on this base response depending on success/failure
        
        // Single-Use Enforcement: Always clear the cookie immediately
        const clearCookieHeader = 'sg_captcha=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax';

        if (!hash || !captcha) {
            const res = NextResponse.json({ message: "CAPTCHA required or expired" }, { status: 400 });
            res.headers.append('Set-Cookie', clearCookieHeader);
            return res;
        }
        
        const secret = process.env.CAPTCHA_SECRET || 'fallback_secret_seemgreg_captcha';
        const expectedHash = crypto.createHmac('sha256', secret).update(captcha).digest('hex');
        
        if (hash !== expectedHash) {
            const res = NextResponse.json({ message: "Incorrect CAPTCHA" }, { status: 400 });
            res.headers.append('Set-Cookie', clearCookieHeader);
            return res;
        }
        
        // CAPTCHA is valid. Return success to the client so it can hit the real API directly.
        const res = NextResponse.json({ success: true, message: "CAPTCHA valid" });
        res.headers.append('Set-Cookie', clearCookieHeader);
        
        return res;
    } catch (err) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
