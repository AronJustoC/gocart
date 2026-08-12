import { NextResponse } from "next/server"

// public, non-secret config — read server-side at request time so it
// reflects whatever env vars the container actually has right now, instead
// of whatever NEXT_PUBLIC_* happened to be set at Docker build time (which,
// on platforms that only inject env vars at container runtime and not into
// the build step, is never)
export async function GET() {
    return NextResponse.json({
        currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$",
        culqiPublicKey: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || "",
    })
}
