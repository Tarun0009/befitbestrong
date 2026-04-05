import { NextResponse } from "next/server";

// Simple newsletter subscription endpoint.
// In production, wire this to Mailchimp / Klaviyo / SendGrid.
export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  // TODO: persist to newsletter_subscribers table or forward to ESP
  console.info("[newsletter] new subscriber:", email);
  return NextResponse.json({ ok: true });
}
