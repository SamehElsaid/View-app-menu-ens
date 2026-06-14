import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
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
