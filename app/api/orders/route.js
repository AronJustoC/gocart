import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { validateCoupon } from "@/lib/coupon"

const orderInclude = {
    orderItems: { include: { product: true } },
    address: true,
}

export async function GET() {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const orders = await prisma.order.findMany({
        where: { userId: session.user.id },
        include: orderInclude,
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
}

export async function POST(request) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { addressId, items, couponCode } = body

    if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    const address = await prisma.address.findUnique({ where: { id: addressId } })
    if (!address || address.userId !== session.user.id) {
        return NextResponse.json({ error: "Invalid address" }, { status: 400 })
    }

    const productIds = items.map((item) => item.productId)
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { store: true },
    })

    if (products.length !== productIds.length) {
        return NextResponse.json({ error: "One or more products no longer exist" }, { status: 400 })
    }
    for (const product of products) {
        if (!product.inStock) return NextResponse.json({ error: `${product.name} is out of stock` }, { status: 400 })
        if (!product.store.isActive) return NextResponse.json({ error: `${product.name} is no longer available` }, { status: 400 })
    }

    let coupon = null
    if (couponCode) {
        const result = await validateCoupon(couponCode, session.user.id)
        if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
        coupon = result.coupon
    }

    // group cart items by store — every Order belongs to exactly one store,
    // so a multi-vendor cart becomes one Order per store
    const groups = new Map()
    for (const item of items) {
        const product = products.find((p) => p.id === item.productId)
        const quantity = Number(item.quantity) || 1
        if (!groups.has(product.storeId)) groups.set(product.storeId, [])
        groups.get(product.storeId).push({ product, quantity })
    }

    const orders = await prisma.$transaction(async (tx) => {
        const created = []
        for (const [storeId, groupItems] of groups) {
            const subtotal = groupItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
            // percentage discount applied per-group is already proportional to the whole cart
            const rawTotal = coupon ? subtotal * (1 - coupon.discount / 100) : subtotal
            const total = Math.round(rawTotal * 100) / 100

            const order = await tx.order.create({
                data: {
                    userId: session.user.id,
                    storeId,
                    addressId,
                    total,
                    paymentMethod: "COD",
                    isPaid: false,
                    status: "ORDER_PLACED",
                    isCouponUsed: Boolean(coupon),
                    coupon: coupon ? { code: coupon.code, discount: coupon.discount } : {},
                    orderItems: {
                        create: groupItems.map(({ product, quantity }) => ({
                            productId: product.id,
                            quantity,
                            price: product.price,
                        })),
                    },
                },
                include: orderInclude,
            })
            created.push(order)
        }
        return created
    })

    return NextResponse.json(orders, { status: 201 })
}
