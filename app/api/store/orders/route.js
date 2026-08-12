import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await auth()
    const storeId = session?.user?.storeId
    if (!storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const orders = await prisma.order.findMany({
        where: { storeId },
        include: {
            orderItems: { include: { product: true } },
            address: true,
            user: { select: { name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
}
