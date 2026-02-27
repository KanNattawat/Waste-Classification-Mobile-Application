import React from 'react'
import Select from 'react-select'
import { MultiValue, ActionMeta } from 'react-select';

const options = [
    { value: '3', label: 'ทั่วไป' },
    { value: '1', label: 'อินทรีย์' },
    { value: '2', label: 'อันตราย' },
    { value: '4', label: 'รีไซเคิล' }
]
import { cn } from "@/lib/utils"

interface MyOption {
  value: string;
  label: string;
}
type Selector = {
    setValue: React.Dispatch<React.SetStateAction<MultiValue<MyOption>>>,
    value: MultiValue<MyOption>
}


const Selector = ({setValue, value}:Selector) => {

    const handleChange = (value:MultiValue<MyOption>, actionMeta:ActionMeta<MyOption>) =>{
        setValue(value)
    }

    return (
        <Select
            defaultValue={options}
            value={value}
            instanceId='selector'
            isMulti
            onChange={handleChange}
            unstyled
            name="colors"
            menuPortalTarget={typeof window !== "undefined" ? document.body : null}
            options={options}
            classNames={{
                container: () => 'w-full ',
                control: () => cn(
                    "p-2 w-full bg-white rounded-md transition-all duration-200 border border-slate-200",
                ),
                valueContainer: () => '',
                menuPortal: () => "z-[9999]",
                menu: () => 'bg-white p-2 border border-[#e5e5e5] mt-0.5 rounded-md text-[14.5px] shadow-md relative',
                option: ({ isFocused }) => `py-0.5 ${isFocused && 'bg-blue-100'}`,
                multiValue: () => "bg-slate-200 rounded-sm flex items-center overflow-hidden ",
                multiValueLabel: () => "px-2 py-0.5 text-[14.5px] ",
                multiValueRemove: () => "px-1 hover:bg-red-200 hover:text-red-400 rounded-sm transition-colors",
                noOptionsMessage: () => "p-4 text-slate-400 text-[14.5px]",
            }}
            menuPosition="fixed"
            classNamePrefix="select"
        />
    )
}

export default Selector