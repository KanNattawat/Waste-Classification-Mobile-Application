'use client'
import { use, useState } from "react"
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
type Props = {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ full_name: string, email: string }>
}


const page = ({ params, searchParams }: Props) => {
    const { id } = use(params);
    const { full_name, email } = use(searchParams);
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState(false);

    const router = useRouter();
    const user = {
        userName: id,
        email: email,
        fullName: full_name
    }
    const {
        register,
        handleSubmit,
        formState,
    } = useForm({
        defaultValues: user
    });
    const { errors } = formState
    const doSubmit = async (data: any) => {
        try {
            const req = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/edituser`, {
                method: "POST",
                credentials:'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    identify: id
                })
            })
            if (req.ok) {
                setStatus(true)
                setTimeout(() => {
                    router.push('/usermanage?page=1')
                }, 2000)
            }
        } catch (error) {
            console.log('error: ', error)
        }
    };

    const deleteUser = async () => {
        const req = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/deleteuser`, {
            method: "DELETE",
            credentials:'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identify: id
            })
        })
        router.push('/usermanage?page=1')
    }

    return (
        <div>
            <div className="flex flex-col justify-start items-center bg-[#F4F4F4] w-full h-screen min-h-screen">
                <div className="flex flex-row w-[90%] min-w-50">
                    <p className="text-2xl my-6 mx-8">แก้ไขผู้ใช้งาน {id}</p>
                </div>
                <form id="editForm" onSubmit={handleSubmit(doSubmit)}
                    className="flex flex-col ml-16 bg-white w-[90%] h-[85%] rounded-md">
                    <div className="flex flex-row items-center pt-16 pl-8">
                        <p className="text-xl ml-8 font-semibold">Username:</p>
                        <input type="text" className="w-[20%] h-12 ml-4 pl-2 text-black bg-[#F4F4F4] text-xl"
                            {...register("userName", {
                                required: {
                                    value: true,
                                    message: "กรุณากรอก username"
                                }
                            })}
                        />
                        <p className="text-red-500 ml-2">{errors.userName?.message}</p>
                    </div>

                    <div className="flex items-center my-8 mx-8 py-4 bg-[#1E8B79]">
                        <p className="text-white text-xl ml-8">ข้อมูลผู้ของใช้งาน</p>
                    </div>

                    <div className="flex flex-row items-center py-4 pl-8">
                        <p className="text-xl ml-8 font-semibold">Full Name:</p>
                        <input type="text" className="w-[20%] h-12 ml-4 pl-2 text-black bg-[#F4F4F4] text-xl"
                            {...register("fullName", { required: { value: true, message: "กรุณากรอก fullname" } })}
                        />
                        <p className="text-red-500 ml-2">{errors.fullName?.message}</p>
                    </div>
                    <hr className="mx-8 " />
                    <div className="flex flex-row items-center py-4 pl-8">
                        <p className="text-xl ml-8 font-semibold">Email:</p>
                        <input type="text" className="w-[20%] h-12 ml-14 pl-2 text-black bg-[#F4F4F4] text-xl"
                            {...register("email", {
                                required: {
                                    value: true,
                                    message: "กรุณากรอก email"
                                },
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "กรุณากรอก email ให้ถูกต้อง"
                                }
                            })}
                        />
                        <p className="text-red-500 ml-2">{errors.email?.message}</p>
                    </div>
                    <hr className="mx-8 " />

                    <div className="flex flex-row mt-auto justify-between">
                        <button className="bg-[#1E8B79] text-white text-xl rounded-md px-6 py-3 mx-8 my-8 hover:bg-[#1D6256] disabled:opacity-50 cursor-pointer transition"
                            form="editForm" type="submit">
                            บันทึก</button>
                        <button onClick={() => {
                            setIsOpen(true)
                        }} type="button"
                            className="bg-[#ED5353] text-white text-xl rounded-md px-6 py-3 mx-8 my-8 hover:bg-[#C83D3D] disabled:opacity-50 cursor-pointer transition">
                            ลบผู้ใช้งาน</button>
                    </div>
                </form>
            </div>

            {
                isOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <img src="/images/x.png" alt="" className="absolute z-49 top-83 right-145 w-6 h-6 hover:cursor-pointer" onClick={() => {
                            setIsOpen(false)
                        }} />
                        <div className="grid grid-rows-2 bg-[#FFFFFF] rounded-lg shadow-lg  w-100 h-50 text-center relative">
                            <p className="text-xl mt-16">แน่ใจหรือไม่ว่าจะลบผู้ใช้งาน {id}</p>
                            <button
                                onClick={deleteUser}
                                className="bg-[#ED5353] text-white text-xl rounded-md px-1 py-1 mx-32 my-6 hover:bg-[#C83D3D] disabled:opacity-50 cursor-pointer transition">
                                ยืนยัน</button>
                        </div>
                    </div>
                )
            }

            {status && (

                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <img src="/images/x.png" alt="" className="absolute z-49 top-83 right-145 w-6 h-6 hover:cursor-pointer" onClick={() => {
                        setIsOpen(false)
                    }} />
                    <div className="grid grid-rows-2 bg-[#FFFFFF] rounded-lg shadow-lg  w-100 h-50 text-center relative">
                        <p className="text-xl mt-16 text-black">แก้ไขผู้ใช้งานสำเร็จ</p>
                        <button onClick={() => {
                            router.push('/usermanage?page=1')
                        }}
                            className="bg-[#1E8B79] text-white text-xl rounded-md px-1 py-1 mx-32 my-6 hover:bg-[#1D6256] disabled:opacity-50 cursor-pointer transition">
                            ยืนยัน</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default page