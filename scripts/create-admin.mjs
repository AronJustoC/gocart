import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const [, , email, password] = process.argv

if (!email || !password) {
    console.error("Usage: node scripts/create-admin.mjs <email> <password>")
    process.exit(1)
}

const hashed = await bcrypt.hash(password, 10)

const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, role: "ADMIN" },
    create: { email, password: hashed, role: "ADMIN", name: "Admin" },
})

console.log(`Admin ready: ${user.email}`)
await prisma.$disconnect()
