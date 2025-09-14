import { ensureModelLoaded, preprocessImage } from '@/libs/tflite';
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ProgressBar = ({ label, percent, color }: { label: string, percent: number, color: string }) => {
    return (
        <View style={styles.container} className='bg-white p-4 rounded-lg mb-4 shadow-md'>
            <View style={styles.labelRow}>
                <Text>{label}</Text>
                <Text>{percent}%</Text>
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

const Index = () => {
    const { photo } = useLocalSearchParams<{ photo: string }>();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);


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

                const mappingClass = className.reduce<Record<string, number>>((accu, current, index) => {
                    accu[current] = outputs[0][index];
                    return accu;
                }, {});
                const sortedClass = Object.entries(mappingClass).sort((a, b) => b[1] - a[1]);
                console.log(sortedClass)
                setResult(sortedClass)


            } catch (e) {
                Alert.alert("Predict error", String(e));
            } finally {
                setLoading(false);
            }
        })();
    }, [photo]);


    return (
        <View className="flex-1 items-center justify-center bg-[#F8FDF9] pt-16">
            {loading?(<Text>loading</Text>):(
            <>
                <Text className="text-2xl font-bold text-[#4C944C]">
                    ผลลัพธ์การคัดแยกขยะ
                </Text>
                {/* {!!photo && (
                <Image source={{ photo }} style={{ width: 240, height: 240, borderRadius: 12 }} />
            )} */}
                <Image
                    source={{
                        uri: photo
                    }}
                    style={imgstyles.image}
                    className='shadow-md'
                />

                <Text className="text-2xl mt-2 font-bold">
                    {result ? result[0][0] : "Loading"}
                </Text>
                <Text className="text-base mt-2 pl-6 pr-6 text-center text-[#545454]">
                    ????????????????????ขยะชิ้นนี้มีความอันตรายสูง โปรดระมัดระวังในการจัดเก็บและนำไปทิ้งในจุดที่มีการรับทิ้งขยะประเภทนี้
                </Text>

                <View style={{ width: "90%", marginTop: 48 }}>
                    <ProgressBar label={result[0][0]} percent={result[0][1] * 100} 
                    color={result[0][0] == 'ขยะรีไซเคิล'? "#FCD92C": result[0][0] == 'ขยะอันตราย'?"#EF4545":result[0][0] == 'ขยะย่อยสลาย'?"#28C45C":"38AFFF"}/>
                    <ProgressBar label={result[1][0]}percent={result[1][1]* 100} 
                    color={result[1][0] == 'ขยะรีไซเคิล'? "#FCD92C": result[1][0] == 'ขยะอันตราย'?"#EF4545":result[1][0] == 'ขยะย่อยสลาย'?"#28C45C":"38AFFF"}/>
                    <ProgressBar label={result[2][0]} percent={result[2][1]* 100} 
                    color={result[2][0] == 'ขยะรีไซเคิล'? "#FCD92C": result[2][0] == 'ขยะอันตราย'?"#EF4545":result[2][0] == 'ขยะย่อยสลาย'?"#28C45C":"38AFFF"} />
                </View>

                <View style={btnstyles.container}>
                    <TouchableOpacity style={btnstyles.greenButton}
                        activeOpacity={0.7} >
                        <Text style={btnstyles.buttonText}>คัดแยกใหม่อีกครั้ง</Text>
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
