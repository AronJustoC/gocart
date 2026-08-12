import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

// separate, edge-safe NextAuth instance — decodes the JWT and runs the
// `authorized` callback only. Never touches Prisma or bcrypt.
export const { auth: middleware } = NextAuth(authConfig)

export const config = {
    matcher: ["/admin/:path*", "/store/:path*"],
}
