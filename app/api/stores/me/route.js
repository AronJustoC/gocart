import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const store = await prisma.store.findUnique({ where: { userId: session.user.id } })
    return NextResponse.json({ store })
}
