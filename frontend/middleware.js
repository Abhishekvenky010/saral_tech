import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  // 🔒 Protect home (dashboard)
  if (!token && path === "/") {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // 🔁 Prevent logged-in users from auth pages
  if (token && (path === "/signin" || path === "/signup")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/", "/signin", "/signup"],
};