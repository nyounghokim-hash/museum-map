export { default } from "next-auth/middleware"

export const config = {
    matcher: [
        "/collections/new",
        "/collections/edit/:path*",
        "/saved/:path*",
        "/plans/:path*",
        "/admin/:path*"
    ],
}
