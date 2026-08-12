import StoreLayout from "@/components/store/StoreLayout";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
    title: "GoCart. - Store Dashboard",
    description: "GoCart. - Store Dashboard",
};

export default async function RootAdminLayout({ children }) {

    const session = await auth()
    const storeInfo = session?.user?.storeId
        ? await prisma.store.findUnique({ where: { id: session.user.storeId } })
        : null

    return (
        <>
            <StoreLayout storeInfo={storeInfo}>
                {children}
            </StoreLayout>
        </>
    );
}
