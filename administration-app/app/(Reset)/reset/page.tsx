'use client'
import { useForm } from "react-hook-form";
import { loginAction } from "@/app/actions/auth"
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { use, useState } from 'react'
type ResetPassword = {
    Password: string,
    ConfirmPassword: string
}

type SearchParams = {
    searchParams: Promise<{ token: string }>;
}
const page = ({ searchParams }: SearchParams) => {
    const {
        register,
        handleSubmit,
        formState,
        setError
    } = useForm<ResetPassword>();
    const { token } = use(searchParams);
    const { errors } = formState
    const [isOpen, setIsOpen] = useState(false);

    const doSubmit = async (data: any) => {
        try {
            const { Password, ConfirmPassword } = data
            if (Password != ConfirmPassword) {
                setError("root", { message: "Password และ ConfirmPassword ไม่ตรงกัน" });
            }
            if (Password.trim().length < 8) {
                setError("root", { message: "Password ต้องมีความยาวอย่างน้อย 8 หลัก" });

            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgotpassword`,
                {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ Password: Password, token: token })
                }
            )
            if(res.ok){
                setIsOpen(true)
            }
            console.log(res.status)
        } catch (error) {
            console.log(error)
        }

    }

    return (
        <div>
            <div className="flex justify-center items-center bg-linear-to-r from-[#41BFAA] to-[#1E8B79] w-full h-screen min-h-screen">
                <div className="flex flex-col justify-center items-center bg-white w-full max-w-2xl h-[55%] rounded-xl shadow-xl">
                    <p className="text-4xl font-bold mt-12">Reset Password</p>
                    <form onSubmit={handleSubmit(doSubmit)}
                        className="flex items-center w-full h-full">
                        <div className="flex flex-col w-full items-center">
                            <div className="w-full max-w-md mb-6">
                                <div className="flex items-center h-12 bg-white border border-black rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#7CD4C5]">
                                    <div className="px-4 border-r border-gray-200">
                                        <Image src="/images/Lock.png" width={24} height={24} alt="" className="object-contain" />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full h-full pl-2 text-black bg-transparent outline-none text-xl"
                                        placeholder="Password"
                                        {...register("Password", { required: "กรุณากรอก password" })}
                                    />
                                </div>
                                {errors.Password && <p className="text-red-500 text-sm mt-1 absolute">{errors.Password.message}</p>}
                            </div>


                            <div className="w-full max-w-md mb-10 mt-4">
                                <div className="flex items-center h-12 bg-white border border-black rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#7CD4C5]">
                                    <div className="px-4 border-r border-gray-200">
                                        <Image src="/images/Lock.png" width={24} height={24} alt="" className="object-contain" />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full h-full pl-2 text-black bg-transparent outline-none text-xl"
                                        placeholder="ConfirmPassword"
                                        {...register("ConfirmPassword", { required: "กรุณากรอก Confirm password" })}
                                    />
                                </div>
                                {errors.ConfirmPassword && <p className="text-red-500 text-sm mt-1 absolute">{errors.ConfirmPassword.message}</p>}
                            </div>

                            <div className="flex flex-row h-6 mt-4 justify-center">
                                {errors.root && (
                                    <p className="text-red-500 text-center mb-4">{errors.root.message}</p>
                                )}
                            </div>


                            <div className="w-full max-w-md flex justify-center">
                                <button
                                    type="submit"
                                    className="w-full h-14 bg-linear-to-r from-[#41BFAA] to-[#1E8B79] text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all active:scale-95 cursor-pointer"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>

                    </form>

                    {
                        isOpen && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                                <img src="/images/x.png" alt="" className="absolute z-49 top-83 right-145 w-6 h-6 hover:cursor-pointer" onClick={() => {
                                    setIsOpen(false)
                                }} />
                                <div className="grid grid-rows-2 bg-[#FFFFFF] rounded-lg shadow-lg  w-100 h-50 text-center relative">
                                    <p className="text-xl mt-16">รีเซ็ทรหัสผ่านเรียบร้อย</p>
                                    <button
                                        onClick={()=>setIsOpen(false)}
                                        className="bg-[#1E8B79] text-white text-xl rounded-md px-1 py-1 mx-32 my-6 hover:disabled:opacity-50 cursor-pointer transition">
                                        ยืนยัน</button>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default page