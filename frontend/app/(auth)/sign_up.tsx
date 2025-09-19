import {
    View, KeyboardAvoidingView, Platform, TextInput, Text, Image, TouchableOpacity,
    ScrollView, TouchableWithoutFeedback, Keyboard, SafeAreaView
} from 'react-native'
import { useState } from 'react'
import axios from 'axios'
import { useNavigation } from "@react-navigation/native";
import { StackActions } from '@react-navigation/native';

const Sign_Up = () => {
    const [fullname, setFullname] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const navigation = useNavigation();
    const handleSubmit = async () => {
        try {
            if (password !== confirmPassword) {
                setError('password ไม่ตรงกัน')
                return;
            }
            const response = await axios.post("http://192.168.1.104:3000/auth/register", //ตอนนี้อ้างอิง ip ของ pc ที่เรากำลัง run backend ไปก่อน
                {
                    User_name: username,
                    User_password: password,
                    Full_name: fullname
                }
            )

            navigation.dispatch(StackActions.replace('??'));
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#132119" }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="flex-1 items-center justify-center bg-[#132119]">
                            <Image source={require('@/assets/images/im3.png')} />
                            <Text className='text-[#96C5A9] text-2xl pt-4 font-bold'>
                                แอปพลิเคชันคัดแยกขยะ
                            </Text>

                            {/* Fullname */}
                            <View className="flex-row items-center mt-8 bg-[#264433] rounded-xl w-80 h-16 px-4">
                                <TextInput
                                    value={fullname}
                                    onChangeText={setFullname}
                                    placeholder="Fullname"
                                    placeholderTextColor="#96C5A9"
                                    className="flex-1 text-[#96C5A9] text-lg"
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Username */}
                            <View className="flex-row items-center mt-5 bg-[#264433] rounded-xl w-80 h-16 px-4">
                                <TextInput
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Username"
                                    placeholderTextColor="#96C5A9"
                                    className="flex-1 text-[#96C5A9] text-lg"
                                    autoCapitalize="none"
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Password */}
                            <View className="flex-row items-center mt-5 bg-[#264433] rounded-xl w-80 h-16 px-4">
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Password"
                                    placeholderTextColor="#96C5A9"
                                    className="flex-1 text-[#96C5A9] text-lg"
                                    secureTextEntry
                                    autoCapitalize="none"
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Confirm Password */}
                            <View className="flex-row items-center mt-5 bg-[#264433] rounded-xl w-80 h-16 px-4">
                                <TextInput
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm Password"
                                    placeholderTextColor="#96C5A9"
                                    className="flex-1 text-[#96C5A9] text-lg"
                                    secureTextEntry
                                    autoCapitalize="none"
                                    returnKeyType="done"
                                />
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                className='mt-8 bg-[#39E17B] rounded-xl w-80 h-16 items-center justify-center'
                                onPress={handleSubmit}
                            >
                                <Text className='text-[#12241A] text-xl font-bold'>สมัครสมาชิก</Text>
                            </TouchableOpacity>

                            {error ? <Text className='text-red-500 mt-2'>{error}</Text> : null}
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default Sign_Up
