'use client'
import React, { useState } from 'react'
import * as Slider from "@radix-ui/react-slider";

type slider = {
    max: number,
    type: string,
    label:string
}

const TableSlider = ({ max, type, label }: slider) => {
    const [value, setValue] = useState([0])
    console.log(value)
    return (
        <div className="flex flex-col gap-4 w-full">
            <div className='flex justify-between'>
                <p className='text-end text-md text-[#1E8B79] font-bold'>{label}</p> <p className='text-end text-md text-[#1E8B79] font-semibold'>{value}{type == "percent" && "%"}</p>
            </div>
            <Slider.Root
                className="relative flex items-center grow h-5"
                value={value}
                onValueChange={setValue}
                max={max}
                step={1}
            >
                <Slider.Track className="bg-slate-200 relative grow rounded-full h-2 shadow-inner">
                    <Slider.Range className="absolute h-2 bg-[#1E8B79] rounded-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-5 h-5 rounded-full shadow bg-[#1E8B79] hover:cursor-pointer outline-none border-2 border-white  
                hover:scale-110 transition-transform " />
            </Slider.Root>
            <div className='flex justify-between'>
                <p className='text-center text-slate-400 text-md'>0{type == "percent" && "%"}</p> 
                <p className='text-center text-slate-400 text-md'>100{type == "percent" && "%"}</p>
            </div>
        </div>
    )
}

export default TableSlider