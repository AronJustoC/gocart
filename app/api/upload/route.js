import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { uploadImage } from "@/lib/cloudinary"

export async function POST(request) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await request.formData()
    const files = formData.getAll("images")

    if (files.length === 0) {
        return NextResponse.json({ error: "No images provided" }, { status: 400 })
    }

    const urls = await Promise.all(
        files.map(async (file) => {
            const buffer = Buffer.from(await file.arrayBuffer())
            const result = await uploadImage(buffer)
            return result.secure_url
        })
    )

    return NextResponse.json({ urls })
}
