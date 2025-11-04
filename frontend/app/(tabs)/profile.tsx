import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/config";
import { useFocusEffect } from "@react-navigation/native";

export default function ProfileScreen() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const { setToken } = useAuth();

    const getmefunc = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');
            if (!token) return;

            const response = await fetch(`${API_URL}/getme`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch user info');
            const data = await response.json();
            setUser(data);
        } catch (error) {
            console.log(error);
        }
    };

    const getStats = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');
            if (!token) return;

            const response = await fetch(`${API_URL}/getstats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.log(error);
        }
    };

    const useLogout = () => {
        const handleLogout = async () => {
            try {
                await SecureStore.deleteItemAsync('authToken');
                setToken("");
            } catch (error) {
                console.log("Logout error:", error);
            }
        };
        return { handleLogout };
    };
    const { handleLogout } = useLogout();

    useFocusEffect(
        useCallback(() => {
            getmefunc();
            getStats();
        }, [])
    );

    return (
        <View className="flex-1 bg-[#F8FDF9] pt-16">
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                {/* Header */}
                <View className="items-center mb-8">
                    <Text className="text-3xl font-bold text-[#4C944C]">โปรไฟล์</Text>
                    <Text className="text-2xl font-semibold mt-6">
                        {user ? user.Full_name : "Loading..."}
                    </Text>
                    <Text className="text-gray-500 text-xl">
                        {user ? user.User_name : ""}
                    </Text>
                </View>

                {/* Stats */}
                <Text className="text-2xl font-semibold mb-2">สถิติการคัดแยกขยะ</Text>
                <View className="bg-white rounded-2xl shadow p-4 mb-10">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl text-gray-700 font-semibold">
                            แยกขยะไปแล้วทั้งหมด
                        </Text>
                        <Text className="text-green-600 text-2xl font-bold">
                            {stats ? stats.total : "..."}
                        </Text>
                    </View>

                    {['hazard', 'biodegradable', 'general', 'recyclable'].map((type, idx) => {
                        const colors = ['red-500', 'green-500', 'blue-500', 'yellow-400'];
                        const labels = ['ขยะอันตราย', 'ขยะย่อยสลาย', 'ขยะทั่วไป', 'ขยะรีไซเคิล'];
                        return (
                            <View key={type} className="flex-row justify-between items-center mb-2">
                                <View className="flex-row items-center">
                                    <View className={`w-3 h-3 rounded-full bg-${colors[idx]} mr-2`} />
                                    <Text className="text-gray-600 text-2xl">{labels[idx]}</Text>
                                </View>
                                <Text className="text-gray-600 text-2xl">{stats ? stats[type] : "..."}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Logout button */}
                <TouchableOpacity className="bg-green-600 py-3 rounded-xl items-center" onPress={handleLogout}>
                    <Text className="text-white font-semibold">ออกจากระบบ</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
