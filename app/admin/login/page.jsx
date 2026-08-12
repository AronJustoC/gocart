'use client'
import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { toast } from "react-hot-toast"

const AdminLoginForm = () => {

    const searchParams = useSearchParams()
    const requestedCallback = searchParams.get("callbackUrl")
    // only ever navigate to a same-origin relative path — a raw external
    // callbackUrl would be an open redirect straight out of a login form
    const callbackUrl = requestedCallback?.startsWith("/") && !requestedCallback.startsWith("//")
        ? requestedCallback
        : "/admin"

    const [credentials, setCredentials] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const result = await signIn("credentials", {
            ...credentials,
            redirect: false,
        })

        setLoading(false)

        if (result?.error) {
            toast.error("Invalid email or password")
            return
        }

        window.location.href = callbackUrl
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="flex flex-col gap-5 text-slate-700 w-full max-w-sm">
                <h1 className="text-3xl text-center">
                    <span className="text-green-600">go</span>cart<span className="text-green-600 text-4xl leading-0">.</span>
                    <span className="block text-base text-slate-500 mt-1">Admin Login</span>
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        name="email"
                        onChange={handleChange}
                        value={credentials.email}
                        className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
                        type="email"
                        placeholder="Email address"
                        required
                    />
                    <input
                        name="password"
                        onChange={handleChange}
                        value={credentials.password}
                        className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
                        type="password"
                        placeholder="Password"
                        required
                    />
                    <button
                        disabled={loading}
                        className="bg-slate-800 text-white text-sm font-medium py-2.5 rounded-md hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "SIGN IN"}
                    </button>
                </form>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="flex-1 h-px bg-slate-200" />
                    OR
                    <div className="flex-1 h-px bg-slate-200" />
                </div>

                <button
                    onClick={() => signIn("google", { callbackUrl })}
                    className="border border-slate-200 text-slate-700 text-sm font-medium py-2.5 rounded-md hover:bg-slate-50 active:scale-95 transition-all"
                >
                    Sign in with Google
                </button>
            </div>
        </div>
    )
}

const AdminLoginPage = () => (
    <Suspense>
        <AdminLoginForm />
    </Suspense>
)

export default AdminLoginPage
