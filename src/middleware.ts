import { withAuth } from "next-auth/middleware"

export default withAuth({
    pages: {
        signIn: '/login',
    },
})

export const config = {
    matcher: [
        "/collections/new",
        "/collections/edit/:path*",
        "/saved/:path*",
        "/plans/:path*"
    ],
}
