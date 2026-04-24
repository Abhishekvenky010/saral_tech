import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  // 🔒 Protect dashboard
  if (!token && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // 🔁 Prevent logged-in users from auth pages
  if (token && (path === "/signin" || path === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup"],
};