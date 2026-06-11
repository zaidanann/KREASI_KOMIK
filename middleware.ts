import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const path = nextUrl.pathname;

  // Route super-admin — hanya SUPER_ADMIN
  if (path.startsWith("/super-admin")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (role !== "SUPER_ADMIN") return NextResponse.redirect(new URL("/", nextUrl));
    return NextResponse.next();
  }

  // Route admin — ADMIN atau SUPER_ADMIN
  if (path.startsWith("/admin")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (role !== "ADMIN" && role !== "SUPER_ADMIN")
      return NextResponse.redirect(new URL("/", nextUrl));
    return NextResponse.next();
  }

  // Route yang butuh login
  const protectedPaths = ["/bookmarks", "/notifications", "/create", "/chat", "/settings"];
  if (protectedPaths.some((p) => path.startsWith(p))) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    return NextResponse.next();
  }

  // Route auth (login/register) — redirect ke home kalau sudah login
  const authPaths = ["/login", "/register"];
  if (authPaths.includes(path) && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)"],
};
