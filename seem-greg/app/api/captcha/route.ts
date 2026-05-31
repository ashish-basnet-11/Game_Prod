import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const secret = process.env.CAPTCHA_SECRET || 'fallback_secret_seemgreg_captcha';
    
    // Generate simple SVG
    const svg = `<svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="transparent" />
      <path d="M10 25 Q 40 10, 75 25 T 180 25" stroke="rgba(0,212,255,0.2)" fill="none" stroke-width="2"/>
      <path d="M10 15 Q 40 40, 75 15 T 180 15" stroke="rgba(230,57,70,0.2)" fill="none" stroke-width="2"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="32" font-weight="bold" fill="#00d4ff" letter-spacing="12">${code}</text>
      <!-- Noise -->
      ${Array.from({length: 30}).map(() => `<circle cx="${Math.random()*200}" cy="${Math.random()*60}" r="${Math.random()*1.5}" fill="#fff" opacity="0.3"/>`).join('')}
      <!-- Obscuring lines -->
      ${Array.from({length: 5}).map(() => `<line x1="${Math.random()*200}" y1="${Math.random()*60}" x2="${Math.random()*200}" y2="${Math.random()*60}" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>`).join('')}
    </svg>`;

    const hash = crypto.createHmac('sha256', secret).update(code).digest('hex');
    
    const res = NextResponse.json({ svg });
    
    // Set cookie with 3 minutes expiration
    res.cookies.set('sg_captcha', hash, { 
        httpOnly: true, 
        path: '/', 
        maxAge: 3 * 60, // 3 minutes
        sameSite: 'lax',
    });
    
    return res;
}
