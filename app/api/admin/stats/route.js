import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const [products, stores, orders] = await Promise.all([
        prisma.product.count(),
        prisma.store.count({ where: { isActive: true } }),
        prisma.order.count(),
    ])

    const revenue = await prisma.order.aggregate({ _sum: { total: true } })
    const allOrders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 50 })

    return NextResponse.json({
        products,
        stores,
        orders,
        revenue: revenue._sum.total ?? 0,
        allOrders,
    })
}
