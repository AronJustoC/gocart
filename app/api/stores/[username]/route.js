import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
    const { username } = await params

    const store = await prisma.store.findUnique({
        where: { username },
        include: { Product: { include: { rating: true } } },
    })

    // a pending/deactivated store isn't public yet, even by direct link
    if (!store || !store.isActive) return NextResponse.json({ error: "Store not found" }, { status: 404 })

    return NextResponse.json(store)
}
