// edge-safe subset: no Prisma adapter, no bcrypt — this is what middleware.js
// runs on the Edge runtime. The full config (auth.js) extends this with the
// adapter and providers, and runs only in the Node runtime (API routes).
export const authConfig = {
    pages: {
        signIn: "/admin/login",
    },
    session: { strategy: "jwt" },
    providers: [],
    callbacks: {
        authorized({ auth, request }) {
            if (request.nextUrl.pathname === "/admin/login") return true
            return auth?.user?.role === "ADMIN"
        },
        jwt({ token, user }) {
            if (user) token.role = user.role
            return token
        },
        session({ session, token }) {
            if (session.user) session.user.role = token.role
            return session
        },
    },
}
