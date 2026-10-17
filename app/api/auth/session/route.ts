import { isValidSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  return NextResponse.json({
    authenticated: isValidSessionToken(token),
  });
}
