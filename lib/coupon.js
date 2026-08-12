import { prisma } from "@/lib/prisma"

// forMember coupons are treated as public: no membership concept exists yet,
// add the check here when membership ships
export async function validateCoupon(code, userId) {
    const coupon = await prisma.coupon.findUnique({ where: { code } })
    if (!coupon) return { error: "Coupon not found" }

    if (coupon.expiresAt < new Date()) return { error: "Coupon has expired" }

    if (coupon.forNewUser) {
        const orderCount = await prisma.order.count({ where: { userId } })
        if (orderCount > 0) return { error: "Coupon is for new users only" }
    }

    return { coupon }
}
