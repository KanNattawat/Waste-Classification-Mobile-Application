import React, { useState, useEffect } from 'react';
import { Text, View, Image, Pressable, Modal, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const Item = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

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

      // 1. ดึงข้อมูลสินค้า (ใช้ API จากรอบที่แล้ว)
      const itemRes = await fetch(`https://waste-classification-mobile-application.onrender.com/manage/getallitem/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const itemJson = await itemRes.json();
      
      // 2. ดึงข้อมูล User (เพื่อเอา Points มาแสดง)
      const userRes = await fetch(`https://waste-classification-mobile-application.onrender.com/getMe`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userJson = await userRes.json();

      setItemData(itemJson);
      setUserPoints(userJson.Points || 0);

    } catch (error) {
      console.error(error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  // 🌟 ฟังก์ชันจัดการตอนกดยืนยันแลกแต้ม
  const handleRedeem = async () => {
    try {
      setRedeeming(true);
      // 🌟 ใช้ SecureStore ดึง Token
      const token = await SecureStore.getItemAsync('authToken');

      const res = await fetch(`https://waste-classification-mobile-application.onrender.com/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: id }) // ส่งแค่ ID สินค้าไป
      });

      const result = await res.json();

      if (res.ok) {
        setOpen(false);
        Alert.alert("สำเร็จ", `แลก ${itemData.Item_name} เรียบร้อยแล้ว!`, [
          { text: "ตกลง", onPress: () => router.back() } // แลกเสร็จให้เด้งกลับไปหน้าเดิม
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
    <View className='relative flex justify-start w-full h-full bg-[#F9F8FA]'>

      {/* รูปภาพสินค้า */}
      <View className='w-full h-[40%] bg-white object-cover'>
        <Pressable className='absolute left-5 top-12 z-50 bg-white/70 rounded-full p-2' onPress={() => { router.back() }}>
          <Image className=' w-10 h-10 ' source={require(`@/assets/images/back1.png`)} />
        </Pressable>
        {/* ดึงรูปจาก URL S3 */}
        <Image className='w-full h-full' resizeMode="contain" source={{ uri: itemData.Item_Image_path }} />
      </View>

      <View className='flex flex-row justify-between mx-4 mt-4'>
        <Text className='text-lg font-bold text-[#1E8B79]'>
          ใช้ {itemData.Point_Usage} คะแนน
        </Text>
        <Text className={`text-lg font-bold ${isEnoughPoints ? 'text-[#1E8B79]' : 'text-red-500'}`}>
          คะแนนของคุณ {userPoints}
        </Text>
      </View>

      <Text className='text-2xl font-bold mx-4 mt-2'>แลกรับ {itemData.Item_name}</Text>
      
      <Text className='text-xl font-bold mx-4 mt-4'>รายละเอียด</Text>
      <Text className='text-lg mx-4 mt-2 text-gray-600'>
        จำกัดสิทธิ์การแลก: {itemData.Usage_Limit} สิทธิ์ {'\n'}
        หมดเขต: {new Date(itemData.Expire_Date).toLocaleDateString("th-TH")}
      </Text>

      <Text className='text-xl font-bold mx-4 mt-6'>เงื่อนไขและข้อตกลง</Text>
      <Text className='text-md mx-4 mt-2 text-gray-600'>
        วิธีการได้รับคะแนน {"\n"}
        คุณจะได้คะแนนเมื่อทำกิจกรรมดังต่อไปนี้ {"\n"}
        1. ถ่ายรูปเพื่อคัดแยกขยะ รับ 1 คะแนน <Text className='text-[#FF0000]'>(จำกัดวันละ 5 ครั้ง)</Text>  {"\n"}
        2. เข้าร่วมกิจกรรมร่วมด้วยช่วยกันแยก รับ 1 คะแนน  <Text className='text-[#FF0000]'>(จำกัดวันละ 5 ครั้ง)</Text>
      </Text>

      <View className='flex flex-row w-full justify-center mt-auto mb-10'>
        {/* 🌟 ถ้าแต้มไม่พอ ปุ่มจะจางลงและกดไม่ได้ */}
        <Pressable 
          className={`mt-4 py-4 px-8 rounded-xl ${isEnoughPoints ? 'bg-[#1E8B79]' : 'bg-gray-400'}`} 
          onPress={() => isEnoughPoints ? setOpen(true) : Alert.alert("คะแนนไม่พอ", "คุณมีคะแนนไม่เพียงพอที่จะแลกรางวัลนี้")}
        >
          <Text className='text-xl font-bold text-white'>{isEnoughPoints ? 'ยืนยันการแลกคะแนน' : 'คะแนนไม่เพียงพอ'}</Text>
        </Pressable>
      </View>

      {/* Modal ยืนยัน */}
      {open &&
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
                  disabled={redeeming} // ป้องกันการกดย้ำๆ
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
        </Modal>}
    </View>
  )
}

export default Item;