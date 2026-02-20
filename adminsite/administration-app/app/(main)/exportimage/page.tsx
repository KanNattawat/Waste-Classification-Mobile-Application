import Pagination from "@/components/pagination"
import Table from "@/components/userTable"
import Image from 'next/image';

import { cookies } from 'next/headers'; type SearchParams = {
  page?: string;
  username?: string;
};

type Waste = {
  Waste_ID: string
  WasteType_ID: string
  Timestamp: string
  Vote_wastetype: any
  Total_Vote:number
  Agreement_Rate:number
}



const page = async ({ searchParams }: { searchParams: SearchParams }) => {

  const { page } = await searchParams;
  const currentPage = page ?? '1';
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const res = await fetch(`${process.env.API_BASE_URL}/manage_router/waste?current=${currentPage}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  const waste = data.wasteData

  const totalPage = data.totalPage
  console.log('wasteData',waste)
  const safePage = Math.min(totalPage, Number(currentPage))
  const wasteTypeMapping = {
    '1': 'ขยะอินทรีย์',
    '2': 'ขยะอันตราย',
    '3': 'ขยะทั่วไป',
    '4': 'ขยะรีไซเคิล'
  }

  return (
    <div>
      <div className="flex flex-col justify-start items-center bg-[#F4F4F4] w-full h-screen min-h-screen p-10">

        <div className="flex flex-col bg-white w-[90%] h-[85%] rounded-md shadow-xl overflow-hidden">

          <div className="grow overflow-auto">
            <table className="w-full text-left table-auto min-w-max text-slate-800">
              <thead>
                <tr className="text-slate-500 border-b border-slate-300 bg-slate-50 sticky top-0 z-10 text-center">
                  <th className="p-4 text-sm font-normal">รูปภาพ</th>
                  <th className="p-4 text-sm font-normal">ประเภทขยะที่ระบบจำแนก</th>
                  <th className="p-4 text-sm font-normal">ประเภทขยะจากการโหวต</th>
                  <th className="p-4 text-sm font-normal">วันที่อัปโหลด</th>
                  <th className="p-4 text-sm font-normal">สถิติการโหวต</th>
                </tr>
              </thead>
              <tbody>
                {waste.map((item: Waste, index: number) => (
                  <tr key={index} className="hover:bg-slate-50 border-b border-slate-100 last:border-none text-center">
                    <td className="p-4 flex justify-center">
                      <Image src="/images/test.png" width={120} height={120} alt="" className="object-contain rounded-md" />
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{wasteTypeMapping[(item.WasteType_ID as keyof typeof wasteTypeMapping)] || ''}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">
                        {item.Vote_wastetype[0].label} {item.Vote_wastetype[0].percentage}%
                        {item.Vote_wastetype[1].label} {item.Vote_wastetype[1].percentage}%
                        {item.Vote_wastetype[2].label} {item.Vote_wastetype[2].percentage}%
                        {item.Vote_wastetype[3].label} {item.Vote_wastetype[3].percentage}%
                      </p>
                    </td>
                    <td className="p-4 ">
                      <p className="text-sm">{item.Timestamp.toString().split('T')[0]}</p>
                    </td>
                    <td className="p-4 ">
                      <p className="text-sm">จำนวนโหวต: {item.Total_Vote} AgreementRate: {item.Agreement_Rate}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 p-4 bg-white flex justify-end">
            <Pagination current={Number(safePage)} total={totalPage} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default page