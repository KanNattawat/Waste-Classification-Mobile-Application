import { View, TextInput, Text, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal, Pressable } from 'react-native';
import { useState } from 'react';
import axios from 'axios';
import { Redirect, useRouter } from 'expo-router';
import { API_URL } from "@/config";

const Reset = () => {
    const [email, setEmail] = useState('');
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        setOpen(true)
        const response = await axios.post(`${API_URL}/auth/sendForgotpassword`,
            { email: email }
        );
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-[#F9F8FA]"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', padding: 24 }}>

                <Pressable className='absolute top-10 left-7 z-50' onPress={() => { router.back() }}>
                    <Image source={require('@/assets/images/back1.png')} />
                </Pressable>

                <Image source={require('@/assets/images/im3.png')} className='w-32 h-32 mt-8' />
                <Text className='text-[#000000] text-2xl pt-8 font-bold text-center'>แอปพลิเคชันคัดแยกขยะ</Text>

                <View className='w-[90%] mt-16'>
                    <Text className='text-lg font-bold text-black text-start'>ค้นหาบัญชีของคุณด้วยการกรอก Email</Text>
                </View>

                {/* Email Input */}
                <View className="flex-row items-center mt-4 bg-white border-2 border-black rounded-xl w-[90%] h-16 px-4">
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        placeholderTextColor="black"
                        className="flex-1 text-black text-xl"
                    />
                </View>



                <TouchableOpacity
                    activeOpacity={0.7}
                    className='mt-4 bg-[#1E8B79] rounded-xl w-60 h-16 items-center justify-center'
                    onPress={handleSubmit}
                >
                    <Text className='text-white text-xl font-bold'>ยืนยัน</Text>
                </TouchableOpacity>
                {open &&
                    <Modal transparent visible={open} animationType="fade" statusBarTranslucent={true}>
                        <View className="flex-1 bg-black/60 justify-center items-center px-6">
                            <View className="bg-white w-full p-8 rounded-3xl items-center shadow-2xl">
                                <Text className="text-2xl font-bold text-gray-800 text-center leading-10">
                                    คำร้องการรีเซ็ทรหัสผ่านของคุณถูกส่งไปที่อีเมลของคุณแล้ว
                                </Text>

                                <View className='flex flex-row w-full justify-center mt-8'>
                                    <Pressable
                                        className="bg-[#1E8B79] w-[45%] py-4 rounded-xl items-center"
                                        onPress={() => { router.back() }}
                                    >
                                        <Text className="text-white text-lg font-bold">ยืนยัน</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </Modal>}

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Reset;
