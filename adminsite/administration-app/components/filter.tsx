'use client'
import { useState } from 'react'
import TableSlider from '@/components/slider'
import DatePicker from '@/components/datePicker'
import Selector from '@/components/selector'

const Filter = () => {
    return (
        <div className="flex flex-row p-8 bg-white w-[90%] h-[40%] rounded-md shadow-xl overflow-hidden">

            <div className="flex-col items-center flex-1 flex justify-between">
                <TableSlider max={100} type="number" label="จำนวนคนโหวตขั้นต่ำ" />
                <TableSlider max={100} type="percent" label="Agreement rate ขั้นต่ำ" />
            </div>

            <div className="flex flex-1 flex-col items-center gap-y-4 justify-between">
                <DatePicker />
                <div className='flex flex-col gap-3'>
                    <p className='text-md text-[#1E8B79] font-bold'>
                        ประเภทที่ต้องการ
                    </p>
                    <div className='flex justify-center w-60'>
                        <Selector/>
                    </div>
                </div>
            </div>
            
            <div className="flex-col items-center flex-1 ">
                <p className="text-center">ปุ่มexport</p>
                <p className="text-center">ปุ่มล้าง</p>
            </div>
        </div>
    )
}

export default Filter