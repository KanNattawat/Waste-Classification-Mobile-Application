import React from 'react'
import { View, Text, Pressable } from 'react-native';

interface VoteCardProps {
    selectedVote: string
    setSelectedVote: (value: string) => void
    bg: string
    wasteType: string
    votePercent: string
    voteNumber: number
    isVoted: boolean
    hasVoted?: boolean // เพิ่มสถานะว่าเคยโหวตไปหรือยัง
}

const VoteCard = ({ selectedVote, setSelectedVote, bg, wasteType, votePercent, voteNumber, isVoted, hasVoted }: VoteCardProps) => {
    const isSelected = selectedVote === wasteType;
    const isAnotherSelected = selectedVote !== "" && selectedVote !== wasteType;

    return (
        <Pressable 
            // ถ้าโหวตไปแล้ว (hasVoted) ให้ใช้ opacity-100 เสมอเพื่อให้เห็นผลลัพธ์ชัดเจน แต่ถ้ายังไม่โหวตให้ใช้ Logic เดิม
            className={`bg-[#CCCCCC] rounded-xl overflow-hidden h-[70px] relative justify-center
                ${isSelected ? 'border-[3px] border-gray-800' : 'border-[3px] border-transparent'}
                ${hasVoted ? 'opacity-100' : (isAnotherSelected ? 'opacity-40' : 'opacity-100')}
            `}
            disabled={!isVoted || hasVoted}
            onPress={() => {
                isSelected ? setSelectedVote("") : setSelectedVote(wasteType)
            }}>
            
            {/* Progress Bar แสดงผลลัพธ์ */}
            <View
                className={`absolute left-0 top-0 bottom-0 ${bg} flex-row items-center`}
                style={[{ width: `${parseFloat(votePercent)}%` as any }]}>
            </View>

            <View className='flex-row items-center px-3 w-full justify-between pointer-events-none z-10'>
                <View className='flex-row items-center'>
                    {/* ส่วนของ Checkbox */}
                    <View className={`w-7 h-7 rounded-full border-2 justify-center items-center mr-3
                        ${isSelected ? 'bg-gray-800 border-gray-800' : (hasVoted ? 'bg-white/50 border-white/20' : 'bg-white border-gray-400')}
                    `}>
                        {isSelected && (
                            <Text className="text-white font-extrabold text-base">✓</Text>
                        )}
                        {/* ถ้าโหวตไปแล้วแต่ไม่ใช่อันที่เลือก อาจจะแสดงไอคอนล็อกจางๆ */}
                        {hasVoted && !isSelected && (
                             <Text className="text-gray-400 text-[10px]">✖️</Text>
                        )}
                    </View>
                    
                    <Text className='text-xl text-white font-bold'>
                        {wasteType}
                        {hasVoted && isSelected && " (ที่คุณเลือก)"}
                    </Text>
                </View>

                <View className='flex items-end'>
                    <Text className='text-xl text-white font-bold'>{votePercent}%</Text>
                    <Text className='text-sm text-white font-bold'>จำนวน {voteNumber} คน</Text>
                </View>
            </View>
        </Pressable>
    )
}

export default VoteCard