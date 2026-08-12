import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const productInclude = {
    store: { select: { name: true, logo: true, username: true } },
    rating: { include: { user: { select: { name: true, image: true } } } },
}

export async function GET(request) {
    const storeId = request.nextUrl.searchParams.get("storeId")
    const session = await auth()

    // admin sees everything (moderation); everyone else only sees products
    // belonging to an active, approved store — a pending/deactivated store's
    // catalog isn't public yet, even via the unfiltered "all products" fetch
    const where = {
        ...(storeId && { storeId }),
        ...(session?.user?.role !== "ADMIN" && { store: { isActive: true } }),
    }

    const products = await prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
}

export async function POST(request) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { name, description, mrp, price, images, category, storeId: bodyStoreId } = body

    if (!Array.isArray(images) || images.length === 0) {
        return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
    }

    // vendors can only ever create for their own store — never trust the body
    const storeId = session.user.role === "ADMIN" ? bodyStoreId : session.user.storeId
    if (!storeId) return NextResponse.json({ error: "No store to create this product for" }, { status: 403 })

    const product = await prisma.product.create({
        data: { name, description, mrp: Number(mrp), price: Number(price), images, category, storeId },
        include: productInclude,
    })

    return NextResponse.json(product, { status: 201 })
}
