import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    callbacks: {
        ...authConfig.callbacks,
        // overrides the edge-safe passthrough — only this Node-runtime instance
        // does the Prisma lookup, at sign-in time (`user` is only set then)
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                const store = await prisma.store.findUnique({ where: { userId: user.id } })
                token.storeId = store?.isActive ? store.id : null
            }
            return token
        },
    },
    providers: [
        Google,
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                })

                // only ADMIN accounts get a password — this login is admin-only,
                // regular users authenticate via Google
                if (!user?.password || user.role !== "ADMIN") return null

                const isValid = await bcrypt.compare(credentials.password, user.password)
                if (!isValid) return null

                return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role }
            },
        }),
    ],
})
