import { View, TextInput, Text, Image, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import axios from 'axios'
import * as SecureStore from "expo-secure-store";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

const Sign_in = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { setToken } = useAuth()
  const router = useRouter()

  const handleSubmit = async () => {
    try {
      const response = await axios.post("http://3.27.46.182:3000/auth/login", //ตอนนี้อ้างอิง ip ของ pc ที่เรากำลัง run backend ไปก่อน
        {
          User_name: username,
          User_password: password
        }
      )
      const token = response.data.token;
      await SecureStore.setItem("authToken", token)
      await AsyncStorage.setItem("userId", String(response.data.userId));
      setToken(token)
      console.log(token)
      console.log(response.data.userId)

    } catch (error) {
      console.log(error)
    }
  }

  return (
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
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        className='mt-10 bg-[#39E17B] rounded-xl w-80 h-16 items-center justify-center'
        onPress={handleSubmit}>
        <View>
          <Text className='text-[#12241A] text-xl font-bold'>เข้าสู่ระบบ</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { router.navigate('/(auth)/sign_up'); }}>
        <View className='justify-end mt-56'>
          <Text className='text-white underline text-xl'>สร้างบัญชี</Text>
        </View>
      </TouchableOpacity>



    </View>
  )
}

export default Sign_in
