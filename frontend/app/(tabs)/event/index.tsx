import React, { useEffect, useState } from 'react'
import { Text, View, Image, Pressable, SafeAreaView } from 'react-native';
import { shadow } from "@/styles/shadow";
import ScreenScroll from "@/components/ScreenScroll";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from "@/config";
import Loading from "@/components/loading"
import { useRouter } from "expo-router"
import {getImage} from "@/lib/s3Service"


const WASTE_LABEL: Record<number, string> = {
    1: "ขยะอินทรีย์",
    2: "ขยะอันตราย",
    3: "ขยะรีไซเคิล",
    4: "ขยะทั่วไป",
};
const wasteLabel = (id: number) => WASTE_LABEL[id] ?? "unknown";

type Waste = {
    Waste_ID: string
    WasteType_ID: string
    Image_path: string,
    type: string,
    Vote_wastetype: string
}

const Index = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [waste, setWaste] = useState<Waste[]>();
    const router = useRouter();
    useEffect(() => {
        (async () => {
            const getId = await AsyncStorage.getItem("userId");
            setUserId(getId);
        })();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!userId) return;
                console.log('getting data')
                const res = await axios.get(`${API_URL}/uniqueWaste`, {
                    params: {
                        userId: userId
                    }
                })
                console.log(res.data)
                const labels = ["ขยะอินทรีย์", "ขยะอันตราย", "ขยะทั่วไป", "ขยะรีไซเคิล"];
                const wasteData = res.data.item.map((i: any) => {
                    const voteNumber = i.Vote_wastetype.map((value: number, index: number) => {
                        return [labels[index], value]
                    })
                    return { ...i, Vote_wastetype: voteNumber }
                })
                const sortedVote = wasteData.map((i: any) => {
                    const getMostVote = i.Vote_wastetype.slice().sort((a: any, b: any) => { return b[1] - a[1] })

                    return { ...i, Vote_wastetype: getMostVote }
                })
                setWaste([...sortedVote])

            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [userId])

    if (loading) {
        return <Loading />
    }



    const currentColorMap: { [key: string]: string } = {
        "1-text": "text-[#1A863E]",
        "2-text": "text-[#842A2A]",
        "3-text": "text-[#276F9F]",
        "4-text": "text-[#A99323]",
        "1-bg": "bg-[#E5FFED]",
        "2-bg": "bg-[#FFC8C8]",
        "3-bg": "bg-[#EDF8FF]",
        "4-bg": "bg-[#FFFCEB]"
    }

    const voteColorMap: { [key: string]: string } = {
        "ขยะอินทรีย์-text": "text-[#1A863E]",
        "ขยะอันตราย-text": "text-[#842A2A]",
        "ขยะทั่วไป-text": "text-[#276F9F]",
        "ขยะรีไซเคิล-text": "text-[#A99323]",
        "ขยะอินทรีย์-bg": "bg-[#E5FFED]",
        "ขยะอันตราย-bg": "bg-[#FFC8C8]",
        "ขยะทั่วไป-bg": "bg-[#EDF8FF]",
        "ขยะรีไซเคิล-bg": "bg-[#FFFCEB]"
    } 

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
                        {waste?.map((item, index) =>
                            <Pressable key={index} className='flex flex-row items-center bg-white p-3 my-3 rounded-xl' style={shadow.card} onPress={() => router.push(`/event/${item.Waste_ID}`)}>
                                <Image source={{ uri: getImage(item.Image_path)}} className='w-[80px] h-[70px] rounded-lg' />
                                <View className='flex-1 flex-col ml-3 gap-y-2'>
                                    <View className='flex flex-row items-center justify-between'>
                                        <Text className='text-xl'>ผลลัพธ์จากระบบ</Text>
                                        <View className={`ml-3 ${currentColorMap[item.WasteType_ID + "-bg"]} rounded-lg px-2 py-1`}>
                                            <Text className={`text-xl ${currentColorMap[item.WasteType_ID + "-text"]} font-bold`}>{item.WasteType_ID == "1" ? "ขยะอินทรีย์" : item.WasteType_ID == "2" ? "ขยะอันตราย" : item.WasteType_ID == "3" ? "ขยะทั่วไป" : "ขยะรีไซเคิล"}</Text>
                                        </View>
                                    </View>
                                    {/* bg-[#CCCCCC] text-black*/}
                                    <View className='flex flex-row items-center justify-between'>
                                        <Text className='text-xl'>ผลลัพธ์ปัจจุบัน</Text>
                                        <View className={`ml-3 ${Number(item.Vote_wastetype[0][1]) !== 0 ? `${voteColorMap[item.Vote_wastetype[0][0]+"-bg"]}` : "bg-[#CCCCCC]"}  rounded-lg px-2 py-1`}>
                                            <Text className={`text-xl ${Number(item.Vote_wastetype[0][1]) !== 0 ? `${voteColorMap[item.Vote_wastetype[0][0]+"-text"]}` : "text-black"}  font-bold`}>{Number(item.Vote_wastetype[0][1]) !== 0 ? `${item.Vote_wastetype[0][0]}` : "ไม่มีผลโหวต"}</Text>
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                        )}
                    </View>
                </View>
            </ScreenScroll>
        </SafeAreaView>
    )
}

export default Index