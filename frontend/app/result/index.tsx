import { ensureModelLoaded, preprocessImage } from '@/lib/tflite';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View, SafeAreaView, ScrollView } from 'react-native';
import Loading from '@/components/loading';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveImage } from "@/lib/storage";
import { API_URL } from "@/config";

const ProgressBar = ({ label, percent, color }: { label: string, percent: number, color: string }) => {
  return (
    <View style={styles.container} className='bg-white p-4 rounded-lg mb-4 shadow-md'>
      <View style={styles.labelRow}>
        <Text>{label}</Text>
        <Text>{percent.toFixed(1)}%</Text>
      </View>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${percent}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

const uploadToDB = async (wastetype: string, image_path: string, userId: string | null, probs: Array<number>): Promise<string> => {
  try {
    const res = await axios.post(`${API_URL}/wasteupload`, {
      user_id: userId,
      wastetype: wastetype,
      image_path: image_path,
      probs: [...probs],
    });
    return res.data.imgid as string;
  } catch (error: any) {
    console.log(error);
    return "error";
  }
};

const Index = () => {
  const { photo } = useLocalSearchParams<{ photo: string }>();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  useEffect(() => {
    (async () => {
      try {
        if (!photo) throw new Error("Missing image uri");
        const model = await ensureModelLoaded();
        const input = await preprocessImage(photo);
        const outputs = model.runSync([input.data]);
        const className = ["ขยะย่อยสลาย", "ขยะอันตราย", "ขยะทั่วไป", "ขยะรีไซเคิล"];
        const mappingClass = className.reduce<Record<string, number>>((accu, current, index) => {
          accu[current] = outputs[0][index];
          return accu;
        }, {});
        const sortedClass = Object.entries(mappingClass).sort((a, b) => b[1] - a[1]);
        setResult(sortedClass);
        const userId = await AsyncStorage.getItem("userId");
        const res = await uploadToDB(sortedClass[0][0], photo, userId, outputs[0]);
        saveImage(photo, userId, res);
      } catch (e) {
        Alert.alert("Predict error", String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [photo]);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FDF9]">
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
        {loading ? (
          <Loading />
        ) : (
          <>
            <Text className="text-2xl font-bold text-[#4C944C] mb-4 text-center">
              ผลลัพธ์การคัดแยกขยะ
            </Text>

            <Image source={{ uri: photo }} style={imgstyles.image} className="shadow-md" />

            <View style={descStyles.container}>
              {result && wasteDescriptions[result[0][0]].split("\n").map((line, index) => (
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

            <View style={{ width: "90%", marginTop: 32 }}>
              {result.slice(0, 3).map(([label, prob]: any, index: number) => (
                <ProgressBar
                  key={index}
                  label={label}
                  percent={prob * 100}
                  color={
                    label === 'ขยะรีไซเคิล' ? "#FCD92C" :
                    label === 'ขยะอันตราย' ? "#EF4545" :
                    label === 'ขยะย่อยสลาย' ? "#28C45C" : "#38AFFF"
                  }
                />
              ))}
            </View>

            <View style={btnstyles2.container}>
              <TouchableOpacity
                style={btnstyles2.greenButton}
                activeOpacity={0.7}
                onPress={() => router.back()}
              >
                <Text style={btnstyles2.buttonText}>เสร็จสิ้น</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const imgstyles = StyleSheet.create({
  image: {
    width: "90%",
    height: 200,
    margin: 10,
    borderRadius: 10,
  },
});

const styles = StyleSheet.create({
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
  barFill: { height: "100%", borderRadius: 6 },
});

const btnstyles2 = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  greenButton: {
    backgroundColor: '#4C944C',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

const descStyles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    width: "95%",
    alignSelf: "center",
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
  bullet: {
    paddingLeft: 12,
  },
});

export default Index;
