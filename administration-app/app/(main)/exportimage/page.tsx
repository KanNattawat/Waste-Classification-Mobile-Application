import Pagination from "@/components/pagination"
import Image from 'next/image';
import { getToken } from '@/lib/getToken';
import Filter from "@/components/filter"
import { getImage } from "@/lib/s3Service";

type WasteVote = {
  label: string;
  percentage: number;
}

type Waste = {
  Waste_ID: string
  WasteType_ID: string
  Timestamp: string
  Vote_wastetype: WasteVote[]
  Total_Vote: number
  Agreement_Rate: number
  Image_path:string
}

type SearchParams = {
  page?: string;
  minVote?: string;
  minAgreemenRate?: string;
  selectedTypes?: string;
  dateRange?: string
};



const page = async ({ searchParams }: { searchParams: SearchParams }) => {

  const { page, minVote, minAgreemenRate, selectedTypes, dateRange } = await searchParams;
  const currentPage = page ?? '1';
  const token = await getToken()
  const query = new URLSearchParams({
    current: currentPage,
    minVote: String(minVote ?? ""),
    minAgree: String(minAgreemenRate ?? ""),
    selectedType: String(selectedTypes ?? '1,2,3,4'),
    dateRange: String(dateRange ?? ""),
  }).toString();

  const res = await fetch(`${process.env.API_BASE_URL}/manage/waste?${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  const data = await res.json();
  const waste = data.wasteData

  const totalPage = data.totalPage
  const safePage = Math.min(totalPage, Number(currentPage))
  const wasteTypeMapping = {
    '1': 'ขยะอินทรีย์',
    '2': 'ขยะอันตราย',
    '3': 'ขยะทั่วไป',
    '4': 'ขยะรีไซเคิล'
  }

  return (
    <div>
      <div className="flex flex-col justify-start items-center bg-[#F4F4F4] w-full h-screen min-h-screen p-10 gap-y-4">
        {/* filter */}
        <Filter />


        {/* table */}
        <div className="flex flex-col bg-white w-[90%] h-[60%] rounded-md shadow-xl overflow-hidden">

          <div className="grow overflow-auto">
            <table className="w-full text-left table-auto min-w-max text-slate-800">
              <thead>
                <tr className="text-slate-500 border-b border-slate-300 bg-slate-50 sticky top-0  text-center">
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
                      <Image src={getImage(item.Image_path)} width={120} height={120} alt="" className="object-contain rounded-md" />
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-600">{wasteTypeMapping[(item.WasteType_ID as keyof typeof wasteTypeMapping)] || ''}</p>
                    </td>
                    <td className="p-4 min-w-50">
                      <div className="space-y-2">
                        {item.Vote_wastetype.map((v: any, i: number) => {
                          const displayPercent = isNaN(v.percentage) ? 0 : v.percentage;
                          return (
                            <div key={i} className="group">
                              <div className="flex justify-between mb-1">
                                <span className="text-[13px] font-medium text-slate-600">{v.label}</span>
                                <span className="text-[13px] font-bold text-slate-400 group-hover:text-slate-800 transition-colors">
                                  {displayPercent}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                <div
                                  className={`h-full bg-[#1E8B79] transition-all duration-500 ease-out rounded-full`}
                                  style={{ width: `${displayPercent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-4 ">
                      <p className="text-sm text-slate-600">{new Date(item.Timestamp).toLocaleString("th-TH", {timeZone: "Asia/Bangkok"})}</p>
                    </td>
                    <td className="p-4 flex-row justify-between">
                      <p className="text-sm text-slate-600">จำนวนโหวต: {item.Total_Vote}</p>
                      <p className="text-sm text-slate-600">AgreementRate: {!isNaN(item.Agreement_Rate) ? item.Agreement_Rate + "%" : "No vote"}</p>
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