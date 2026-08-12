import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const productInclude = {
    store: { select: { name: true, logo: true, username: true } },
    rating: { include: { user: { select: { name: true, image: true } } } },
}

async function assertOwnership(id, session) {
    if (!session?.user) return { status: 401, error: "Unauthorized" }

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return { status: 404, error: "Product not found" }

    const owns = session.user.role === "ADMIN" || product.storeId === session.user.storeId
    if (!owns) return { status: 403, error: "Forbidden" }

    return { product }
}

export async function GET(request, { params }) {
    const { id } = await params
    const product = await prisma.product.findUnique({
        where: { id },
        include: { ...productInclude, store: { select: { name: true, logo: true, username: true, isActive: true } } },
    })
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    if (!product.store.isActive) {
        const session = await auth()
        const owns = session?.user?.role === "ADMIN" || product.storeId === session?.user?.storeId
        if (!owns) return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
}

export async function PATCH(request, { params }) {
    const { id } = await params
    const session = await auth()
    const check = await assertOwnership(id, session)
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status })

    const body = await request.json()
    const { name, description, mrp, price, images, category, inStock } = body

    if (images !== undefined && (!Array.isArray(images) || images.length === 0)) {
        return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
    }

    const product = await prisma.product.update({
        where: { id },
        data: {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
            ...(mrp !== undefined && { mrp: Number(mrp) }),
            ...(price !== undefined && { price: Number(price) }),
            ...(images !== undefined && { images }),
            ...(category !== undefined && { category }),
            ...(inStock !== undefined && { inStock }),
        },
        include: productInclude,
    })

    return NextResponse.json(product)
}

export async function DELETE(request, { params }) {
    const { id } = await params
    const session = await auth()
    const check = await assertOwnership(id, session)
    if (check.error) return NextResponse.json({ error: check.error }, { status: check.status })

    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
}
