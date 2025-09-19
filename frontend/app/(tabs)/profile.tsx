import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { useAuth } from "@/contexts/AuthContext";
export default function ProfileScreen() {
    const [user, setUser] = useState(null);
      const { setToken } = useAuth()
    const getmefunc = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken')
            console.log(token)
            if (!token) {
                console.log("No token found");
                return;
            }

            const response = await fetch('http://193.168.182.241:3000/getme', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log(response)

            if (!response.ok) {
                console.log("Response status:", response.status)
                throw new Error('Failed to fetch user info');
            }

            const data = await response.json();
            setUser(data);
        } catch (error) {
            console.log(error);
        }
    }

    const useLogout = () => {

    const handleLogout = async () => {
        try {
            await SecureStore.deleteItemAsync('authToken');
            console.log("Logout success!");
            setToken("")
        } catch (error) {
            console.log("Logout error:", error);
        }
    };

    return { handleLogout };
};
    const { handleLogout } = useLogout();


    useEffect(() => {
        getmefunc();
    }, []);

    return (
        <View className="flex-1 bg-[#F8FDF9] px-6 py-10 pt-16">
            <View className="items-center mb-8">
                <Text className="text-3xl font-bold text-[#4C944C]">โปรไฟล์</Text>
                <Text className="text-2xl font-semibold mt-6">
                    {user ? user.Full_name : "Loading..."}
                </Text>
                <Text className="text-gray-500 text-xl">
                    {user ? user.User_name : ""}
                </Text>
            </View>

            <Text className="text-2xl font-semibold mb-2">สถิติการคัดแยกขยะ</Text>
            <View className="bg-white rounded-2xl shadow p-4 mb-10">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-2xl text-gray-700 font-semibold">
                        แยกขยะไปแล้วทั้งหมด
                    </Text>
                    <Text className="text-green-600 text-2xl font-bold">100</Text>
                </View>

                <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                        <Text className="text-gray-600 text-2xl">ขยะอันตราย</Text>
                    </View>
                    <Text className="text-gray-600 text-2xl">25</Text>
                </View>

                <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                        <Text className="text-gray-600 text-2xl">ขยะย่อยสลาย</Text>
                    </View>
                    <Text className="text-gray-600 text-2xl">25</Text>
                </View>

                <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                        <Text className="text-gray-600 text-2xl">ขยะทั่วไป</Text>
                    </View>
                    <Text className="text-gray-600 text-2xl">25</Text>
                </View>

                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full bg-yellow-400 mr-2" />
                        <Text className="text-gray-600 text-2xl">ขยะรีไซเคิล</Text>
                    </View>
                    <Text className="text-gray-600 text-2xl">25</Text>
                </View>
            </View>

            <TouchableOpacity className="bg-green-600 py-3 rounded-xl items-center" onPress={handleLogout}>
                <Text className="text-white font-semibold">ออกจากระบบ</Text>
            </TouchableOpacity>
        </View>
    );
}
