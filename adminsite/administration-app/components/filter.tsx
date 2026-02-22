'use client'
import React, { useState } from 'react'
import TableSlider from '@/components/slider'
import DatePicker from '@/components/datePicker'
import Selector from '@/components/selector'
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MultiValue } from 'react-select';
import { type DateRange } from "react-day-picker"
import { endOfDay } from "date-fns"
interface MyOption {
    value: string;
    label: string;
}

const Filter = () => {
    const [vote, setVote] = useState(0)
    const [agreement, setAgreement] = useState(0)
    const [types, setTypes] = useState<MultiValue<MyOption>>([
        { value: '3', label: 'ทั่วไป' },
        { value: '1', label: 'อินทรีย์' },
        { value: '2', label: 'อันตราย' },
        { value: '4', label: 'รีไซเคิล' }])
    const [date, setDate] = React.useState<DateRange | undefined>(undefined)
    const router = useRouter()
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const handleSearch = () => {
        const dateFrom = date?.from && date.from.toISOString()
        const dateTo = date?.to && endOfDay(date.to).toISOString()
        const selectedDate = [dateFrom, dateTo]
        const selectedTypes = types.map((item) => item.value)
        console.log(selectedDate)

        const params = new URLSearchParams(searchParams.toString());
        vote !== 0 ? params.set("minVote", String(vote)) : params.delete("minVote");
        agreement !== 0 ? params.set("minAgreemenRate", String(agreement)) : params.delete("minAgreemenRate");
        selectedTypes.length !== 0 ? params.set("selectedTypes", selectedTypes.join(',')) : params.delete("selectedTypes");
        selectedDate !== undefined ? params.set("dateRange", selectedDate.join(',')) : params.delete("dateRange");
        params.set("page", "1");
        router.push(`${pathname}?${params}`)
    }

    const handleDelete = () => {
        setVote(0);
        setAgreement(0);
        setTypes([
            { value: '3', label: 'ทั่วไป' },
            { value: '1', label: 'อินทรีย์' },
            { value: '2', label: 'อันตราย' },
            { value: '4', label: 'รีไซเคิล' }]);
        setDate(undefined);
        const params = new URLSearchParams(searchParams.toString());
        params.delete('minVote');
        params.delete('minAgreemenRate');
        params.delete('dateRange');

        params.set('selectedTypes', '1,2,3,4');
        params.set("page", "1");
        router.push(`${pathname}?${params}`);
    }
    return (
        <div className="flex flex-row p-8 bg-white w-[90%] h-[40%] rounded-md shadow-xl overflow-hidden">

            <div className="flex-col items-center flex-1 flex justify-between">
                <TableSlider max={100} type="number" label="จำนวนคนโหวตขั้นต่ำ" value={vote} setValue={setVote} />
                <TableSlider max={100} type="percent" label="Agreement rate ขั้นต่ำ" value={agreement} setValue={setAgreement} />
            </div>

            <div className="flex flex-1 flex-col items-center gap-y-4 justify-between">
                <DatePicker setDate={setDate} date={date} />
                <div className='flex flex-col gap-3'>
                    <p className='text-md text-[#1E8B79] font-bold'>
                        ประเภทที่ต้องการ
                    </p>
                    <div className='flex justify-center w-60'>
                        <Selector setValue={setTypes} value={types} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center gap-y-2 justify-between">

                <div className='h-full'>
                    <div className="w-28 max-w-md flex justify-center">
                        <button
                            type="submit"
                            className="w-full h-10 bg-[#1E8B79] text-white text-md font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all active:scale-95 cursor-pointer"
                        >
                            Export
                        </button>
                    </div>
                </div>


                <div className='flex gap-2 mb-4 flex-col h-full justify-end'>
                    <div className="w-28 max-w-md flex justify-center">
                        <button
                            type="submit"
                            className="w-full h-10 bg-black text-white text-md font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all active:scale-95 cursor-pointer"
                            onClick={handleSearch}
                        >
                            ค้นหา
                        </button>
                    </div>

                    <div className="w-28 max-w-md flex justify-center ">
                        <button
                            type="submit"
                            className="w-full h-10 bg-white text-black border border-slate-200 text-md font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all active:scale-95 cursor-pointer"
                            onClick={handleDelete}
                        >
                            ล้าง filter
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Filter