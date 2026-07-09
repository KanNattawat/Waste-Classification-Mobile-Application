import React, { useEffect, useState } from 'react';
import { Text, View, Image, Pressable, SafeAreaView, ScrollView } from 'react-native';
import { shadow } from "@/styles/shadow";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from "@/config";
import Loading from "@/components/loading";
import { useRouter } from "expo-router";
import { getImage } from "@/lib/s3Service";

const WASTE_LABEL: Record<number, string> = {
    1: "ขยะอินทรีย์",
    2: "ขยะอันตราย",
    3: "ขยะรีไซเคิล",
    4: "ขยะทั่วไป",
};
const wasteLabel = (id: number) => WASTE_LABEL[id] ?? "unknown";

type Waste = {
    Waste_ID: string;
    WasteType_ID: string;
    Image_path: string;
    type: string;
    Vote_wastetype: any;
    isVoted?: boolean;
};

const Index = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [waste, setWaste] = useState<Waste[]>();
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const getId = await AsyncStorage.getItem("userId");
            setUserId(getId);
        })();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            try {
                setLoading(true);
                console.log('getting data for user:', userId);

                const res = await axios.get(`${API_URL}/uniqueWaste`, {
                    params: {
                        userId: userId
                    }
                });

                const labels = ["Compostable", "Hazardous", "General", "Recyclable"];
                // map label กับ ผลโหวต EX output : [ ["Compostable", 5], ["Hazardous", 0], ["General", 2], ["Recyclable", 12] ]
                const wasteData = res.data.item.map((i: any) => {
                    let voteArray = i.Vote_wastetype;
                    if (typeof voteArray === 'string') {
                        try {
                            voteArray = JSON.parse(voteArray);
                        } catch (e) {
                            console.log("JSON Parse Error: ", e);
                            voteArray = [0, 0, 0, 0];
                        }
                    }

                    const voteNumber = voteArray.map((value: number, index: number) => {
                        return [labels[index], value];
                    });

                    return { ...i, Vote_wastetype: voteNumber };
                });

                const sortedVote = wasteData.map((i: any) => {
                    const getMostVote = i.Vote_wastetype.slice().sort((a: any, b: any) => b[1] - a[1]);
                    return { ...i, Vote_wastetype: getMostVote };
                });

                setWaste(sortedVote);

            } catch (error) {
                console.log("Fetch Error: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    if (loading) {
        return <Loading />;
    }

    const currentColorMap: { [key: string]: string } = {
        "1-text": "text-[#1A863E]",
        "2-text": "text-[#842A2A]",
        "3-text": "text-[#276F9F]",
        "4-text": "text-[#A99323]",
        "1-bg": "bg-[#E5FFED]",
        "2-bg": "bg-[#FFC8C8]",
        "3-bg": "bg-[#EDF8FF]",
        "4-bg": "bg-[#FFFCEB]"
    };

    const voteColorMap: { [key: string]: string } = {
        "Compostable-text": "text-[#1A863E]",
        "Hazardous-text": "text-[#842A2A]",
        "General-text": "text-[#276F9F]",
        "Recyclable-text": "text-[#A99323]",
        "Compostable-bg": "bg-[#E5FFED]",
        "Hazardous-bg": "bg-[#FFC8C8]",
        "General-bg": "bg-[#EDF8FF]",
        "Recyclable-bg": "bg-[#FFFCEB]"
    };

    return (
        <SafeAreaView className='flex-1 bg-[#F9F8FA] pt-10'>
            <Text className='text-center text-2xl font-bold text-[#1E8B79] mb-3'>Sort Together</Text>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} className='w-full'>
                <View className='flex-row items-center bg-white shadow-xl px-4 py-4 rounded-xl mb-4' style={shadow.card}>
                    <Text className='text-base text-gray-700 leading-6'>
                        The "Sort Together" activity empowers users to collectively review and correct AI misclassifications, improving system accuracy and driving efficient local waste management together.
                    </Text>
                </View>

                {(!waste || waste.length === 0) && (
                    <Text className='text-center mt-10 text-base text-gray-500'>No waste items available to vote.</Text>
                )}

                {waste?.map((item, index) =>
                    <Pressable
                        key={index}
                        className={`flex flex-row items-center bg-white p-3 my-2 rounded-xl w-full relative ${item.isVoted ? 'opacity-75' : 'opacity-100'}`}
                        style={shadow.card}
                        onPress={() => router.push(`/event/${item.Waste_ID}`)}
                    >
                        <Image source={{ uri: getImage(item.Image_path) }} className='w-[75px] h-[75px] rounded-lg' />

                        <View className='flex-1 flex-col ml-3 gap-y-2 justify-center'>

                            {/* ผลลัพธ์จากแอป */}
                            <View className='flex flex-row items-center justify-between'>
                                <Text className='text-sm font-medium text-gray-700 flex-shrink'>Result from application</Text>
                                <View className={`ml-2 ${currentColorMap[item.WasteType_ID + "-bg"]} rounded-md px-2 py-1 max-w-[55%]`}>
                                    <Text
                                        className={`text-sm ${currentColorMap[item.WasteType_ID + "-text"]} font-bold text-center`}
                                        numberOfLines={1}
                                    >
                                        {item.WasteType_ID == "1" ? "Compostable Waste" : item.WasteType_ID == "2" ? "Hazardous Waste" : item.WasteType_ID == "3" ? "General Waste" : "Recyclable Waste"}
                                    </Text>
                                </View>
                            </View>

                            {/* ผลลัพธ์จากคนโหวต */}
                            <View className='flex flex-row items-center justify-between'>
                                <Text className='text-sm font-medium text-gray-700 flex-shrink'>Result from voters</Text>
                                <View className={`ml-2 ${Number(item.Vote_wastetype[0][1]) !== 0 ? `${voteColorMap[item.Vote_wastetype[0][0] + "-bg"]}` : "bg-[#CCCCCC]"} rounded-md px-2 py-1 max-w-[55%]`}>
                                    <Text
                                        className={`text-sm ${Number(item.Vote_wastetype[0][1]) !== 0 ? `${voteColorMap[item.Vote_wastetype[0][0] + "-text"]}` : "text-black"} font-bold text-center`}
                                        numberOfLines={1}
                                    >
                                        {Number(item.Vote_wastetype[0][1]) !== 0 ? `${item.Vote_wastetype[0][0]} Waste` : "No vote yet"}
                                    </Text>
                                </View>
                            </View>

                        </View>

                        {item.isVoted && (
                            <View className="absolute right-0 top-0 bg-[#2F98DD] rounded-bl-lg rounded-tr-xl px-2 py-0.5">
                                <Text className="text-white text-[10px] font-bold">Voted</Text>
                            </View>
                        )}

                    </Pressable>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

export default Index;