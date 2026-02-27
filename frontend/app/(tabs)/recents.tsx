import { useState, useCallback, useMemo } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, ListRenderItem, Pressable } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { readImage } from "@/lib/storage";
import { useRouter } from "expo-router";
import { API_URL } from "@/config";
import { useFocusEffect } from "@react-navigation/native";
import Screen from "@/components/Screen";
import { shadow } from "@/styles/shadow";
import {getImage} from "@/lib/s3Service"
import formatDate from "@/lib/formatDate"

export interface HistoryItem {
  Waste_ID: number;
  User_ID: number;
  WasteType_ID: number;
  Image_path: string;
  Timestamp: string;
  Probs: number[];
  Is_correct: boolean
}

const WASTE_LABEL: Record<number, string> = {
  1: "ขยะอินทรีย์",
  2: "ขยะอันตราย",
  4: "ขยะรีไซเคิล",
  3: "ขยะทั่วไป",
};

const wasteLabel = (id: number) => WASTE_LABEL[id] ?? "unknown";




const Recents = () => {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState('correct')


  const getHistory = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const { data } = await axios.get(`${API_URL}/gethistory`, {
        params: { userId },
      });

      const raw: HistoryItem[] = Array.isArray(data?.waste) ? data.waste : [];

      const hydrated = await Promise.all(
        raw.map(async (it) => {
          try {
            const localUri = await readImage(it.User_ID, it.Waste_ID, "jpeg");
            return { ...it, Image_path: localUri };
          } catch {
            return it;
          }
        })
      );

      setHistory(hydrated);
    } catch (err: any) {
      console.log("getHistory error:", err?.response?.status, err?.response?.data || err?.message);
    }
  };

  const historyfilterData = useMemo(() => {
    return history.filter(item =>
      filter === 'correct' ? item.Is_correct === true : item.Is_correct === false
    );
  }, [history, filter]);

  useFocusEffect(
    useCallback(() => {
      getHistory();
    }, [])
  );

  const renderItem: ListRenderItem<HistoryItem> = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/history_result/${item.Waste_ID}`)}
      className="
        flex-row items-center
        bg-white
        p-3
        rounded-xl
        mb-3
        overflow-hidden
      "
      style={shadow.card}
    >
      <Image
        source={{uri:getImage(item.Image_path)}}
        className="w-[80px] h-[60px] rounded-lg"
      />

      <View className="flex-1 ml-3">
        <View className="self-start">
          {wasteLabel(item.WasteType_ID) === "ขยะอินทรีย์" ? <Text className="text-xl font-bold capitalize bg-[#E5FFED] text-[#1A863E] rounded-lg px-2 py-1 ">
            {wasteLabel(item.WasteType_ID)}</Text>
            : wasteLabel(item.WasteType_ID) === "ขยะอันตราย" ? <Text className="text-xl font-bold capitalize bg-[#FFC8C8] text-[#842A2A] rounded-lg px-2 py-1 ">{wasteLabel(item.WasteType_ID)} </Text>
              : wasteLabel(item.WasteType_ID) === "ขยะรีไซเคิล" ? <Text className="text-xl font-bold capitalize bg-[#FFFCEB] text-[#A99323] rounded-lg px-2 py-1">{wasteLabel(item.WasteType_ID)} </Text>
                : <Text className="text-lg font-bold capitalize bg-[#EDF8FF] text-[#276F9F] rounded-lg px-2 py-1">{wasteLabel(item.WasteType_ID)} </Text>
          }
        </View>
        <Text className="text-xl text-gray-500">
          {formatDate(item.Timestamp)}
        </Text>
      </View>

      <Text className="text-xl text-gray-400">{">"}</Text>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View className="flex-1 bg-[#F9F8FA] px-8 pt-10 ">
        <Text className="text-3xl font-bold text-[#1E8B79] text-center mb-3">
          ประวัติการคัดแยกขยะ
        </Text>

        <View className='flex flex-row w-full justify-between my-4'>
          <Pressable className={`py-1  rounded-xl items-center w-[47%] ${filter === "correct" ? 'bg-[#1E8B79]' : 'bg-white'}`} style={shadow.card} onPress={() => { setFilter('correct') }}>
            <Text className={`text-xl ${filter === "correct" ? 'text-white' : 'text-[#1E8B79]'} text-center `}>ผลลัพธ์การแยก{'\n'} ถูกต้อง</Text>
          </Pressable>
          <Pressable className={`py-1 rounded-xl items-center w-[47%] ${filter === "incorrect" ? 'bg-[#1E8B79]' : 'bg-white'}`} style={shadow.card} onPress={() => { setFilter('incorrect') }}>
            <Text className={`text-xl ${filter === "incorrect" ? 'text-white' : 'text-[#1E8B79]'} text-center `}>ผลลัพธ์การแยก{'\n'}ไม่ถูกต้อง</Text>
          </Pressable>
        </View>



        <FlatList
          data={historyfilterData}
          keyExtractor={(item) => item.Waste_ID.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Screen>
  );
};

export default Recents;
