import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/obat", "/kasir", "/laporan", "/supplier", "/users"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.has("session");
  if (!hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
