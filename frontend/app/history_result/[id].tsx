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
  "ขยะย่อยสลาย": `ขยะย่อยสลายได้

ขยะประเภทนี้สามารถย่อยสลายได้เองตามธรรมชาติ ไม่เป็นอันตรายต่อสิ่งแวดล้อม

ระยะเวลาย่อยสลาย : 1 – 6 เดือน  
ตัวอย่าง : เศษอาหาร เปลือกผลไม้ เศษผัก ใบไม้  
ผลกระทบหากไม่แยก : เกิดกลิ่น น้ำเสีย และแมลงรบกวน  

วิธีจัดการ  
- แยกออกจากขยะอื่น  
- ทิ้งในถังขยะเปียกหรือถังหมัก  
- สามารถนำไปทำปุ๋ยหมักได้`,

  "ขยะอันตราย": `ขยะอันตราย

ขยะประเภทนี้มีสารเคมีหรือคุณสมบัติที่เป็นอันตรายต่อสุขภาพและสิ่งแวดล้อม

ตัวอย่าง : ถ่านไฟฉาย หลอดไฟเก่า ยา สารเคมี สี  
ความอันตราย : ปนเปื้อนน้ำ ดิน เป็นพิษต่อคนและสัตว์  
ห้าม : เผา เททิ้ง หรือปะปนกับขยะทั่วไป

วิธีจัดการ  
- แยกเก็บไว้ในภาชนะที่ปิดมิดชิด  
- นำไปทิ้งที่จุดรับขยะอันตรายของเทศบาลหรือศูนย์กำจัดพิเศษ`,

  "ขยะทั่วไป": `ขยะทั่วไป

ขยะประเภทนี้ไม่สามารถนำกลับมาใช้ใหม่หรือรีไซเคิลได้

ตัวอย่าง : ผ้าอนามัย กระดาษชำระ ถุงพลาสติกเปื้อนอาหาร  
ย่อยสลายยาก ใช้เวลาหลายปีถึงหลายสิบปี  
ผลกระทบ : เพิ่มปริมาณขยะฝังกลบ

วิธีจัดการ  
- ใส่ถุงให้มิดชิดเพื่อลดกลิ่น  
- ทิ้งลงถังขยะทั่วไป  
- ลดการใช้ของใช้สิ้นเปลือง`,

  "ขยะรีไซเคิล": `ขยะรีไซเคิล

ขยะประเภทนี้สามารถนำกลับมาใช้ใหม่หรือรีไซเคิลเป็นวัตถุดิบใหม่ได้

ตัวอย่าง : ขวดพลาสติก แก้ว กระดาษ กระป๋อง โลหะ กล่องนม  
ประโยชน์ : ลดขยะ ลดการใช้ทรัพยากรใหม่  
พลาสติกบางชนิดย่อยสลายช้ามาก (100–450 ปี)

วิธีจัดการ  
- ล้างให้สะอาด  
- แยกฝาและฉลากออก  
- บีบ/พับเพื่อลดพื้นที่  
- ทิ้งในถังรีไซเคิลหรือจุดรับซื้อของเก่า`,
};

const ProgressBar = ({ label, percent, color }: { label: string; percent: number; color: string }) => (
  <View style={progress.container} className="bg-white p-4 rounded-lg mb-4 shadow-md">
    <View style={progress.labelRow}>
      <Text>{label}</Text>
      <Text>{percent.toFixed(3)}%</Text>
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
    w === "ขยะรีไซเคิล" ? "#FCD92C" :
    w === "ขยะอันตราย" ? "#EF4545" :
    w === "ขยะย่อยสลาย" ? "#28C45C" :
    "#38AFFF";

  return (
    <View className="flex-1 bg-[#F8FDF9]">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-[#4C944C] text-center mt-12">
          ผลลัพธ์การคัดแยกขยะ
        </Text>

        <Image source={{ uri: item.Image_path }} style={imgstyles.image} className="shadow-md" />

        <View style={descStyles.container}>
          {wasteDescriptions[WASTE_LABEL[item.Waste_ID]].split("\n").map((line, index) => (
            <Text
              key={index}
              style={[
                descStyles.text,
                line.startsWith("-") ? descStyles.bullet : null,
                index === 0 ? descStyles.title : null,
              ]}
            >
              {line}
            </Text>
          ))}
        </View>

        <View style={{ width: "90%", alignSelf: "center", marginTop: 32 }}>
          {sorted.slice(0, 3).map(([label, prob], i) => (
            <ProgressBar key={i} label={label} percent={prob * 100} color={colorFor(label)} />
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
    </View>
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
  container: { marginBottom: 15 },
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
    paddingVertical: 40,
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

const descStyles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
    marginBottom: 6,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#2E7D32",
    marginBottom: 10,
    textAlign: "center",
  },
  bullet: { paddingLeft: 12 },
});
