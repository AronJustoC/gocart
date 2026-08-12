import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await auth()
    const storeId = session?.user?.storeId
    if (!storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [totalProducts, totalOrders, revenue, ratings] = await Promise.all([
        prisma.product.count({ where: { storeId } }),
        prisma.order.count({ where: { storeId } }),
        prisma.order.aggregate({ where: { storeId }, _sum: { total: true } }),
        prisma.rating.findMany({
            where: { product: { storeId } },
            include: {
                user: { select: { name: true, image: true } },
                product: { select: { id: true, name: true, category: true } },
            },
            orderBy: { createdAt: "desc" },
        }),
    ])

    return NextResponse.json({
        totalProducts,
        totalOrders,
        totalEarnings: revenue._sum.total ?? 0,
        ratings,
    })
}
