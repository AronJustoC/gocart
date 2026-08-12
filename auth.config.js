// edge-safe subset: no Prisma adapter, no bcrypt — this is what middleware.js
// runs on the Edge runtime. The full config (auth.js) extends this with the
// adapter and providers, and runs only in the Node runtime (API routes).
export const authConfig = {
    trustHost: true, // required behind any reverse proxy (EasyPanel, Docker) — see errors.authjs.dev#untrustedhost
    pages: {
        signIn: "/admin/login",
    },
    session: { strategy: "jwt" },
    providers: [],
    callbacks: {
        authorized({ auth, request }) {
            const { pathname } = request.nextUrl
            if (pathname === "/admin/login") return true
            if (pathname.startsWith("/admin")) return auth?.user?.role === "ADMIN"
            if (pathname.startsWith("/store")) return Boolean(auth?.user?.storeId)
            return true
        },
        // edge-safe passthrough — the real claim-minting jwt callback (with the
        // Prisma store lookup) lives in auth.js and runs only in the Node
        // runtime. This one just preserves whatever's already in the token.
        jwt({ token }) {
            return token
        },
        session({ session, token }) {
            if (session.user) {
                session.user.role = token.role
                session.user.storeId = token.storeId ?? null
            }
            return session
        },
    },
}
