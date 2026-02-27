import React, { useState, useCallback } from 'react';
import { Text, View, Image, Pressable, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { shadow } from "@/styles/shadow";
import ScreenScroll from "@/components/ScreenScroll";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "@/config";

export default function Point() {
  const router = useRouter();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🌟 State สำหรับเก็บข้อมูล User (อิงตามฟิลด์ที่คุณได้จาก API /home)
  const [userData, setUserData] = useState({ userName: 'Loading...', point: 0 });

  // 🌟 ฟังก์ชันดึงข้อมูลสินค้า (ปรับมาใช้ axios ให้สอดคล้องกัน)
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/manage/getallitem`);
      setItems(res.data);
    } catch (error) {
      console.error("Error fetching items:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลรางวัลได้");
    } finally {
      setLoading(false);
    }
  };

  // 🌟 ฟังก์ชันดึงข้อมูล User (นำสไตล์จาก Index มาใช้)
  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;
      
      // เรียกใช้ /home แบบเดียวกับหน้า Index เพื่อเอา userName และ point
      const res = await axios.get(`${API_URL}/home`, { params: { userId } });
      setUserData({
        userName: res.data.userName,
        point: res.data.point
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // 🌟 ใช้ useFocusEffect เพื่อให้โหลดข้อมูลใหม่ทุกครั้งที่เข้ามาหน้านี้
  // ป้องกันปัญหาคะแนนไม่อัปเดตหลังจากกดยืนยันแลกของรางวัล
  useFocusEffect(
    useCallback(() => {
      fetchItems();
      fetchUserData();
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
                {/* 🌟 แสดงชื่อผู้ใช้จาก State */}
                <Text className='text-xl'>{userData.userName}</Text>
                <View className='flex flex-row items-center'>
                  <Image className='w-8 h-8 mr-2' source={require("@/assets/images/coin.png")} />
                  {/* 🌟 แสดงคะแนนจาก State */}
                  <Text className='text-xl'><Text className='text-[#1E8B79]'>{userData.point}</Text> คะแนน</Text>
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

            {/* รายการสินค้า */}
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