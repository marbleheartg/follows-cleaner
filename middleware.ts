import { verifySession } from "@/lib/api/utils/verifySession"
import { FRAME, PROJECT_DESCRIPTION, PROJECT_TITLE } from "@/lib/constants"
import { NextRequest, NextResponse } from "next/server"

const { NEXT_PUBLIC_HOST } = process.env
if (!NEXT_PUBLIC_HOST) throw new Error("NextConfigCredentialsNotConfigured")

export const config = {
  matcher: ["/api/:path*", "/path"],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api")) {
    if (["/api/path"].includes(pathname)) return NextResponse.next()

    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return new NextResponse(JSON.stringify({ error: "Unauthorized: No token provided" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      })

    const session = authHeader.split(" ")[1]

    const fid = await verifySession(session)

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("fid", fid.toString())

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  if (pathname.startsWith("/path")) {
    const userAgent = request.headers.get("user-agent")?.toLowerCase() || ""

    if (userAgent.includes("fcbot")) {
      const parsedFrame = JSON.stringify({
        ...FRAME,
        imageUrl: `https://${NEXT_PUBLIC_HOST}/images/og/hero.png`,
      })
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")

      const response = `<html><head><meta charset="UTF-8"><title>${PROJECT_TITLE}</title><meta name="fc:frame" content="${parsedFrame}" /><meta name="description" content="${PROJECT_DESCRIPTION}" /></head><body></body></html>`

      return new Response(response, {
        headers: { "content-type": "text/html" },
      })
    }
  }

  return NextResponse.next()
}
