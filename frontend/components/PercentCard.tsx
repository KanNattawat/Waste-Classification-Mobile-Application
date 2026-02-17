import React from 'react'
import { View, Text} from "react-native";

interface PercentCardProps {
    bg: string
    wasteType: string
    votePercent: string
    voteNumber: number
}

const PercentCard = ({bg, wasteType, votePercent, voteNumber}:PercentCardProps) => {
    return (
        <View className='bg-[#CCCCCC] rounded-lg overflow-hidden h-16 relative'>
            <View
                className={`absolute left-0 top-0 bottom-0 ${bg} rounded-lg flex-row items-center py-1`}
                style={[
                    { width: `${parseFloat(votePercent)}%` as any },
                ]}
            >
            </View>
            <View className='flex-row items-center px-3 py-1 w-full justify-between pointer-events-none'>
                <Text className='text-xl text-white font-bold'>
                    {wasteType}
                </Text>
                <View className='flex items-center'>
                    <Text className='text-xl text-white font-bold'>{votePercent}%</Text>
                    <Text className='text-lg text-white font-bold'>จำนวน {voteNumber} คน</Text>
                </View>
            </View>
        </View>
    )
}

export default PercentCard