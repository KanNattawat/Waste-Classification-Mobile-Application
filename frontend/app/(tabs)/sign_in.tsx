import { View, KeyboardAvoidingView, Platform, TextInput, Text, Image, TouchableOpacity } from 'react-native'
import { useState } from 'react'
const Sign_in = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  return (
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === "ios" ? "padding" : "height"}
    // >
    <View className="flex-1 items-center justify-center bg-[#132119] pt-20">
      <Image source={require('@/assets/images/im3.png')} />
      <Text className='text-[#96C5A9] text-2xl pt-4 font-bold'>แอปพลิเคชันคัดแยกขยะ</Text>
      {/* Username Input */}
      <View className="flex-row items-center mt-10 bg-[#264433] rounded-xl w-80 h-16 px-4">
        <Image
          source={require('@/assets/images/User.png')}
          className="w-7 h-7 mr-3"
          resizeMode="contain"
        />
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor="#96C5A9"
          className="flex-1 text-[#96C5A9] text-lg"
        />
      </View>
      {/* Password Input */}
      <View className="flex-row items-center mt-10 bg-[#264433] rounded-xl w-80 h-16 px-4">
        <Image
          source={require('@/assets/images/Lock.png')}
          className="w-7 h-7 mr-3"
          resizeMode="contain"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#96C5A9"
          className="flex-1 text-[#96C5A9] text-lg"
        />
      </View>

      <TouchableOpacity
      activeOpacity={0.7}
      className='mt-10 bg-[#39E17B] rounded-xl w-80 h-16 items-center justify-center'>
        <View>
          <Text className='text-[#12241A] text-xl font-bold'>เข้าสู่ระบบ</Text>
        </View>
      </TouchableOpacity>

      <View className='flex-1 justify-end mb-10'>
        <Text className='text-white underline'>สร้างบัญชี</Text>
      </View>
      

    </View>

    // </KeyboardAvoidingView>
  )
}

export default Sign_in
