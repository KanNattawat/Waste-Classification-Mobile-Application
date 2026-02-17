import React from 'react'
import { Text, View, Image, Pressable, Modal } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'

const Item = () => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  return (
    <View className='relative flex justify-start w-full h-full bg-[#F9F8FA]'>



      <View className='w-full max-h-[40%] object-cover'>
        <Pressable className='absolute left-5 top-10 z-50' onPress={() => { router.push('/point') }}>
          <Image className=' w-14 h-14 ' source={require(`@/assets/images/back1.png`)} />
        </Pressable>
        <Image className='w-full h-full' source={require(`@/assets/images/item.png`)} />
      </View>

      <View className='flex flex-row justify-between mx-2 mt-2'>
        <Text className='text-lg text-[#1E8B79]'>
          ใช้ 100 คะแนน
        </Text>
        <Text className='text-lg text-[#1E8B79]'>
          คะแนนของคุณ 10
        </Text>
      </View>

      <Text className='text-2xl font-bold mx-2'>แลกรับ ถุงผ้ารักษ์โลก</Text>
      <Text className='text-xl font-bold mx-2 mt-2'>รายละเอียด</Text>
      <Text className='text-lg mx-2 mt-2'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat
      </Text>
      <Text className='text-xl font-bold mx-2 mt-2'>เงื่อนไขและข้อตกลง</Text>
      <Text className='text-lg mx-2 mt-2'>
        วิธีการได้รับคะแนน {"\n"}
        คุณจะได้คะแนนเมื่อทำกิจกรรมดังต่อไปนี้ {"\n"}
        1.ถ่ายรูปเพื่อคัดแยกขยะ รับ 1 คะแนน <Text className='text-[#FF0000]'>(จำกัดวันละ 5 ครั้ง)</Text>  {"\n"}
        2.เข้าร่วมกิจกรรมร่วมด้วยช่วยกันแยก รับ 1 คะแนน  <Text className='text-[#FF0000]'>(จำกัดวันละ 5 ครั้ง)</Text>
      </Text>

      <View className='flex flex-row w-full justify-center mt-2'>
        <Pressable className='mt-4 bg-[#1E8B79]  py-3 px-4 rounded-xl' onPress={() => setOpen(true)}>
          <Text className='text-xl text-white'>ยืนยันการแลกคะแนน</Text>
        </Pressable>
      </View>

      {open &&
        <Modal transparent visible={open} animationType="fade" statusBarTranslucent={true}>
          <View className="flex-1 bg-black/60 justify-center items-center px-6">
            <View className="bg-white w-full p-6 rounded-3xl items-center shadow-2xl">
              <Text className="text-2xl font-bold text-gray-800 text-center">ยืนยันการแลกคะแนน {'\n'} 100 คะแนน</Text>


              <View className='flex flex-row w-full justify-evenly'>
                <Pressable
                  className="mt-8 bg-[#ED5353] w-[47%] py-4 rounded-xl items-center"
                  onPress={() => setOpen(false)}
                >
                  <Text className="text-white text-lg font-bold">ยกเลิก</Text>
                </Pressable>

                <Pressable
                  className="mt-8 bg-[#1E8B79] w-[47%] py-4 rounded-xl items-center"
                  onPress={() => setOpen(false)}
                >
                  <Text className="text-white text-lg font-bold">ยืนยัน</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>}
    </View>
  )
}

export default Item