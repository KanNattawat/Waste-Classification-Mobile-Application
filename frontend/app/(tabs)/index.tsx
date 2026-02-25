import { useState, useCallback, useMemo } from 'react';
import { Image, Text, View, SafeAreaView, ScrollView, Pressable } from 'react-native';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/config";
import { useFocusEffect } from "@react-navigation/native";
import { PieChart } from 'react-native-gifted-charts';
import WasteType from '@/components/WasteType';
import tipsData from '@/assets/tips.json';
import ScreenScroll from "@/components/ScreenScroll";
import * as SecureStore from 'expo-secure-store';
import { useAuth } from "@/contexts/AuthContext";

type homeData = {
  userName: string,
  point: number,
  graph: {
    _count: {
      Waste_ID: number
    }; WasteType_ID: string
  }[],
  weekData: number,
  streak: number
}

export default function Index() {
  const [homeData, setHomeData] = useState<homeData | null>(null);
  const [selectedKey, setSelectedKey] = useState("recycle");
  const [open, setIsopen] = useState(false);
  const { setToken } = useAuth();

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      setToken("");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const raw = useMemo(
    () => {
      const getId = (id: string) => {
        const item = homeData?.graph.find((x) => {
          return x.WasteType_ID == id
        })
        return item?._count.Waste_ID || 0
      }

      return [
        { key: "recycle", label: "ขยะรีไซเคิล", value: getId("4"), color: "#FCD92C" },
        { key: "danger", label: "ขยะอันตราย", value: getId("2"), color: "#EF4545" },
        { key: "general", label: "ขยะทั่วไป", value: getId("3"), color: "#38AFFF" },
        { key: "compost", label: "ขยะอินทรีย์", value: getId("1"), color: "#28C45C" },
        { key: "none", label: "-", value: 0, color: "#CCCCCC" }
      ];
    },
    [homeData]
  );


  const selected = raw.find((x) => x.key === selectedKey) || raw[4];


  const data = raw.map((x) => {
    const isSelected = x.key === selectedKey;


    return {
      value: x.value,
      color: isSelected ? darkenColor(x.color, 0.05) : x.color,
      onPress: () => setSelectedKey(x.key),
    };
  });



  const fetchHome = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;
      const res = await axios.get(`${API_URL}/home`, { params: { userId } });
      setHomeData(res.data);
    } catch (err) {
      console.log("Error fetching weekly count", err);
    }
  };

  useFocusEffect(useCallback(() => { fetchHome(); }, []));



  function darkenColor(hex: string, amount = 0.25) {
    const num = parseInt(hex.replace("#", ""), 16);

    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;

    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)}`;
  }

  return (
    <SafeAreaView className="flex-1 flex-col bg-[#F9F8FA] min-h-full">
      <ScreenScroll>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* tab ด้านบน */}
          <View className="flex flex-col text-center bg-white px-4 pb-4 pt-16 shadow">
            <View className='px-4'>
              <Text className='text-[#7F7B7B] text-lg'>สวัสดี</Text>
              <View className="flex  flex-row justify-between items-center">
                <Pressable className='relative gap-x-2 flex flex-row justify-center items-center'
                  onPress={() => { open ? setIsopen(false) : setIsopen(true) }}>
                  <Text className='text-2xl'>{homeData?.userName}</Text>
                  <Image
                    source={require("@/assets/images/logout.png")}
                    className="w-5 h-5"
                  />
                  {open && (
                    <Pressable 
                    onPress={handleLogout}
                    className='w-full top-full p-2 items-center justify-center absolute rounded-xl border-2 border-[#D9D9D9] bg-white'>
                      <Text className='text-l'>Logout</Text>
                    </Pressable>
                  )}
                </Pressable>
                <View className='flex flex-row justify-center items-center'>
                  <Image
                    source={require("@/assets/images/coin.png")}
                    className="w-8 h-8 mr-2"
                  />
                  <Text className='text-2xl'>{homeData?.point}</Text>
                </View>
              </View>
            </View>
          </View>
          {/* tab graph */}
          <View className='flex flex-col bg-white items-center px-4 py-8 mt-8 mx-10 rounded-xl shadow'>
            <Text className='text-[#1E8B79] text-2xl font-bold'>สถิติการคักแยกขยะ</Text>
            <View className='mt-8 justify-center items-center'>
              <PieChart
                data={data}
                donut
                radius={120}
                innerRadius={90}
                centerLabelComponent={() => (
                  <View className="items-center">
                    <Text className={`tracking-[2px] font-bold text-xl opacity-60 ${selectedKey === "recycle" ? "text-yellow-500" : selectedKey === "danger"
                      ? "text-red-500" : selectedKey === "general" ? "text-blue-500" : selectedKey === "compost" ? "text-green-500" : "#CCCCCC"}`}>
                      {selected.label.toUpperCase()}
                    </Text>

                    <Text className="text-6xl font-extrabold">
                      {selected.value}
                    </Text>

                    <Text className="text-xl opacity-60 text-gray-600">
                      ชิ้นถูกแยก
                    </Text>
                  </View>
                )}
              />
              <View className="mt-12 w-full max-w-[320px] mx-auto">
                <View className="flex-row flex-wrap">
                  <WasteType
                    k="recycle"
                    label="ขยะรีไซเคิล"
                    color="#FCD92C"
                    selectedKey={selectedKey}
                    setSelectedKey={setSelectedKey}
                  />
                  <WasteType
                    k="danger"
                    label="ขยะอันตราย"
                    color="#EF4545"
                    selectedKey={selectedKey}
                    setSelectedKey={setSelectedKey}
                  />
                  <WasteType
                    k="general"
                    label="ขยะทั่วไป   "
                    color="#38AFFF"
                    selectedKey={selectedKey}
                    setSelectedKey={setSelectedKey}
                  />
                  <WasteType
                    k="compost"
                    label="ขยะอินทรีย์ "
                    color="#28C45C"
                    selectedKey={selectedKey}
                    setSelectedKey={setSelectedKey}
                  />
                </View>
              </View>
            </View>
          </View>
          {/* tab ด้านล่าง */}
          <View className="flex-row justify-center items-center mx-10 gap-x-8">

            <View className="bg-white items-center px-4 py-4 mt-8 rounded-xl shadow flex-1">
              <Image
                source={require("@/assets/images/streak.png")}
                className="w-16 h-16"
              />
              <Text className='text-gray-600 text-xl mt-4'>แยกขยะติดต่อกัน</Text>
              <Text className='text-2xl mt-4 font-bold'>{homeData?.streak} วัน</Text>
            </View>

            <View className="bg-white items-center px-4 py-4 mt-8 rounded-xl shadow flex-1 ">
              <Image
                source={require("@/assets/images/Total.png")}
                className="w-16 h-16"
              />
              <Text className='text-gray-600 text-xl mt-4'>สัปดาห์นี้แยกไป</Text>
              <Text className='text-2xl mt-4 font-bold'>{homeData?.weekData} ชิ้น</Text>
            </View>
          </View>

          {/* Tip */}
          <View className='bg-[#EDF3F5] mx-10 mt-8 border border-[#D8EBE9] rounded-xl p-6'>
            <Text className='text-2xl text-[#1F9280] font-bold ml-4 mr-4'>Tip</Text>
            <Text className='text-xl leading-9 italic ml-4 w-[94%] flex-shrink'>{tipsData.tips[Math.floor(Math.random() * tipsData.tips.length)]}</Text>
          </View>
        </ScrollView>
      </ScreenScroll>
    </SafeAreaView>
  );
}
