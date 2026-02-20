import React from 'react'
import Select from 'react-select'

const options = [
    { value: 'ทั่วไป', label: 'ทั่วไป' },
    { value: 'อินทรีย์', label: 'อินทรีย์' },
    { value: 'อันตราย', label: 'อันตราย' },
    { value: 'รีไซเคิล', label: 'รีไซเคิล' }
]
import { cn } from "@/lib/utils"

const Selector = () => {
    return (
        <Select
            defaultValue={options}
            isMulti
            unstyled
            name="colors"
            options={options}
            classNames={{
                container: () => 'w-full ',
                control: () => cn(
                    "p-2 w-full bg-white rounded-md transition-all duration-200 border border-slate-200",
                ),
                valueContainer: () => '',
                menu: () => 'p-2 border border-slate-200 mt-1 rounded-md text-[14.5px]',
                option: ({ isFocused }) => `py-0.5 ${isFocused && 'bg-blue-100'}`,
                multiValue: () => "bg-slate-200 rounded-sm flex items-center overflow-hidden",
                multiValueLabel: () => "px-2 py-0.5 text-[14.5px] ",
                multiValueRemove: () => "px-1 hover:bg-red-200 hover:text-red-400 transition-colors",
                noOptionsMessage: () => "p-4 text-slate-400 text-[14.5px]",
            }}
            classNamePrefix="select"
        />
    )
}

export default Selector