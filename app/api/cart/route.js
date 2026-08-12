import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { cart: true } })
    return NextResponse.json({ cart: user?.cart ?? {} })
}

export async function PATCH(request) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { cart } = await request.json()
    await prisma.user.update({ where: { id: session.user.id }, data: { cart: cart ?? {} } })

    return NextResponse.json({ success: true })
}
