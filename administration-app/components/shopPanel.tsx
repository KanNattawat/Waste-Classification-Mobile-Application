'use client'
import { useState } from 'react'
import Table from "@/components/shopTable";
import { useRouter } from 'next/navigation';

type User = {
    Full_name: string;
}

type RecycleShop = {
    Shop_ID: string;
    Shop_name: string;
    Tel_num: string;
    Location: number[];
    Accepted_cate: string[];
    Status: boolean;
    user: User;
}
const shopPanel = ({ shopData }: { shopData: [RecycleShop] }) => {
    const [open, setIsOpen] = useState(false)
    const [selectedShop, setSelectedShop] = useState<number | undefined>(undefined)
    const router = useRouter();

    const approve = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/manage/approveShop`, {
            method: "PUT",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                shopId: selectedShop
            })
        })
        setIsOpen(false)
        router.push('/storemanage')
    }

    const handleConfirm = (id: number) => {
        setSelectedShop(id);
        setIsOpen(true);
    };

    return (
        <div className=" w-full max-w-300 bg-white">
            <Table shopData={shopData} handleConfirm={handleConfirm} />

            {open && (<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <img src="/images/x.png" alt="" className="absolute z-49 top-83 right-145 w-6 h-6 hover:cursor-pointer" onClick={() => {
                    setIsOpen(false)
                }} />
                <div className="grid grid-rows-2 bg-[#FFFFFF] rounded-lg shadow-lg  w-100 h-50 text-center relative">
                    <p className="text-xl mt-16">ยืนยันร้านรับของ</p>
                    <button
                        onClick={() => { approve() }}
                        className="bg-[#1E8B79] text-white text-xl rounded-md px-1 py-1 mx-32 my-6 hover: disabled:opacity-50 cursor-pointer transition">
                        ยืนยัน
                    </button>
                </div>
            </div>)}
        </div>
    )
}

export default shopPanel