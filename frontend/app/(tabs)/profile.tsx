import { View, Text, TouchableOpacity } from 'react-native'

const WasteStats = ({ text, color }: { text: String, color: String }) => {
    return (
        <View className='flex flex-row'>
            <View className={`w-20 h-20 rounded-full ${color}`} /> <Text>{text}</Text> <Text>25</Text>
        </View>
    )
}

const profile = () => {
    return (
        <View className='bg-[#FFFFFF] flex-1 items-center justify-center'>
            <Text>โปรไฟล์</Text>
            <Text>Adam Smith</Text>
            <Text>Adam1112</Text>
            <Text>สถิติการคัดแยกขยะ</Text>

            <View className='rounded-lg border border-solid bg-[#FFFFFF]'>
                <View className='flex flex-row'>
                    <Text>แยกขยะไปแล้วทั้งหมด</Text> <Text>100</Text>
                </View>
                <WasteStats text={"ขยะอันตราย"} color={"bg-[#EF4545]"} />
                <WasteStats text={"ขยะย่อยสลาย"} color={"bg-[#28C45C]"} />
                <WasteStats text={"ขยะทั่วไป"} color={"bg-[#38AFFF]"} />
                <WasteStats text={"ขยะรีไซเคิล"} color={"bg-[#FCD92C]"} />
            </View>

            <TouchableOpacity>
                <Text>ออกจากระบบ</Text>
            </TouchableOpacity>
        </View>
    )
}

export default profile
