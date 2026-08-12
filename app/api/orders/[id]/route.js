import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request, { params }) {
    const { id } = await params
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    const owns = session.user.role === "ADMIN" || order.storeId === session.user.storeId
    if (!owns) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { status } = await request.json()

    const updated = await prisma.order.update({
        where: { id },
        data: { status },
    })

    return NextResponse.json(updated)
}
