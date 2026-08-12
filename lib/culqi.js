// amount must already be in céntimos (integer, no decimals) — callers convert
export async function createCharge({ amount, email, sourceId }) {
    const res = await fetch("https://api.culqi.com/v2/charges", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CULQI_SECRET_KEY}`,
        },
        body: JSON.stringify({
            amount: String(amount),
            currency_code: "PEN",
            email,
            source_id: sourceId,
        }),
    })

    const data = await res.json()

    // a declined card is an expected outcome, not a thrown error — Culqi
    // responds with a 4xx + {user_message} in that case
    if (!res.ok) {
        console.error("[culqi] charge failed:", res.status, JSON.stringify(data))
        return { success: false, error: data.user_message || data.merchant_message || "Payment failed" }
    }

    return { success: true, charge: data }
}

// used to undo a successful charge when order-creation fails right after —
// the charge and the order must not exist independently of each other
export async function refundCharge({ chargeId, amount, reason }) {
    const res = await fetch("https://api.culqi.com/v2/refunds", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CULQI_SECRET_KEY}`,
        },
        body: JSON.stringify({ charge_id: chargeId, amount, reason }),
    })

    const data = await res.json()
    if (!res.ok) return { success: false, error: data.user_message || data.merchant_message || "Refund failed" }
    return { success: true, refund: data }
}
