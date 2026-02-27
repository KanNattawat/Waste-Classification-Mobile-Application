'use client'
import { useForm } from "react-hook-form";
import {loginAction} from "@/app/actions/auth"
import { useRouter } from 'next/navigation';
import Image from 'next/image';
type Login = {
    User_name: string,
    User_password: string
}


const page = () => {
    const {
        register,
        handleSubmit,
        formState,
    } = useForm<Login>();

    const router = useRouter();
    const { errors } = formState

    const doSubmit = async (data: any) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
                {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                }
            )
            const result = await res.json();
            const token = result.token
            await loginAction(token)
            router.push('/')

        } catch (error) {
            console.log(error)
        }

    }

    return (
        <div>
            <div className="flex justify-center items-center bg-linear-to-r from-[#41BFAA] to-[#1E8B79] w-full h-screen min-h-screen">
                <div className="flex flex-col justify-center items-center bg-white w-full max-w-2xl h-[55%] rounded-xl shadow-xl">
                    <p className="text-4xl font-bold mt-12">Administration Page</p>
                    <form onSubmit={handleSubmit(doSubmit)}
                        className="flex items-center w-full h-full">
                        <div className="flex flex-col w-full items-center">
                            <div className="w-full max-w-md mb-6">
                                <div className="flex items-center h-12 bg-white border border-black rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#7CD4C5]">
                                    <div className="px-4 border-r border-gray-200">
                                        <Image src="/images/User.png"  width={24} height={24} alt="" className="object-contain" />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full h-full pl-2 text-black bg-transparent outline-none text-xl"
                                        placeholder="Username"
                                        {...register("User_name", { required: "กรุณากรอก username" })}
                                    />
                                </div>
                                {errors.User_name && <p className="text-red-500 text-sm mt-1 absolute">{errors.User_name.message}</p>}
                            </div>


                            <div className="w-full max-w-md mb-10 mt-4">
                                <div className="flex items-center h-12 bg-white border border-black rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#7CD4C5]">
                                    <div className="px-4 border-r border-gray-200">
                                        <Image src="/images/Lock.png"  width={24} height={24} alt="" className="object-contain" />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full h-full pl-2 text-black bg-transparent outline-none text-xl"
                                        placeholder="Password"
                                        {...register("User_password", { required: "กรุณากรอก password" })}
                                    />
                                </div>
                                {errors.User_password && <p className="text-red-500 text-sm mt-1 absolute">{errors.User_password.message}</p>}
                            </div>

                            <div className="w-full max-w-md flex justify-center">
                                <button
                                    type="submit"
                                    className="w-full h-14 bg-linear-to-r from-[#41BFAA] to-[#1E8B79] text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all active:scale-95 cursor-pointer"
                                >
                                    Login
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default page