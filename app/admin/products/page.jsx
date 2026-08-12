'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { Trash2Icon } from "lucide-react"
import Loading from "@/components/Loading"

export default function AdminProducts() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])

    const fetchProducts = async () => {
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data)
        setLoading(false)
    }

    const toggleStock = async (product) => {
        const res = await fetch(`/api/products/${product.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inStock: !product.inStock }),
        })
        if (!res.ok) throw new Error('Failed to update stock')
        fetchProducts()
    }

    const deleteProduct = async (productId) => {
        const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete product')
        fetchProducts()
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5">All <span className="text-slate-800 font-medium">Products</span></h1>
            <table className="w-full max-w-4xl text-left ring ring-slate-200 rounded overflow-hidden text-sm">
                <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 hidden md:table-cell">Store</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">In Stock</th>
                        <th className="px-4 py-3">Delete</th>
                    </tr>
                </thead>
                <tbody className="text-slate-700">
                    {products.map((product) => (
                        <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="flex gap-2 items-center">
                                    <Image width={40} height={40} className="p-1 shadow rounded" src={product.images[0]} alt="" />
                                    {product.name}
                                </div>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell text-slate-600">{product.store?.name}</td>
                            <td className="px-4 py-3">{currency} {product.price.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                                <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                                    <input type="checkbox" className="sr-only peer" onChange={() => toast.promise(toggleStock(product), { loading: "Updating..." })} checked={product.inStock} readOnly />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                </label>
                            </td>
                            <td className="px-4 py-3">
                                <Trash2Icon onClick={() => toast.promise(deleteProduct(product.id), { loading: "Deleting..." })} className="w-5 h-5 text-red-500 hover:text-red-800 cursor-pointer" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}
