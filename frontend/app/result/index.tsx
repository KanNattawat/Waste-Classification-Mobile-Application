import { ensureModelLoaded, preprocessImage } from '@/lib/tflite';
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Loading from '@/components/loading'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveImage } from "@/lib/storage"
import { useRouter } from 'expo-router';

const ProgressBar = ({ label, percent, color }: { label: string, percent: number, color: string }) => {
    return (
        <View style={styles.container} className='bg-white p-4 rounded-lg mb-4 shadow-md'>
            <View style={styles.labelRow}>
                <Text>{label}</Text>
                <Text>{percent.toFixed(3)}%</Text>
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
    )
}


const uploadToDB = async (wastetype: string, image_path: string, userId: string | null, probs: Array<number>): Promise<string> => {
    try {
        const res = await axios.post("http://193.168.182.241:3000/wasteupload", {
            user_id: userId,
            wastetype: wastetype,
            image_path: image_path,
            probs: [...probs]
        })
        return res.data.imgid as string
    } catch (error: any) {
        console.log(error)
        return "error"
    }
}


const Index = () => {
    const { photo } = useLocalSearchParams<{ photo: string }>();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter()
    const wasteDescriptions: Record<string, string> = {
                    "ขยะย่อยสลาย": "ขยะประเภทนี้สามารถย่อยสลายได้เองตามธรรมชาติ เช่น เศษอาหาร เศษผักผลไม้ ใบไม้ ควรนำไปทำปุ๋ยหมักเพื่อใช้ประโยชน์ต่อไป",
                    "ขยะอันตราย": "ขยะชิ้นนี้มีความอันตรายสูง โปรดระมัดระวังในการจัดเก็บและนำไปทิ้งในจุดที่มีการรับทิ้งขยะประเภทนี้ เช่น ถ่านไฟฉาย หลอดไฟเก่า สารเคมี",
                    "ขยะทั่วไป": "ขยะประเภทนี้ไม่สามารถนำกลับมาใช้ใหม่ได้ เช่น ซองขนม ถุงพลาสติกเปื้อนอาหาร แก้วพลาสติก ควรทิ้งลงถังขยะทั่วไป",
                    "ขยะรีไซเคิล": "ขยะประเภทนี้สามารถนำกลับมาใช้ใหม่หรือรีไซเคิลได้ เช่น ขวดพลาสติก กระดาษ แก้ว โลหะ โปรดแยกใส่ถังรีไซเคิลเพื่อช่วยลดปริมาณขยะ"
                };

    useEffect(() => {
        (async () => {
            try {
                if (!photo) throw new Error("Missing image uri");
                const model = await ensureModelLoaded();
                const input = await preprocessImage(photo)
                // console.log(input.data)
                // console.log('isTypedArray?', ArrayBuffer.isView(input.data));
                // console.log('length', input.data.length);                     // 150528 (1*224*224*3)
                // console.log('dtype', input.data.constructor.name);            // Float32Array
                const outputs = model.runSync([input.data]); // output = logits
                console.log(outputs)
                const className = ["ขยะย่อยสลาย", "ขยะอันตราย", "ขยะทั่วไป", "ขยะรีไซเคิล"]
                // เพิ่ม dictionary คำอธิบายขยะ


                const mappingClass = className.reduce<Record<string, number>>((accu, current, index) => {
                    accu[current] = outputs[0][index];
                    return accu;
                }, {});
                const sortedClass = Object.entries(mappingClass).sort((a, b) => b[1] - a[1]);
                // console.log(sortedClass)
                setResult(sortedClass)
                const userId = await AsyncStorage.getItem("userId");
                // console.log("id", userId)
                const res = await uploadToDB(sortedClass[0][0], photo, userId, outputs[0]);
                console.log(outputs[0])
                saveImage(photo, userId, res)
                console.log('saved!')
            } catch (e) {
                Alert.alert("Predict error", String(e));
            } finally {
                setLoading(false);
            }
        })();
    }, [photo]);


    return (
        <View className="flex-1 items-center justify-center bg-[#F8FDF9] pt-12">
            {loading ? (<Loading />) : (
                <>
                    <Text className="text-3xl font-bold text-[#4C944C]">
                        ผลลัพธ์การคัดแยกขยะ
                    </Text>

                    <Image
                        source={{
                            uri: photo
                        }}
                        style={imgstyles.image}
                        className='shadow-md'
                    />

                    <Text className="text-2xl mt-2 font-bold">
                        {/* {result ? result[0][0] : "Loading"} */}
                        {result[0][0]}
                    </Text>
                    <Text className="text-base mt-2 pl-6 pr-6 text-center text-[#545454]">
                        {wasteDescriptions[result[0][0]]}
                    </Text>

                    <View style={{ width: "90%", marginTop: 48 }}>
                        <ProgressBar label={result[0][0]} percent={result[0][1] * 100}
                            color={result[0][0] == 'ขยะรีไซเคิล' ? "#FCD92C" : result[0][0] == 'ขยะอันตราย' ? "#EF4545" : result[0][0] == 'ขยะย่อยสลาย' ? "#28C45C" : "#38AFFF"} />
                        <ProgressBar label={result[1][0]} percent={result[1][1] * 100}
                            color={result[1][0] == 'ขยะรีไซเคิล' ? "#FCD92C" : result[1][0] == 'ขยะอันตราย' ? "#EF4545" : result[1][0] == 'ขยะย่อยสลาย' ? "#28C45C" : "#38AFFF"} />
                        <ProgressBar label={result[2][0]} percent={result[2][1] * 100}
                            color={result[2][0] == 'ขยะรีไซเคิล' ? "#FCD92C" : result[2][0] == 'ขยะอันตราย' ? "#EF4545" : result[2][0] == 'ขยะย่อยสลาย' ? "#28C45C" : "#38AFFF"} />
                    </View>

                    <View style={btnstyles.container}>
                        <TouchableOpacity style={btnstyles.greenButton}
                            activeOpacity={0.7} >
                            <Text style={btnstyles.buttonText} onPress={()=>{{router.replace('/(tabs)')}}}>ย้อนกลับ</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    )
}

const imgstyles = StyleSheet.create({
    image: {
        width: "90%",
        height: 200,
        margin: 10,
        borderRadius: 10,
    },
})

const styles = StyleSheet.create({
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
})

const btnstyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FDF9',
        paddingBottom: 50
    },
    greenButton: {
        backgroundColor: '#4C944C',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Index
