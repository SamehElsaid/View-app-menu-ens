import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  const token = request.cookies.get("sub");


  // Stop Login , Register , Forgot Password , Reset Password , Verify Email , Verify Phone
  if (url.pathname.startsWith("/auth")) {
    if (token) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  if (url.pathname.startsWith("/dashboard")) {
    if (!token) {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  const intlResponse = createMiddleware(routing)(request);
  const forwardQuery = request.nextUrl.searchParams.toString();
  if (forwardQuery) {
    intlResponse.headers.set("x-menu-forward-query", forwardQuery);
  }
  if (request.nextUrl.searchParams.get("src") === "qr") {
    intlResponse.headers.set("x-menu-entry-src", "qr");
  }
  return intlResponse;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
