import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, authenticated: false });
  }
  return NextResponse.json({ ok: true, authenticated: true, username: session.username });
}
