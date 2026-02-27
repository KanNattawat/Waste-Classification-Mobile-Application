import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, Image, Pressable, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { shadow } from "@/styles/shadow";
import ScreenScroll from "@/components/ScreenScroll";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import axios from 'axios';
import { API_URL } from "@/config";

type User = {
  UserName: string,
  Point: string
}


export default function Point() {
  const router = useRouter();
  const [user, setUser] = useState<User | undefined>(undefined)
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const userId = await AsyncStorage.getItem("userId");
    const res = await axios(`${API_URL}/user`,
      {
        params: {
          userId: userId
        }
      })
    const data = res.data
    console.log(data)
    setUser({
      UserName: data.User_name,
      Point: data.Points
    })
  }

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://waste-classification-mobile-application.onrender.com/manage/getallitem', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลสินค้าได้');
      }

      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error(error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลรางวัลได้");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser();
      fetchItems();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 flex-col bg-[#F9F8FA] min-h-full">
      <ScreenScroll>
        <View className='flex items-center mt-10'>
          <Text className='text-3xl font-bold text-[#1E8B79] text-center mb-3'>แลกรางวัล</Text>
          <View className='flex flex-col w-screen px-8'>

            {/* ส่วนโปรไฟล์ผู้ใช้ และคะแนน */}
            <View className='flex-row items-center bg-white shadow-xl px-8 py-4 rounded-xl' style={shadow.card}>
              <View className='flex-1'>
                <Text className='text-xl'>{user?.UserName}</Text>
                <View className='flex flex-row items-center'>
                  <Image className='w-8 h-8 mr-2' source={require("@/assets/images/coin.png")} />
                  <Text className='text-xl' ><Text className='text-[#1E8B79]'>{user?.Point}</Text> คะแนน</Text>
                </View>
              </View>
              <Pressable onPress={() => { router.push('/pointHistory') }}>
                <Image
                  className='w-8 h-8'
                  source={require("@/assets/images/clock.png")} />
              </Pressable>
            </View>

            {/* แบนเนอร์กิจกรรม */}
            <Pressable className='h-24 w-full mt-4 rounded-xl overflow-hidden' style={shadow.card} onPress={() => router.push(`/event`)}>
              <Image
                className='w-full h-full'
                resizeMode="cover"
                source={require("@/assets/images/event.png")}
              />
            </Pressable>

            <Text className='text-xl my-2'>รางวัล</Text>

            <View className='flex flex-row flex-wrap gap-3 items-center justify-between pb-10'>

              {loading ? (
                <View className="w-full py-10 flex items-center justify-center">
                  <ActivityIndicator size="large" color="#1E8B79" />
                </View>
              ) : items.length === 0 ? (
                <Text className="text-center w-full mt-5 text-gray-500 text-lg">ยังไม่มีรายการของรางวัล</Text>
              ) : (
                items.map((item) => (
                  <Pressable
                    key={item.Item_ID}
                    className='flex items-center gap-2 bg-white rounded-xl p-2 w-[48%] mb-2'
                    style={shadow.card}
                    onPress={() => router.push({ pathname: '/item', params: { id: item.Item_ID } })}
                  >
                    <Image
                      className="w-full h-32 max-w-[120px]"
                      resizeMode="contain"
                      source={{ uri: item.Item_Image_path || item.Image_path }}
                    />
                    <Text className='text-xl text-center' numberOfLines={1}>{item.Item_name}</Text>
                    <View className='flex flex-row items-center'>
                      <Image className='w-4 h-4 mr-2' source={require("@/assets/images/coin.png")} />
                      <Text className='text-lg'><Text className='text-[#1E8B79]'>{item.Point_Usage}</Text> คะแนน</Text>
                    </View>
                  </Pressable>
                ))
              )}

            </View>
          </View>
        </View>
      </ScreenScroll>
    </SafeAreaView>
  )
};