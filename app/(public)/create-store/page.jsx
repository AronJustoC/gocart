'use client'
import { assets } from "@/assets/assets"
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import { useSession, signIn } from "next-auth/react"
import Loading from "@/components/Loading"

export default function CreateStore() {

    const { data: session, status: sessionStatus } = useSession()

    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        image: ""
    })

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const fetchSellerStatus = async () => {
        const res = await fetch('/api/stores/me')
        const data = await res.json()

        if (data.store) {
            setAlreadySubmitted(true)
            setStatus(data.store.status)
            setMessage(
                data.store.status === 'approved'
                    ? "Your store is approved!"
                    : data.store.status === 'rejected'
                        ? "Your store application was rejected."
                        : "Your store application is pending approval."
            )
        }

        setLoading(false)
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (!storeInfo.image) {
            toast.error("Add a store logo")
            return
        }

        const formData = new FormData()
        formData.append("images", storeInfo.image)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!uploadRes.ok) throw new Error('Logo upload failed')
        const { urls } = await uploadRes.json()

        const res = await fetch('/api/stores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...storeInfo, logo: urls[0] }),
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Failed to submit store')

        setAlreadySubmitted(true)
        setStatus('pending')
        setMessage("Your store application was submitted, pending approval.")
    }

    useEffect(() => {
        if (sessionStatus === 'authenticated') fetchSellerStatus()
        if (sessionStatus === 'unauthenticated') setLoading(false)
    }, [sessionStatus])

    if (loading) return <Loading />

    if (!session) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 text-center px-6">
                <h1 className="text-2xl text-slate-700">Sign in to apply for a store</h1>
                <button
                    onClick={() => signIn('google', { callbackUrl: '/create-store' })}
                    className="bg-slate-800 text-white px-10 py-2.5 rounded hover:bg-slate-900 transition"
                >
                    Sign in with Google
                </button>
            </div>
        )
    }

    return (
        <>
            {!alreadySubmitted ? (
                <div className="mx-6 min-h-[70vh] my-16">
                    <form onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Submitting data..." })} className="max-w-7xl mx-auto flex flex-col items-start gap-3 text-slate-500">
                        {/* Title */}
                        <div>
                            <h1 className="text-3xl ">Add Your <span className="text-slate-800 font-medium">Store</span></h1>
                            <p className="max-w-lg">To become a seller on GoCart, submit your store details for review. Your store will be activated after admin verification.</p>
                        </div>

                        <label className="mt-10 cursor-pointer">
                            Store Logo
                            <Image src={storeInfo.image ? URL.createObjectURL(storeInfo.image) : assets.upload_area} className="rounded-lg mt-2 h-16 w-auto" alt="" width={150} height={100} />
                            <input type="file" accept="image/*" onChange={(e) => setStoreInfo({ ...storeInfo, image: e.target.files[0] })} hidden />
                        </label>

                        <p>Username</p>
                        <input name="username" onChange={onChangeHandler} value={storeInfo.username} type="text" placeholder="Enter your store username" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" required />

                        <p>Name</p>
                        <input name="name" onChange={onChangeHandler} value={storeInfo.name} type="text" placeholder="Enter your store name" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" required />

                        <p>Description</p>
                        <textarea name="description" onChange={onChangeHandler} value={storeInfo.description} rows={5} placeholder="Enter your store description" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none" required />

                        <p>Email</p>
                        <input name="email" onChange={onChangeHandler} value={storeInfo.email} type="email" placeholder="Enter your store email" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" required />

                        <p>Contact Number</p>
                        <input name="contact" onChange={onChangeHandler} value={storeInfo.contact} type="text" placeholder="Enter your store contact number" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" required />

                        <p>Address</p>
                        <textarea name="address" onChange={onChangeHandler} value={storeInfo.address} rows={5} placeholder="Enter your store address" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none" required />

                        <button className="bg-slate-800 text-white px-12 py-2 rounded mt-10 mb-40 active:scale-95 hover:bg-slate-900 transition ">Submit</button>
                    </form>
                </div>
            ) : (
                <div className="min-h-[80vh] flex flex-col items-center justify-center">
                    <p className="sm:text-2xl lg:text-3xl mx-5 font-semibold text-slate-500 text-center max-w-2xl">{message}</p>
                </div>
            )}
        </>
    )
}
