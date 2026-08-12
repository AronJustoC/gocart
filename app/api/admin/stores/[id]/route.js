import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request, { params }) {
    const { id } = await params
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    const { status, isActive } = body

    const store = await prisma.store.update({
        where: { id },
        data: {
            ...(status !== undefined && { status, isActive: status === "approved" }),
            ...(isActive !== undefined && status === undefined && { isActive }),
        },
    })

    return NextResponse.json(store)
}
