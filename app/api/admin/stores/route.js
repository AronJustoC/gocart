import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const status = request.nextUrl.searchParams.get("status")

    const stores = await prisma.store.findMany({
        where: status ? { status } : undefined,
        include: { user: { select: { name: true, email: true, image: true } } },
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(stores)
}
