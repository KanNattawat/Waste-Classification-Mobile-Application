import React from 'react'
import { View, Text, Pressable } from 'react-native';

interface VoteCardProps {
    selectedVote: string
    setSelectedVote: (value: string) => void
    bg: string
    wasteType: string
    votePercent: string
    voteNumber: number
    isOwner:boolean
}

const VoteCard = ({ selectedVote, setSelectedVote, bg, wasteType, votePercent, voteNumber, isOwner }: VoteCardProps) => {
    console.log(votePercent)
    return (
        <Pressable className='bg-[#CCCCCC] rounded-lg overflow-hidden h-16 relative'
            disabled={(selectedVote !== "" && selectedVote !== wasteType) || isOwner}
            onPress={() => {
                selectedVote === "" ? setSelectedVote(wasteType) : setSelectedVote("")
            }}
        >
            <View
                className={`absolute left-0 top-0 bottom-0 bg-${bg} rounded-lg flex-row items-center py-1 ${selectedVote !== wasteType && selectedVote !== "" && 'opacity-80'}`}
                style={[
                    { width: `${parseFloat(votePercent)}%` as any },
                ]}
            >
            </View>


            <View className='flex-row items-center px-3 py-1 w-full justify-between pointer-events-none'>
                <View className={`w-6 h-6 border-2 border-[#CCCCCC] bg-white rounded-md mr-3 justify-center items-center `}>
                    {selectedVote === wasteType && (
                        <Text className="text-black font-bold text-xs">✓</Text>
                    )}
                </View>
                <Text className='text-xl text-white font-bold'>
                    {wasteType}
                </Text>
                <View className='flex items-center'>
                    <Text className='text-xl text-white font-bold'>{votePercent}%</Text>
                    <Text className='text-lg text-white font-bold'>จำนวน {voteNumber} คน</Text>
                </View>
            </View>
        </Pressable>
    )
}

export default VoteCard