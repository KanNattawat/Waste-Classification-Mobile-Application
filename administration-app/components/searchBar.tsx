'use client'
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {useState} from 'react'
const Searchbar = () => {
    const router = useRouter()
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [value, setValue] = useState(String);

    const submitHandler = () =>{
        const sp = new URLSearchParams(searchParams.toString())
        sp.set('username', value)
        sp.set('page', "1")
        router.push(`${pathname}?${sp}`)
    }

    return (
        <div className="flex w-full">
            <div className="flex flex-row items-center justify-between w-full max-w-85  bg-white rounded-md mb-3 mt-6 shadow-md">
                <div className="relative p-2 rounded-md w-full max-w-60 ml-2">
                    <img src="/images/Search.png" className="absolute top-4 left-4" alt="" />
                    <input type="text" placeholder="กรอก username" value={value} onChange={(e)=>{
                        setValue(e.target.value)
                        console.log(value)
                    }}
                        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-10 pr-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" />
                </div>
                <button 
                onClick={submitHandler}
                className="px-4 py-1.5 mr-2 bg-black text-white rounded-md hover:bg-[#2C2C2C] transition cursor-pointer">
                    ค้นหา
                </button>
            </div>
        </div>
    )
}

export default Searchbar