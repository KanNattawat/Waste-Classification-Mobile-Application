import React from 'react'
import { Text, View, Image, Pressable, SafeAreaView } from 'react-native';
import { shadow } from "@/styles/shadow";
import ScreenScroll from "@/components/ScreenScroll";
import { useRouter } from "expo-router";

const WASTE_LABEL: Record<number, string> = {
    1: "ขยะอินทรีย์",
    2: "ขยะอันตราย",
    3: "ขยะรีไซเคิล",
    4: "ขยะทั่วไป",
};

const wasteLabel = (id: number) => WASTE_LABEL[id] ?? "unknown";


const Index = () => {
    const router = useRouter()
    return (
        <SafeAreaView>
            <ScreenScroll>
            <View className='flex mt-10 w-full bg-[#F9F8FA]'>
                <Text className='text-center text-2xl font-bold text-[#1E8B79] mb-3'>ร่วมด้วยช่วยกันแยก</Text>
                <View className='flex flex-col w-full px-8'>
                    <View className='flex-row items-center bg-white shadow-xl px-8 py-4 rounded-xl' style={shadow.card}>
                        <Text className='text-xl'>กิจกรรม "ร่วมด้วยช่วยกันแยก" คือกิจกรรมที่เปิดให้ผู้ใช้งานช่วยกันแก้ไขการคัดแยก
                            ขยะที่ผิดพลาดจากระบบเพื่อเพิ่มความแม่นยำและ
                            ประสิทธิภาพในการจัดการขยะร่วมกัน</Text>
                    </View>

                    <Pressable className='flex flex-row items-center bg-white p-3 my-3 rounded-xl' style={shadow.card} onPress={()=>router.push('/event/กกตหัวควย')}>
                        <Image source={require(`@/assets/images/test1.png`)} className='w-[80px] h-[70px] rounded-lg' />
                        <View className='flex-1 flex-col ml-3 gap-y-2'>
                            <View className='flex flex-row items-center justify-between'>
                                <Text className='text-xl'>ผลลัพธ์จากระบบ</Text>
                                <View className='ml-3 bg-[#FFC8C8] rounded-lg px-2 py-1'><Text className='text-xl text-[#842A2A] font-bold'>ขยะอันตราย</Text></View>
                            </View>
                            <View className='flex flex-row items-center justify-between'>
                                <Text className='text-xl'>ผลลัพธ์ปัจจุบัน</Text>
                                <View className='ml-3 bg-[#CCCCCC] rounded-lg px-2 py-1'><Text className='text-xl text-black font-bold'>ไม่มีผลโหวต</Text></View>
                            </View>
                        </View>
                    </Pressable>




                </View>
            </View>
            </ScreenScroll>
        </SafeAreaView>
    )
}

export default Index