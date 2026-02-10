import React, { useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { shadow } from "@/styles/shadow";

const EventDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isChecked, setIsChecked] = useState(false);

  return (
    <View className='flex bg-[#F9F8FA] w-full h-full justify-start items-center'>
      <View className='flex w-full max-w-[340px] mt-16' >
        <Image
          className='w-full h-[200px] rounded-lg' source={require(`@/assets/images/test1.png`)}
          resizeMode='cover'

        />
      </View>

      <View className='flex p-8 w-full h-full'>

        <View className='w-full bg-white rounded-lg p-4' style={shadow.card}>
          <View className='flex flex-row justify-center w-full'>
            <View className='flex-1'><Text className='text-xl'>ผลลัพธ์ปัจจุบัน</Text></View>
            <View className='flex-1 items-end'><Text className='text-xl font-bold'>ขยะอันตราย (90%)</Text></View>
          </View>
          <View className='flex flex-row justify-center w-full'>
            <View className='flex-1'><Text className='text-xl'>ผลลัพธ์จากระบบ</Text></View>
            <View className='flex-1 items-end'><Text className='text-xl font-bold'>ขยะทั่วไป</Text></View>
          </View>
        </View>

        <View className='w-full bg-white rounded-lg p-4 mt-8' style={shadow.card}>

          <View className='flex items-end '>
            <Text className='text-lg text-end'>คนโหวตจำนวน 5 คน</Text>
          </View>

          <View className='flex mx-2 w-full mt-4 justify-center gap-y-4'>


            <View className='bg-[#CCCCCC] rounded-lg overflow-hidden'>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsChecked(!isChecked)}
                className='bg-[#EF4545] mr-8 rounded-lg flex-row items-center px-3 py-1'
              >
                <View className={`w-6 h-6 border-2 border-[#CCCCCC] bg-white rounded-md mr-3 justify-center items-center `}>
                  {isChecked && (
                    <Text className="text-black font-bold text-xs">✓</Text>
                  )}
                </View>
                <View className='flex flex-row justify-between items-center w-full'>
                  <Text className='text-xl text-white font-bold'>
                    ขยะอันตราย
                  </Text>
                  <View className='flex items-center'>
                    <Text className='text-xl text-white font-bold'>90%</Text>
                    <Text className='text-lg text-white font-bold'>จำนวน 2 คน</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View className='bg-[#CCCCCC] rounded-lg overflow-hidden'>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsChecked(!isChecked)}
                className='bg-[#28C45C] mr-8 rounded-lg flex-row items-center px-3 py-1'
              >
                <View className={`w-6 h-6 border-2 border-[#CCCCCC] bg-white rounded-md mr-3 justify-center items-center `}>
                  {isChecked && (
                    <Text className="text-black font-bold text-xs">✓</Text>
                  )}
                </View>
                <View className='flex flex-row justify-between items-center w-full'>
                  <Text className='text-xl text-white font-bold'>
                    ขยะอินทรีย์
                  </Text>
                  <View className='flex items-center'>
                    <Text className='text-xl text-white font-bold'>90%</Text>
                    <Text className='text-lg text-white font-bold'>จำนวน 2 คน</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View className='bg-[#CCCCCC] rounded-lg overflow-hidden'>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsChecked(!isChecked)}
                className='bg-[#2F98DD] mr-8 rounded-lg flex-row items-center px-3 py-1'
              >
                <View className={`w-6 h-6 border-2 border-[#CCCCCC] bg-white rounded-md mr-3 justify-center items-center `}>
                  {isChecked && (
                    <Text className="text-black font-bold text-xs">✓</Text>
                  )}
                </View>
                <View className='flex flex-row justify-between items-center w-full'>
                  <Text className='text-xl text-white font-bold'>
                    ขยะอินทรีย์
                  </Text>
                  <View className='flex items-center'>
                    <Text className='text-xl text-white font-bold'>90%</Text>
                    <Text className='text-lg text-white font-bold'>จำนวน 2 คน</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View className='bg-[#CCCCCC] rounded-lg overflow-hidden'>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsChecked(!isChecked)}
                className='bg-[#FCD92C] mr-8 rounded-lg flex-row items-center px-3 py-1'
              >
                <View className='w-6 h-6 border-2 border-[#CCCCCC] bg-white rounded-md mr-3 justify-center items-center '>
                  {isChecked && (
                    <Text className="text-black font-bold text-xs">✓</Text>
                  )}
                </View>
                <View className='flex flex-row justify-between items-center w-full'>
                  <Text className='text-xl text-white font-bold'>
                    ขยะอินทรีย์
                  </Text>
                  <View className='flex items-center'>
                    <Text className='text-xl text-white font-bold'>90%</Text>
                    <Text className='text-lg text-white font-bold'>จำนวน 2 คน</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>


          </View>

        </View>

      </View>
    </View>
  )
}

export default EventDetail