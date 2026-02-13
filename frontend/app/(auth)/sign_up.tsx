import {
    View, KeyboardAvoidingView, Platform, TextInput, Text, Image,
    TouchableOpacity, ScrollView, TouchableWithoutFeedback, Keyboard, SafeAreaView
} from 'react-native';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { API_URL } from "@/config";

const Sign_Up = () => {
    const [fullname, setFullname] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async () => {
        try {
            console.log(API_URL)
            if (password !== confirmPassword) {
                setError('Password ไม่ตรงกัน');
                return;
            }
            await axios.post(`${API_URL}/auth/register`, {
                User_name: username,
                User_password: password,
                Full_name: fullname,
                Email : email
            });

            router.replace('/(auth)/sign_in');
        } catch (error) {
            console.log(error);
            setError('เกิดข้อผิดพลาด โปรดลองใหม่');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F8FA" }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            alignItems: 'center',
                            paddingVertical: 40,
                            paddingHorizontal: 24
                        }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Image source={require('@/assets/images/im3.png')} className='w-48 h-48 mt-8' />
                        <Text className='text-black text-2xl pt-8 font-bold text-center'>
                            แอปพลิเคชันคัดแยกขยะ
                        </Text>

                        {/* Fullname */}
                        <View className="flex-row items-center mt-8 bg-white border-2 border-black rounded-xl w-[80%] h-16 px-4">
                            <TextInput
                                value={fullname}
                                onChangeText={setFullname}
                                placeholder="Full Name"
                                placeholderTextColor="#000000"
                                className="flex-1 text-[#000000] text-xl"
                                returnKeyType="next"
                            />
                        </View>

                        {/* Username */}
                        <View className="flex-row items-center mt-8 bg-white border-2 border-black rounded-xl w-[80%] h-16 px-4">
                            <TextInput
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Username"
                                placeholderTextColor="#000000"
                                className="flex-1 text-[#000000] text-xl"
                                autoCapitalize="none"
                                returnKeyType="next"
                            />
                        </View>

                        {/* Email */}
                        <View className="flex-row items-center mt-8 bg-white border-2 border-black rounded-xl w-[80%] h-16 px-4">
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Email"
                                placeholderTextColor="#000000"
                                className="flex-1 text-[#000000] text-xl"
                                autoCapitalize="none"
                                returnKeyType="next"
                            />
                        </View>

                        {/* Password */}
                        <View className="flex-row items-center mt-8 bg-white border-2 border-black rounded-xl w-[80%] h-16 px-4">
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Password"
                                placeholderTextColor="#000000"
                                className="flex-1 text-[#000000] text-xl"
                                secureTextEntry
                                autoCapitalize="none"
                                returnKeyType="next"
                            />
                        </View>

                        {/* Confirm Password */}
                        <View className="flex-row items-center mt-8 bg-white border-2 border-black rounded-xl w-[80%] h-16 px-4">
                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm Password"
                                placeholderTextColor="#000000"
                                className="flex-1 text-[#000000] text-xl"
                                secureTextEntry
                                autoCapitalize="none"
                                returnKeyType="done"
                            />
                        </View>



                        {/* Sign Up Button */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className='mt-14 bg-[#1E8B79] rounded-xl w-60 h-16 items-center justify-center'
                            onPress={handleSubmit}
                        >
                            <Text className='text-[#FFFFFF] text-2xl font-bold'>สมัครสมาชิก</Text>
                        </TouchableOpacity>
                        {error ? <Text className='text-red-500 mt-14 text-lg underline text-center'>{error}</Text> : null}
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Sign_Up;
