import { NextRequest, NextResponse } from "next/server";

// In-memory store: resets per edge instance (suitable for dev/staging)
const requestMap = new Map<string, { count: number; resetAt: number }>();

const LIMIT = 60;
const WINDOW_MS = 60_000;

function getRateLimitResult(ip: string): boolean {
  const now = Date.now();
  const entry = requestMap.get(ip);

  if (!entry || now > entry.resetAt) {
    requestMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true; // allowed
  }

  if (entry.count >= LIMIT) {
    return false; // rate limited
  }

  entry.count += 1;
  return true; // allowed
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply rate limiting to /api/ routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Skip rate limiting for NextAuth routes
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const allowed = getRateLimitResult(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
