import { View, KeyboardAvoidingView, Platform, TextInput, Text, Image, TouchableOpacity } from 'react-native'
import { use, useState } from 'react'
const Sign_Up = () => {
    const [fullname, setFullname] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    return (
        // <KeyboardAvoidingView
        //   behavior={Platform.OS === "ios" ? "padding" : "height"}
        // >
        <View className="flex-1 items-center justify-center bg-[#132119]">
            <Image source={require('@/assets/images/im3.png')} />
            <Text className='text-[#96C5A9] text-2xl pt-4 font-bold'>แอปพลิเคชันคัดแยกขยะ</Text>

            {/* Fullname Input */}
            <View className="flex-row items-center mt-10 bg-[#264433] rounded-xl w-80 h-16 px-4">
                <TextInput
                    value={fullname}
                    onChangeText={setFullname}
                    placeholder="Fullname"
                    placeholderTextColor="#96C5A9"
                    className="flex-1 text-[#96C5A9] text-lg"
                />
            </View>

            {/* Username Input */}
            <View className="flex-row items-center mt-10 bg-[#264433] rounded-xl w-80 h-16 px-4">
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
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#96C5A9"
                    className="flex-1 text-[#96C5A9] text-lg"
                />
            </View>

            <View className="flex-row items-center mt-10 bg-[#264433] rounded-xl w-80 h-16 px-4">
                <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm Password"
                    placeholderTextColor="#96C5A9"
                    className="flex-1 text-[#96C5A9] text-lg"
                />
            </View>

            <TouchableOpacity
                activeOpacity={0.7}
                className='mt-10 bg-[#39E17B] rounded-xl w-80 h-16 items-center justify-center'>
                <View>
                    <Text className='text-[#12241A] text-xl font-bold'>สมัครสมาชิก</Text>
                </View>
            </TouchableOpacity>




        </View>

        // </KeyboardAvoidingView>
    )
}

export default Sign_Up
