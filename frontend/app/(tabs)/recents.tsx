import { useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, ListRenderItem } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { readImage } from "@/lib/storage";
import { useRouter } from "expo-router";
import { API_URL } from "@/config";
import { useFocusEffect } from "@react-navigation/native";
import Screen from "@/components/Screen";

export interface HistoryItem {
  Image_ID: number;
  User_ID: number;
  Waste_ID: number;
  Image_path: string;
  timestamp: string;
  probs: number[];
}

const WASTE_LABEL: Record<number, string> = {
  1: "ขยะอินทรีย์",
  2: "ขยะอันตราย",
  3: "ขยะรีไซเคิล",
  4: "ขยะทั่วไป",
};

const wasteLabel = (id: number) => WASTE_LABEL[id] ?? "unknown";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH-u-ca-gregory", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const Recents = () => {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const getHistory = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const { data } = await axios.get(`${API_URL}/gethistory`, {
        params: { userId },
      });

      const raw: HistoryItem[] = Array.isArray(data?.img) ? data.img : [];

      const hydrated = await Promise.all(
        raw.map(async (it) => {
          try {
            const localUri = await readImage(it.User_ID, it.Image_ID, "jpeg");
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

  useFocusEffect(
    useCallback(() => {
      getHistory();
    }, [])
  );

  const renderItem: ListRenderItem<HistoryItem> = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/history_result/${item.Image_ID}`)}
      className="
        flex-row items-center
        bg-white
        p-3
        rounded-xl
        mb-3
        shadow
      "
    >
      <Image
        source={{ uri: item.Image_path }}
        className="w-[80px] h-[60px] rounded-lg"
      />

      <View className="flex-1 ml-3">
        <View className="self-start">
          {wasteLabel(item.Waste_ID) === "ขยะอินทรีย์" ? <Text className="text-xl font-bold capitalize bg-[#E5FFED] text-[#1A863E] rounded-lg px-2 py-1 ">
            {wasteLabel(item.Waste_ID)}</Text>
            : wasteLabel(item.Waste_ID) === "ขยะอันตราย" ? <Text className="text-xl font-bold capitalize bg-[#FFC8C8] text-[#842A2A] rounded-lg px-2 py-1 ">{wasteLabel(item.Waste_ID)} </Text>
              : wasteLabel(item.Waste_ID) === "ขยะรีไซเคิล" ? <Text className="text-xl font-bold capitalize bg-[#FFFCEB] text-[#A99323] rounded-lg px-2 py-1">{wasteLabel(item.Waste_ID)} </Text>
                : <Text className="text-lg font-bold capitalize bg-[#EDF8FF] text-[#276F9F] rounded-lg px-2 py-1">{wasteLabel(item.Waste_ID)} </Text>
          }
        </View>
        <Text className="text-xl text-gray-500">
          {formatDate(item.timestamp)}
        </Text>
      </View>

      <Text className="text-xl text-gray-400">{">"}</Text>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View className="flex-1 bg-[#F9F8FA] px-8 pt-10">
        <Text className="text-3xl font-bold text-[#1E8B79] text-center mb-3">
          ประวัติการคัดแยกขยะ
        </Text>

        <FlatList
          data={history}
          keyExtractor={(item) => item.Image_ID.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Screen>
  );
};

export default Recents;
