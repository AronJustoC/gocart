import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { validateCoupon } from "@/lib/coupon"

export async function POST(request) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { code } = await request.json()
    if (!code) return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })

    const { coupon, error } = await validateCoupon(code, session.user.id)
    if (error) return NextResponse.json({ error }, { status: 400 })

    return NextResponse.json({ code: coupon.code, discount: coupon.discount, description: coupon.description })
}
