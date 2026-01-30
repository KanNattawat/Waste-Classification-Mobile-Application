'use client'
import { useState } from "react";

const page = () => {
  const [pageNumber, setPageNumber] = useState({
    current: 1,
    total: 100,
  });
  const buttonsToShow = 5;

  const getPaginationGroup = () => {

    let start = Math.max(1, Math.max(1, pageNumber.current - Math.floor(buttonsToShow/2)))
    start = Math.min(start, pageNumber.total-buttonsToShow+1) 
    console.log(pageNumber.current)

    return Array.from({ length: Math.min(buttonsToShow, pageNumber.total) }, (_, i) => start + i);
  };

  const projects = [
    { name: "Project Alpha", start: "01/01/2024", end: "30/06/2024", owner: "John Michael", budget: "$50,000" },
    { name: "Beta Campaign", start: "15/02/2024", end: "15/08/2024", owner: "Alexa Liras", budget: "$75,000" },
    { name: "Campaign Delta", start: "01/03/2024", end: "01/09/2024", owner: "Laurent Perrier", budget: "$60,000" },
    { name: "Gamma Outreach", start: "10/04/2024", end: "10/10/2024", owner: "Michael Levi", budget: "$80,000" },
    { name: "Omega Strategy", start: "01/05/2024", end: "01/11/2024", owner: "Richard Gran", budget: "$100,000" },
    { name: "Project Alpha", start: "01/01/2024", end: "30/06/2024", owner: "John Michael", budget: "$50,000" },
    { name: "Beta Campaign", start: "15/02/2024", end: "15/08/2024", owner: "Alexa Liras", budget: "$75,000" },
    { name: "Campaign Delta", start: "01/03/2024", end: "01/09/2024", owner: "Laurent Perrier", budget: "$60,000" },
    { name: "Gamma Outreach", start: "10/04/2024", end: "10/10/2024", owner: "Michael Levi", budget: "$80,000" },
    { name: "Omega Strategy", start: "01/05/2024", end: "01/11/2024", owner: "Richard Gran", budget: "$100,000" },
    { name: "Project Alpha", start: "01/01/2024", end: "30/06/2024", owner: "John Michael", budget: "$50,000" },
  ];
  // limit 11 row per page


  return (
    <div>
      <div className="flex flex-col justify-start items-center bg-[#F4F4F4] w-full h-screen min-h-screen">
        <div className="flex flex-row w-[90%] min-w-50">
          {/* search bar */}
          <div className="flex w-full">
            <div className="flex flex-row items-center justify-between w-full max-w-85  bg-white rounded-md mb-3 mt-6 shadow-md">
              <div className="relative p-2 rounded-md w-full max-w-60 ml-2">
                <img src="/images/Search.png" className="absolute top-4 left-4" alt="" />
                <input type="text" placeholder="กรอก username"
                  className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-10 pr-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" />
              </div>
              <button className="px-4 py-1.5 mr-2 bg-black text-white rounded-md hover:bg-[#2C2C2C] transition cursor-pointer">
                ค้นหา
              </button>
            </div>
          </div>

          {/* pagination */}
          <div className="flex flex-row items-center gap-1 mt-6">
            <button
              disabled={pageNumber.current === 1}
              onClick={() => setPageNumber({ ...pageNumber, current: 1})}
              className="bg-white border border-slate-200 rounded-md px-5 py-2.5 text-sm hover:bg-slate-100 disabled:opacity-50 cursor-pointer transition"
            >
              &lt;&lt;
            </button>
            <button
              disabled={pageNumber.current === 1}
              onClick={() => setPageNumber({ ...pageNumber, current: pageNumber.current - 1 })}
              className="bg-white border border-slate-200 rounded-md px-5 py-2.5 text-sm hover:bg-slate-100 disabled:opacity-50 cursor-pointer transition"
            >
              &lt;
            </button>

            {getPaginationGroup().map((num) => (
              <button
                key={num}
                onClick={() => setPageNumber({ ...pageNumber, current: num })}
                className={`rounded-md px-3 py-1.5 text-sm border ${pageNumber.current === num
                    ? "bg-black text-white border-black"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                {num}
              </button>
            ))}



            <button
              disabled={pageNumber.current === pageNumber.total}
              onClick={() => setPageNumber({ ...pageNumber, current: pageNumber.current + 1 })}
              className="bg-white border border-slate-200 rounded-md px-5 py-2.5 text-sm hover:bg-slate-100 disabled:opacity-50 cursor-pointer transition"
            >
              &gt;
            </button>
            <button
              disabled={pageNumber.current === pageNumber.total}
              onClick={() => setPageNumber({ ...pageNumber, current: pageNumber.total })}
              className="bg-white border border-slate-200 rounded-md px-5 py-2.5 text-sm hover:bg-slate-100 disabled:opacity-50 cursor-pointer transition"
            >
              &gt;&gt;
            </button>
          </div>
        </div>

        <div className=" flex justify-center items-center bg-white w-[90%] h-[85%] rounded-md">
          {/* table */}
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
                {projects.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 border-b border-slate-100 last:border-none">
                    <td className="p-4">
                      <p className="text-sm font-bold">{item.name}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{item.start}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{item.end}</p>
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
        </div>
      </div>
    </div>
  )
}

export default page