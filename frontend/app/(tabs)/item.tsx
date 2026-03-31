import React, { useState, useEffect } from 'react';
import { Text, View, Image, Pressable, Modal, ActivityIndicator, Alert, ScrollView } from 'react-native'; 
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 🌟 เพิ่ม Import

const Item = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets(); // 🌟 เรียกใช้ Hook เพื่อดึงค่าขอบจอ

  const [open, setOpen] = useState(false);
  const [itemData, setItemData] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('authToken');

      if (!id) return;

      const itemRes = await fetch(`https://waste-classification-mobile-application.onrender.com/manage/getallitem/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (itemRes.ok) {
        const itemJson = await itemRes.json();
        setItemData(itemJson);
      }

      const userId = await AsyncStorage.getItem("userId"); 
      
      if (userId) {
        const userRes = await fetch(`https://waste-classification-mobile-application.onrender.com/home?userId=${userId}`, { 
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userRes.ok) {
          const userJson = await userRes.json();
          setUserPoints(userJson.point || 0); 
        }
      }

    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    try {
      setRedeeming(true);
      const token = await SecureStore.getItemAsync('authToken');

      const res = await fetch(`https://waste-classification-mobile-application.onrender.com/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: id }) 
      });

      const result = await res.json();

      if (res.ok) {
        setOpen(false);
        Alert.alert("สำเร็จ", `แลก ${itemData.Item_name} เรียบร้อยแล้ว!`, [
          { text: "ตกลง", onPress: () => router.replace('/(tabs)/point') } 
        ]);
      } else {
        setOpen(false);
        Alert.alert("ไม่สำเร็จ", result.error || "ไม่สามารถแลกของรางวัลได้");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F9F8FA]">
        <ActivityIndicator size="large" color="#1E8B79" />
      </View>
    );
  }

  if (!itemData) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F9F8FA]">
        <Text className="text-xl">ไม่พบข้อมูลสินค้า</Text>
        <Pressable className="mt-4 p-3 bg-gray-300 rounded-xl" onPress={() => router.back()}>
          <Text>กลับ</Text>
        </Pressable>
      </View>
    );
  }

  const isEnoughPoints = userPoints >= itemData.Point_Usage;

  return (
    // 🌟 เอา pt-12 ออก แล้วใช้ paddingTop ตามระยะของ insets.top ของเครื่องนั้นๆ แทน
    <View className='flex-1 bg-[#F9F8FA]' style={{ paddingTop: insets.top }}>
      
      {/* 🌟 ปรับระยะปุ่มย้อนกลับให้ลอยลงมาจากขอบบนของจออย่างสมมาตร */}
      <Pressable 
        className='absolute left-5 z-50 bg-white/80 rounded-full p-2 shadow-sm' 
        style={{ top: insets.top + 10 }}
        onPress={() => { router.back() }}
      >
        <Image className='w-8 h-8' source={require(`@/assets/images/back1.png`)} />
      </Pressable>

      <ScrollView 
        className='flex-1' 
        // 🌟 เผื่อระยะด้านล่างของ ScrollView โดยใช้ insets.bottom + 100 เพื่อให้ดันปุ่มแลกคะแนนพ้นขอบจอล่างแบบสวยๆ
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 100 }} 
        showsVerticalScrollIndicator={false}
      >
        
        <View className='w-full h-[320px] bg-white items-center justify-center pt-8 rounded-t-3xl overflow-hidden'>
          <Image className='w-full h-full' resizeMode="contain" source={{ uri: itemData.Item_Image_path }} />
        </View>

        <View className='px-5 mt-6'>
          <View className='flex flex-row justify-between items-center'>
            <Text className='text-lg font-bold text-[#1E8B79]'>
              ใช้ {itemData.Point_Usage} คะแนน
            </Text>
            <Text className={`text-base font-bold ${isEnoughPoints ? 'text-[#1E8B79]' : 'text-red-500'}`}>
              คะแนนของคุณ: {userPoints}
            </Text>
          </View>

          <Text className='text-3xl font-bold mt-3 text-gray-800'>{itemData.Item_name}</Text>
          
          <Text className='text-xl font-bold mt-6 text-gray-800'>รายละเอียด</Text>
          <Text className='text-base mt-2 text-gray-600 leading-6'>
            จำกัดสิทธิ์การแลก: {itemData.Usage_Limit} สิทธิ์ {'\n'}
            หมดเขต: {new Date(itemData.Expire_Date).toLocaleDateString("th-TH")}
          </Text>

          <Text className='text-xl font-bold mt-6 text-gray-800'>เงื่อนไขและข้อตกลง</Text>
          <Text className='text-base mt-2 text-gray-600 leading-6'>
            วิธีการได้รับคะแนน {"\n"}
            คุณจะได้คะแนนเมื่อทำกิจกรรมดังต่อไปนี้ {"\n"}
            1. ถ่ายรูปเพื่อคัดแยกขยะ รับ 1 คะแนน <Text className='text-[#FF0000]'>(จำกัดวันละ 5 ครั้ง)</Text>  {"\n"}
            2. เข้าร่วมกิจกรรมร่วมด้วยช่วยกันแยก รับ 1 คะแนน  <Text className='text-[#FF0000]'>(จำกัดวันละ 5 ครั้ง)</Text>
          </Text>
        </View>

        <View className='px-5 mt-10'>
          <Pressable 
            className={`py-4 w-full items-center rounded-2xl shadow-sm ${isEnoughPoints ? 'bg-[#1E8B79]' : 'bg-gray-400'}`} 
            onPress={() => isEnoughPoints ? setOpen(true) : Alert.alert("คะแนนไม่พอ", "คุณมีคะแนนไม่เพียงพอที่จะแลกรางวัลนี้")}
          >
            <Text className='text-xl font-bold text-white'>{isEnoughPoints ? 'ยืนยันการแลกคะแนน' : 'คะแนนไม่เพียงพอ'}</Text>
          </Pressable>
        </View>

      </ScrollView>

      {/* Modal ยืนยัน */}
      {open && (
        <Modal transparent visible={open} animationType="fade" statusBarTranslucent={true}>
          <View className="flex-1 bg-black/60 justify-center items-center px-6">
            <View className="bg-white w-full p-8 rounded-3xl items-center shadow-2xl">
              <Text className="text-2xl font-bold text-gray-800 text-center leading-10">
                ยืนยันการแลกคะแนน {'\n'} <Text className="text-[#1E8B79] text-3xl">{itemData.Point_Usage}</Text> คะแนน
              </Text>

              <View className='flex flex-row w-full justify-between mt-8'>
                <Pressable
                  className="bg-[#ED5353] w-[45%] py-4 rounded-xl items-center"
                  onPress={() => setOpen(false)}
                  disabled={redeeming}
                >
                  <Text className="text-white text-lg font-bold">ยกเลิก</Text>
                </Pressable>

                <Pressable
                  className={`w-[45%] py-4 rounded-xl items-center ${redeeming ? 'bg-gray-400' : 'bg-[#1E8B79]'}`}
                  onPress={handleRedeem}
                  disabled={redeeming}
                >
                  {redeeming ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-lg font-bold">ยืนยัน</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}

export default Item;