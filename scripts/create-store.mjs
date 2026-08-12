import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const [, , userEmail, name, username] = process.argv

if (!userEmail || !name || !username) {
    console.error("Usage: node scripts/create-store.mjs <userEmail> <storeName> <storeUsername>")
    console.error("Note: the user must already exist (log in once via Google first).")
    process.exit(1)
}

const user = await prisma.user.findUnique({ where: { email: userEmail } })
if (!user) {
    console.error(`No user found with email ${userEmail} — log in once via Google first.`)
    process.exit(1)
}

const store = await prisma.store.upsert({
    where: { userId: user.id },
    update: { name, username, status: "approved", isActive: true },
    create: {
        userId: user.id,
        name,
        username,
        description: `${name} — seeded test store`,
        address: "N/A",
        email: userEmail,
        contact: "N/A",
        logo: "https://placehold.co/200x200",
        status: "approved",
        isActive: true,
    },
})

console.log(`Store ready: ${store.name} (${store.username}), owner ${userEmail}`)
await prisma.$disconnect()
