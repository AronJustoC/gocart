'use client'
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"

// real gating happens in middleware.js before this ever renders — storeInfo
// comes from a server-side fetch in app/store/layout.jsx
const StoreLayout = ({ children, storeInfo }) => {

    return (
        <div className="flex flex-col h-screen">
            <SellerNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <SellerSidebar storeInfo={storeInfo} />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default StoreLayout