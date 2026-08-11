'use client'
import { usePathname } from "next/navigation"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"

// real gating happens in middleware.js before this ever renders — this
// component only decides presentation (skip the admin chrome on the login page)
const AdminLayout = ({ children }) => {

    const pathname = usePathname()

    if (pathname === "/admin/login") return children

    return (
        <div className="flex flex-col h-screen">
            <AdminNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <AdminSidebar />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default AdminLayout