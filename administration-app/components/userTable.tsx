import Link from 'next/link';

type User = {
    User_name?: string;
    Full_name?: string;
    Email?: string;
};

const UserTable = ({ user }: { user: [User] }) => {

    return (
        <div className="relative h-full w-full overflow-auto bg-clip-border shadow-xl rounded-md">
            <table className="w-full text-left table-auto min-w-max text-slate-800">

                <thead>
                    <tr className="text-slate-500 border-b border-slate-300 bg-slate-50 sticky top-0 z-10">
                        <th className="p-4 text-sm font-normal">USERNAME</th>
                        <th className="p-4 text-sm font-normal">EMAIL ADRESS</th>
                        <th className="p-4 text-sm font-normal">FULL NAME</th>
                        <th className="p-4"></th>
                    </tr>
                </thead>

                <tbody>
                    {user.map((item:User, index:number) => (
                        <tr key={index} className="hover:bg-slate-50 border-b border-slate-100 last:border-none">
                            <td className="p-4">
                                <p className="text-sm font-bold">{item.User_name}</p>
                            </td>
                            <td className="p-4">
                                <p className="text-sm">{item.Email}</p>
                            </td>
                            <td className="p-4">
                                <p className="text-sm">{item.Full_name}</p>
                            </td>
                            <td className="p-4 text-right">
                                <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/usermanage/${item.User_name}?full_name=${item.Full_name}&email=${encodeURIComponent(String(item.Email))}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                                    แก้ไข
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default UserTable