import React from 'react'
import { Text, View, Image, Pressable, SafeAreaView } from 'react-native';
import { shadow } from "@/styles/shadow";
import ScreenScroll from "@/components/ScreenScroll";
import { useRouter } from "expo-router";

export default function Point() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 flex-col bg-[#F9F8FA] min-h-full">
      <ScreenScroll>
        <View className='flex items-center mt-10'>
          <Text className='text-3xl font-bold text-[#1E8B79] text-center mb-3'>แลกรางวัล</Text>
          <View className='flex flex-col w-screen px-8'>

            <View className='flex-row items-center bg-white shadow-xl px-8 py-4 rounded-xl' style={shadow.card}>
              <View className='flex-1'>
                <Text className='text-xl'>Adam Smith</Text>
                <View className='flex flex-row items-center'>
                  <Image className='w-8 h-8 mr-2' source={require("@/assets/images/coin.png")} />
                  <Text className='text-xl' ><Text className='text-[#1E8B79]'>100</Text> คะแนน</Text>
                </View>
              </View>
              <Pressable onPress={() => { router.push('/pointHistory') }}>
                <Image
                  className='w-8 h-8'
                  source={require("@/assets/images/clock.png")} />
              </Pressable>
            </View>

            <Pressable className='h-24 w-full mt-4 rounded-xl overflow-hidden ' style={shadow.card} onPress={() => router.push(`/event`)}
            >
              <Image
                className='w-full h-full'
                resizeMode="cover"
                source={require("@/assets/images/event.png")}
              />
            </Pressable>

            <Text className='text-xl my-2'>รางวัล</Text>

            <View className='flex flex-row flex-wrap gap-3 items-center justify-between'>
              {/* 1 item */}
              <Pressable className='flex items-center gap-2 bg-white rounded-xl p-2 w-[48%]' style={shadow.card} onPress={()=>router.push('/item')}>
                <Image className="w-full h-32 max-w-[120px]"
                source={require("@/assets/images/item.png")} />
                <Text className='text-xl text-center' numberOfLines={1}>ถุงผ้ารักษ์โลก</Text>
                <View className='flex flex-row items-center'>
                  <Image className='w-4 h-4 mr-2' source={require("@/assets/images/coin.png")} />
                  <Text className='text-lg' ><Text className='text-[#1E8B79]'>100</Text> คะแนน</Text>
                </View>
              </Pressable>




            </View>
          </View>
        </View>
      </ScreenScroll>
    </SafeAreaView>
  )
};

