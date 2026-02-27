import React, { useCallback, useState } from 'react'
import { useFocusEffect } from "@react-navigation/native";
import { Text, View, Image, Pressable, SafeAreaView, FlatList, ListRenderItem } from 'react-native';
import ScreenScroll from "@/components/ScreenScroll";
import { shadow } from "@/styles/shadow";
import { API_URL } from "@/config";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import formatDate from "@/lib/formatDate"

type User = {
    UserName: string,
    Point: string
}

type History = {
    PointHistory_ID: string,
    History_Detail: string,
    Timestamp: string,
    History_Type: string,
    PointsChanged: string
}

type HistoryType = {
    Get: History[],
    Use: History[]
}


const pointHistory = () => {
    const [filter, setFilter] = useState('get')
    const [user, setUser] = useState<User | undefined>(undefined)
    const [history, setHistory] = useState<HistoryType>(
        {
            Get: [],
            Use: []
        }
    )

    const filterHistory =  (data: History[]) => {
        const filterdData: HistoryType = {
            Get: [],
            Use: []
        }
        data.forEach((item) => {
            if (item.History_Type === 'GET') {
                filterdData.Get.push(item);
            } else if (item.History_Type === 'USE') {
                filterdData.Use.push(item);
            }
        });
        setHistory(filterdData)
    }

    const fetchData = async () => {
        const userId = await AsyncStorage.getItem("userId");
        const res = await axios(`${API_URL}/pointHistory`,
            {
                params: {
                    userId: userId
                }
            })
        filterHistory(res.data.point)
        setUser({
            UserName: res.data.user.User_name,
            Point: res.data.user.Points
        })
    }

    useFocusEffect(
        useCallback(() => {
            fetchData()
        }, [])
    )

    return (
        <SafeAreaView className="flex-1 flex-col bg-[#F9F8FA] min-h-full">
            <ScreenScroll>
                <View className='flex items-center mt-10'>
                    <Text className='text-3xl font-bold text-[#1E8B79] text-center mb-3'>แลกรางวัล</Text>
                    <View className='flex flex-col w-screen px-8'>
                        <View className='flex-row items-center bg-white shadow-xl px-8 py-4 rounded-xl' style={shadow.card}>
                            <View className='flex-1'>
                                <Text className='text-xl'>{user?.UserName}</Text>
                                <View className='flex flex-row items-center'>
                                    <Image className='w-8 h-8 mr-2' source={require("@/assets/images/coin.png")} />
                                    <Text className='text-xl' ><Text className='text-[#1E8B79]'>{user?.Point}</Text> คะแนน</Text>
                                </View>
                            </View>
                        </View>

                        <View className='flex flex-row w-full justify-between mt-4'>
                            <Pressable className={` py-4 rounded-xl items-center w-[47%] ${filter === "get" ? 'bg-[#1E8B79]' : 'bg-white'}`} style={shadow.card} onPress={() => { setFilter('get') }}>
                                <Text className={`text-xl ${filter === "get" ? 'text-white' : 'text-[#1E8B79]'} `}>ได้รับคะแนน</Text>
                            </Pressable>
                            <Pressable className={`py-4 rounded-xl items-center w-[47%] ${filter === "use" ? 'bg-[#1E8B79]' : 'bg-white'}`} style={shadow.card} onPress={() => { setFilter('use') }}>
                                <Text className={`text-xl ${filter === "use" ? 'text-white' : 'text-[#1E8B79]'} `}>คะแนนที่ใช้</Text>
                            </Pressable>
                        </View>

                        {/* <View className='flex flex-col w-full bg-white py-5 rounded-xl justify-center pl-4 mt-4' style={shadow.card}>
                            <Text className='text-xl'>ได้รับ <Text className='text-[#1E8B79]'>1</Text>  คะแนนจากการถ่ายรูปเพื่อคัดแยกขยะ</Text>
                            <Text className='text-lg text-[#545454]'>20 สิงหาคม 2026</Text>
                        </View>

                        <View className='flex flex-col w-full bg-white py-5 rounded-xl justify-center pl-4 mt-4' style={shadow.card}>
                            <Text className='text-xl'>ได้รับ <Text className='text-[#1E8B79]'>1</Text>  คะแนนจากกิจกรรมช่วยกันแยก</Text>
                            <Text className='text-lg text-[#545454]'>20 สิงหาคม 2026</Text>
                        </View> */}

                        {filter === 'get' ?
                            history.Get.map((item) =>
                                <View className='flex flex-col w-full bg-white py-5 rounded-xl justify-center pl-4 mt-4' style={shadow.card} key={item.PointHistory_ID}>
                                    <Text className='text-xl'>ได้รับ<Text className='text-[#1E8B79]'>{item.PointsChanged} </Text>
                                        {item.History_Detail === "uploadWaste" ? "คะแนนจากการถ่ายรูปเพื่อคัดแยกขยะ" : item.History_Detail === "voteEvent" ? "คะแนนจากกิจกรรมช่วยกันแยก" : ""}
                                    </Text>
                                    <Text className='text-lg text-[#545454]'>{formatDate(item.Timestamp)}</Text>
                                </View>
                            )
                            :
                            history.Use.map((item) =>
                                <View className='flex flex-col w-full bg-white py-5 rounded-xl justify-center pl-4 mt-4' style={shadow.card} key={item.PointHistory_ID}>
                                    <Text className='text-xl'>ใช้<Text className='text-[#1E8B79]'>{item.PointsChanged}</Text>เพื่อแลก (ชื่อสินค้า)  </Text>
                                    <Text className='text-lg text-[#545454]'>{formatDate(item.Timestamp)}</Text>
                                </View>
                            )
                        }
                    </View>
                </View>
            </ScreenScroll>
        </SafeAreaView>
    )
}

export default pointHistory
