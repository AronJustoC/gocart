import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const existing = await prisma.store.findUnique({ where: { userId: session.user.id } })
    if (existing) return NextResponse.json({ error: "You already applied for a store", store: existing }, { status: 409 })

    const body = await request.json()
    const { name, username, description, email, contact, address, logo } = body

    if (!logo) return NextResponse.json({ error: "Store logo is required" }, { status: 400 })

    try {
        const store = await prisma.store.create({
            data: { userId: session.user.id, name, username, description, email, contact, address, logo },
        })
        return NextResponse.json(store, { status: 201 })
    } catch (err) {
        if (err.code === "P2002") return NextResponse.json({ error: "That store username is already taken" }, { status: 409 })
        throw err
    }
}
