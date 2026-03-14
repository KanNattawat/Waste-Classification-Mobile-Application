import React from 'react'
import Link from 'next/link';
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

const Accepted_categories = { '1': 'กระดาษ', '2': 'พลาสติก', '3': 'โลหะ', '4': 'แก้ว', '5': 'e-waste', '6': 'อื่นๆ' }

const shopTable = ({ shopData, handleConfirm }:
    {
        shopData: [RecycleShop],
        handleConfirm: (id:number)=>void,
    }) => {
    return (
        <div className="relative w-full max-h-[80vh] overflow-auto bg-white shadow-xl rounded-md border border-slate-200">
            <table className="w-full text-left table-auto min-w-max text-slate-800">
                <thead>
                    <tr className="text-slate-500 border-b border-slate-300 bg-slate-50 sticky top-0 z-10">
                        <th className="p-4 text-sm font-normal">เจ้าของ</th>
                        <th className="p-4 text-sm font-normal">ชื่อร้าน</th>
                        <th className="p-4 text-sm font-normal">หมายเลขโทรศัพท์</th>
                        <th className="p-4 text-sm font-normal">ที่อยู่</th>
                        <th className="p-4 text-sm font-normal">ประเภทขยะที่รับ</th>
                        <th className="p-4 text-sm font-normal"></th>
                    </tr>
                </thead>

                <tbody>
                    {shopData.map((item: RecycleShop, index: number) => (
                        <tr key={index} className="hover:bg-slate-50 border-b border-slate-100 last:border-none">
                            <td className="p-4">
                                <p className="text-sm">{item.user.Full_name}</p>
                            </td>
                            <td className="p-4">
                                <p className="text-sm">{item.Shop_name}</p>
                            </td>
                            <td className="p-4">
                                <p className="text-sm">{item.Tel_num}</p>
                            </td>
                            <td className="p-4">
                                <p className="text-sm">{item.Location[0]}, {item.Location[1]}</p>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                    {item.Accepted_cate.map((item, index) => (
                                        <p className='bg-slate-200 text-black rounded-lg text-xs px-2 py-1' key={index}>{Accepted_categories[item as keyof typeof Accepted_categories]}</p>
                                    ))}
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <button onClick={() => {
                                    handleConfirm(Number(item.Shop_ID))}}
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:cursor-pointer">
                                    ยืนยันร้าน
                                </button>
                            </td>
                        </tr>
                    ))}

                </tbody>
            </table>
        </div>
    )
}

export default shopTable