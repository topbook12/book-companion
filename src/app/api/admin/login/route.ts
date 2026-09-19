import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyAdminLogin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    // Small delay to slow down brute force attempts.
    await new Promise((res) => setTimeout(res, 350));

    if (!verifyAdminLogin(username, password)) {
      return NextResponse.json(
        { ok: false, error: "ভুল ইউজারনেম বা পাসওয়ার্ড। / Invalid credentials." },
        { status: 401 }
      );
    }

    await createSession(username.toLowerCase());
    return NextResponse.json({ ok: true, username });
  } catch {
    return NextResponse.json(
      { ok: false, error: "সার্ভার সমস্যা। / Server error." },
      { status: 500 }
    );
  }
}
