import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  if (path.startsWith("/dashboard") || path.startsWith("/admin") || path.startsWith("/manager")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const userRole = session.user.user_metadata?.role

    if (path.startsWith("/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (path.startsWith("/manager") && userRole !== "project_manager") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  if (path === "/login" && session) {
    const userRole = session.user.user_metadata?.role
    const dashboardPath = userRole === "admin" ? "/admin" : userRole === "project_manager" ? "/manager" : "/dashboard"
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/manager/:path*", "/login"],
}
