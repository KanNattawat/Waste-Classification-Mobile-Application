import Link from 'next/link';

const Nav = () => {
    return (
        <div className="flex flex-col h-screen bg-black text-center text-white pt-4">
            <Link href={"/"}>
                <div className='flex h-14 items-center justify-center hover:bg-[#2C2C2C] transition-colors'>
                    <p className="text-3xl font-bold ">Administration</p>
                </div>

            </Link>

            <Link href={"/usermanage"}>
                <div className="group relative flex flex-row items-center justify-start pl-6 mt-12 gap-3 h-14 hover:bg-[#2C2C2C] transition cursor-pointer">
                    <div className='absolute left-0 w-1 h-8 bg-transparent group-hover:bg-[#1E8B79] transition-all rounded-r-lg'>
                    </div>

                    <img src="/images/Users.png" alt="" className="h-7 w-7" />
                    <p className="text-xl text-white group-hover:text-white transition">จัดการผู้ใช้งาน</p>
                </div>
            </Link>

            <Link href={"/storemanage"}>
                <div className="group relative flex flex-row items-center justify-start gap-3 pl-6 h-14 hover:bg-[#2C2C2C] transition cursor-pointer">
                    <div className='absolute left-0 w-1 h-8 bg-transparent group-hover:bg-[#1E8B79] transition-all rounded-r-lg'>

                    </div>
                    <img src="/images/Shopping.png" alt="" className="h-7 w-7" />
                    <p className="text-xl">จัดการร้านรับของ</p>
                </div>

            </Link>
            <div className="flex flex-row mt-auto h-14 items-center gap-3 justify-center hover:bg-[#2C2C2C] transition-colors cursor-pointer">
                <img src="/images/Logout.png" className="h-7 w-7" alt="" />
                <p className="text-xl">Sign Out</p>
            </div>

        </div>
    )
}

export default Nav