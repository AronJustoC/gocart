import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const addresses = await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(addresses)
}

export async function POST(request) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { name, email, street, city, state, zip, country, phone } = body

    const address = await prisma.address.create({
        data: { userId: session.user.id, name, email, street, city, state, zip, country, phone },
    })

    return NextResponse.json(address, { status: 201 })
}
