'use client'
import Link from 'next/link';
import { deleteCookie } from "@/app/actions/auth"
import { usePathname } from 'next/navigation'
import NavItem from '@/components/navItem'
const Nav = () => {
    const pathname = usePathname()
    return (
        <div className="flex flex-col h-screen bg-black text-center text-white pt-4">
            <Link href={"/"}>
                <div className='flex h-14 items-center justify-center hover:bg-[#2C2C2C] transition-colors'>
                    <p className="text-3xl font-bold ">Administration</p>
                </div>
            </Link>


            <div className='mt-12'>
                <NavItem href={'/usermanage?page=1'}>
                    <img src="/images/Users.png" alt="" className="h-7 w-7" />
                    <p className="text-xl text-white group-hover:text-white transition">จัดการผู้ใช้งาน</p>
                </NavItem>
            </div>

            <NavItem href={'/storemanage?page=1'}>
                <img src="/images/Shopping.png" alt="" className="h-7 w-7" />
                <p className="text-xl">จัดการร้านรับของ</p>
            </NavItem>

            <NavItem href={'/exportimage?page=1'}>
                <img src="/images/export.png" alt="" className="h-7 w-7" />
                <p className="text-xl">ส่งออกรูปภาพ</p>
            </NavItem>


            <NavItem href={'/pointmanage?page=1'}>
                <img src="/images/product.png" alt="" className="h-7 w-7" />
                <p className="text-xl">จัดการสินค้า</p>
            </NavItem>

            <Link
                className='flex flex-row mt-auto h-14 items-center gap-3 justify-center hover:bg-[#2C2C2C] transition-colors cursor-pointer'
                onClick={deleteCookie}
                href={"/auth"}>
                <img src="/images/Logout.png" className="h-7 w-7" alt="" />
                <p className="text-xl">Sign Out</p>
            </Link>

        </div>
    )
}

export default Nav