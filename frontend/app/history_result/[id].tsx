import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Loading from "@/components/loading";
import { API_URL } from "@/config";

interface HistoryItem {
  Image_ID: number;
  User_ID: number;
  Waste_ID: number;
  Image_path: string;
  timestamp: string;
  probs: number[];
}

const WASTE_LABEL: Record<number, string> = {
  1: "ขยะย่อยสลาย",
  2: "ขยะอันตราย",
  3: "ขยะรีไซเคิล",
  4: "ขยะทั่วไป",
};

const wasteDescriptions: Record<string, string> = {
  "ขยะย่อยสลาย": "ขยะประเภทนี้สามารถย่อยสลายได้เองตามธรรมชาติ เช่น เศษอาหาร เศษผักผลไม้ ใบไม้ ควรนำไปทำปุ๋ยหมักเพื่อใช้ประโยชน์ต่อไป",
  "ขยะอันตราย": "ขยะชิ้นนี้มีความอันตรายสูง โปรดระมัดระวังในการจัดเก็บและนำไปทิ้งในจุดที่มีการรับทิ้งขยะประเภทนี้ เช่น ถ่านไฟฉาย หลอดไฟเก่า สารเคมี",
  "ขยะทั่วไป": "ขยะประเภทนี้ไม่สามารถนำกลับมาใช้ใหม่ได้ เช่น ซองขนม ถุงพลาสติกเปื้อนอาหาร แก้วพลาสติก ควรทิ้งลงถังขยะทั่วไป",
  "ขยะรีไซเคิล": "ขยะประเภทนี้สามารถนำกลับมาใช้ใหม่หรือรีไซเคิลได้ เช่น ขวดพลาสติก กระดาษ แก้ว โลหะ โปรดแยกใส่ถังรีไซเคิลเพื่อช่วยลดปริมาณขยะ",
};

const ProgressBar = ({ label, percent, color }: { label: string; percent: number; color: string }) => (
  <View style={progress.container} className="bg-white p-4 rounded-lg mb-4 shadow-md">
    <View style={progress.labelRow}>
      <Text>{label}</Text>
      <Text>{percent.toFixed(1)}%</Text>
    </View>
    <View style={progress.barBackground}>
      <View style={[progress.barFill, { width: `${percent}%`, backgroundColor: color }]} />
    </View>
  </View>
);

export default function HistoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId || !id) return;

        const { data } = await axios.get(`${API_URL}/gethistorybyid`, {
          params: { userId, imageId: id },
        });

        setItem(data?.item || null);
      } catch (err) {
        console.log("fetch detail error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Loading />;
  if (!item) return <Text>ไม่พบข้อมูล</Text>;

  const labels = ["ขยะย่อยสลาย", "ขยะอันตราย", "ขยะรีไซเคิล", "ขยะทั่วไป"];
  const mapped = labels.map((l, i) => [l, item.probs[i]] as [string, number]);
  const sorted = mapped.sort((a, b) => b[1] - a[1]);

  const colorFor = (w: string) =>
    w === "ขยะรีไซเคิล" ? "#FCD92C" : w === "ขยะอันตราย" ? "#EF4545" : w === "ขยะย่อยสลาย" ? "#28C45C" : "#38AFFF";

  return (
    <ScrollView className="flex-1 bg-[#F8FDF9] pt-12">
      <Text className="text-2xl font-bold text-[#4C944C] text-center">ผลลัพธ์การคัดแยกขยะ</Text>

      <Image source={{ uri: item.Image_path }} style={imgstyles.image} className="shadow-md" />

      <Text className="text-2xl mt-2 font-bold text-center">{WASTE_LABEL[item.Waste_ID]}</Text>
      <Text className="text-base mt-2 px-6 text-center text-[#545454]">{wasteDescriptions[WASTE_LABEL[item.Waste_ID]]}</Text>

      <View style={{ width: "90%", alignSelf: "center", marginTop: 32 }}>
        {sorted.slice(0, 3).map(([label, prob], i) => (
          <ProgressBar
            key={i}
            label={label}
            percent={prob * 100}
            color={colorFor(label)}
          />
        ))}
      </View>

      <View style={btnstyles.container}>
        <TouchableOpacity
          style={btnstyles.greenButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Text style={btnstyles.buttonText}>ย้อนกลับ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const imgstyles = StyleSheet.create({
  image: {
    width: "90%",
    height: 200,
    marginVertical: 16,
    alignSelf: "center",
    borderRadius: 10,
  },
});

const progress = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  barBackground: {
    height: 12,
    backgroundColor: "#ccc",
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 6,
  },
});

const btnstyles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40
  },
  greenButton: {
    backgroundColor: "#4C944C",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
