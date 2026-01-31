type User = {
  User_name?: string;
  Full_name?: string;
  Email?: string;
};

const Table = ({user}:{user:[User]}) => {
    
    console.log(user)

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
                    {user.map((item, index) => (
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
                                <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                                    Edit
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Table