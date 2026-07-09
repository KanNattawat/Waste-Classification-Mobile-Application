import { ensureModelLoaded, preprocessImage } from '@/lib/tflite';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View, SafeAreaView, ScrollView, Pressable, Modal } from 'react-native';
import Loading from '@/components/loading';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveImage } from "@/lib/storage";
import { API_URL } from "@/config";
import { getS3UploadPresinged, uploadToS3 } from "@/lib/s3Service"
import { wasteDescriptions } from '@/constants/wasteDes';
import ProgressBar from '@/components/ProgressBar';


type WastePrediction = {
  label: string;
  score: number;
};

type WasteUpload = {
  sortedResult: WastePrediction[];
  wasteId: string
};



const Index = () => {
  const { photo } = useLocalSearchParams<{ photo: string }>();
  const [waste, setWaste] = useState<WasteUpload>();
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectType, setSelectType] = useState("")
  const router = useRouter();

  const colorMap: { [key: string]: string } = {
    "ขยะอันตราย": "bg-[#EF4545]",
    "ขยะอินทรีย์": "bg-[#28C45C]",
    "ขยะทั่วไป": "bg-[#2F98DD]",
    "ขยะรีไซเคิล": "bg-[#FCD92C]"
  };


  const displayNames: Record<string, string> = {
    "ขยะอินทรีย์": "Compostable Waste",
    "ขยะอันตราย": "Hazardous Waste",
    "ขยะทั่วไป": "General Waste",
    "ขยะรีไซเคิล": "Recyclable Waste",
  };

  const handleFeedbackCorrect = async () => {
    try {
      const res = await axios.put(`${API_URL}/updateFeedback`, {
        wasteId: waste?.wasteId,
        status: true,
        selectedType: [0, 0, 0, 0]
      })
      router.back()

    } catch (error) {
      console.log(error)
    }
  }

  const handleFeedbackInCorrect = async () => {
    try {
      const selected = selectType === "ขยะอินทรีย์" ? [1, 0, 0, 0] : selectType === "ขยะอันตราย" ? [0, 1, 0, 0] :
        selectType === "ขยะทั่วไป" ? [0, 0, 1, 0] : selectType === "ขยะรีไซเคิล" ? [0, 0, 0, 1] : []
      const res = await axios.put(`${API_URL}/updateFeedback`, {
        wasteId: waste?.wasteId,
        status: false,
        selectedType: selected
      })
      router.back()
    } catch (error) {

    }
  }


  const uploadToDB = async (wastetype: string, image_path: string, probs: Array<number>, userId: string | null) => {
    try {
      const contentType = 'image/jpeg'
      const { url, key } = await getS3UploadPresinged(userId, contentType);
      await uploadToS3(url, image_path, contentType)

      const res = await axios.post(`${API_URL}/wasteupload`, {
        user_id: userId,
        wastetype: wastetype,
        image_path: key,
        probs: [...probs],
      });

      console.log('data', res.data.wasteid)

      saveImage(photo, userId, res.data.imgid);
      return res.data.wasteid

    } catch (error: any) {
      console.log('error', error);
      return "error";
    }
  };

  useEffect(() => {
    (async () => {
      try {
        if (!photo) throw new Error("Missing image uri");
        const userId = await AsyncStorage.getItem("userId");
        const model = await ensureModelLoaded();
        const input = await preprocessImage(photo);
        const outputs = model.runSync([input.data]); //EX output. [[0.05, 0.02, 0.08, 0.85]]
        const className = ["ขยะอินทรีย์", "ขยะอันตราย", "ขยะทั่วไป", "ขยะรีไซเคิล"];
        const sortedClass = className.map((label, index) => [label, outputs[0][index]] as [string, number]).sort((a, b) => b[1] - a[1]); 
        //EX output. [["ขยะรีไซเคิล", 0.945231],["ขยะทั่วไป", 0.032145],["ขยะอินทรีย์", 0.015682],["ขยะอันตราย", 0.006942]]
        setWaste({
          sortedResult: sortedClass.map(([label, score]) => ({
            label,
            score,
          })),
          wasteId: "",
        });
        setLoading(false);
        await uploadToDB(sortedClass[0][0], photo, outputs[0], userId).then(id => {
          setWaste(prev => {
            if (!prev) return prev;
            return { ...prev, wasteId: id }
          });
        });

      } catch (e) {
        Alert.alert("Predict error", String(e));
      }
    })();
  }, [photo]);

  return (
    <SafeAreaView className="flex-1 bg-[#F9F8FA] pt-8">
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
        {loading ? (
          <Loading />
        ) : (
          <>
            <Text className="text-3xl font-bold text-[#1E8B79] mb-4 text-center">
              Waste Classification Result
            </Text>


            <Image source={{ uri: photo }} className="shadow-md object-cover w-[90%] h-[200px] m-2.5 rounded-[10px]" />

            <View className='border-2 border-[#DAD9D9] mt-3 px-4 py-4 bg-white rounded-[10px] shadow-sm elevation-2 w-[95%] self-center' >
              {waste && (
                <>
                  <Text className={`font-semibold text-2xl mb-2 text-center`}>
                    {displayNames[waste.sortedResult[0].label]}
                  </Text>
                  {wasteDescriptions[waste.sortedResult[0].label].split("\n").map((line, index) => (
                    <Text
                      key={index}
                      className={`text-[18px] text-[#444] leading-6 mb-1.5 ${line.startsWith("-") ? "pl-3" : ""
                        }`}
                    >
                      {line}
                    </Text>
                  ))}
                </>
              )}


              <View className="w-[95%] mt-8">
                {waste?.sortedResult.map((item, index: number) => (
                  <ProgressBar
                    key={index}
                    label={displayNames[item.label]}
                    percent={item.score * 100}
                    color={
                      colorMap[item.label]
                    }
                  />

                ))}
              </View>
              <Text className='text-black text-xl mt-8 text-center font-bold'>Is this result correct?</Text>
              <View className='flex flex-row justify-center'>

                <View className='mx-4 justify-center items-center py-2.5'>
                  <TouchableOpacity
                    className='bg-[#239147] py-4 px-10 rounded-lg'
                    activeOpacity={0.7}
                    onPress={() => handleFeedbackCorrect()}
                  >
                    <Text className='text-white text-base font-bold'>Correct</Text>
                  </TouchableOpacity>
                </View>

                <View className='mx-4 justify-center items-center py-2.5'>
                  <TouchableOpacity
                    className='bg-[#AB2D2D] py-4 px-10 rounded-lg'
                    activeOpacity={0.7}
                    onPress={() => setOpen(true)}
                  >
                    <Text className='text-white text-base font-bold'>Incorrect</Text>
                  </TouchableOpacity>
                </View>

              </View>

            </View>


            {open &&
              <Modal transparent visible={open} animationType="fade" statusBarTranslucent={true}>
                <View className="relative flex-1 bg-black/60 justify-center items-center px-2">
                  <View className=" bg-white w-full p-6 rounded-3xl items-center shadow-2xl">
                    <Pressable className='absolute top-2 right-6 onHold' onPress={() => setOpen(false)}>
                      <Text className="text-3xl font-bold text-gray-800 text-center">
                        x
                      </Text>
                    </Pressable>
                    <Text className="text-2xl font-bold text-gray-800 text-center">Select the Correct Type</Text>


                    <View className='flex flex-row flex-wrap gap-3 items-center justify-between mt-6'>

                      <Pressable className={`flex flex-row bg-[#EF4545] w-[48%] px-3 py-4 rounded-lg 
                      items-center ${selectType !== "ขยะอันตราย" && selectType !== "" && "opacity-80"} gap-3`}
                        onPress={() => { selectType === "" ? setSelectType("ขยะอันตราย") : setSelectType("") }}
                        disabled={(selectType !== "" && selectType !== "ขยะอันตราย")}
                      >
                        <View className='flex flex-row bg-white border-2 border-[#CCCCCC] rounded-lg w-8 h-8 items-center justify-center'>
                          {selectType === "ขยะอันตราย" && (
                            <Text className="text-black font-bold text-xl">✓</Text>
                          )}
                        </View>
                        <Text className='text-xl font-bold'>Hazardous</Text>
                      </Pressable>

                      <Pressable className={`flex flex-row bg-[#28C45C] w-[48%] px-3 py-4 rounded-lg 
                      ${selectType !== "ขยะอินทรีย์" && selectType !== "" && 'opacity-80'} items-center gap-3`}
                        onPress={() => { selectType === "" ? setSelectType("ขยะอินทรีย์") : setSelectType("") }}
                        disabled={(selectType !== "" && selectType !== "ขยะอินทรีย์")}
                      >
                        <View className='flex flex-row bg-white border-2 border-[#CCCCCC] rounded-lg w-8 h-8 items-center justify-center'>
                          {selectType === "ขยะอินทรีย์" && (<Text className="text-black font-bold text-xl">✓</Text>)}
                        </View>
                        <Text className='text-xl font-bold'>Compostable</Text>
                      </Pressable>

                      <Pressable className={`flex flex-row bg-[#2F98DD] w-[48%] px-3 py-4 rounded-lg 
                      ${selectType !== 'ขยะทั่วไป' && selectType !== "" && 'opacity-80'} items-center gap-3`}
                        onPress={() => { selectType === "" ? setSelectType("ขยะทั่วไป") : setSelectType("") }}
                        disabled={(selectType !== "" && selectType !== "ขยะทั่วไป")}>
                        <View className='flex flex-row bg-white border-2 border-[#CCCCCC] rounded-lg w-8 h-8 items-center justify-center'>
                          {selectType === "ขยะทั่วไป" && (<Text className="text-black font-bold text-xl">✓</Text>)}

                        </View>
                        <Text className='text-xl font-bold'>General</Text>
                      </Pressable>

                      <Pressable className={`flex flex-row bg-[#FCD92C] w-[48%] px-3 py-4 rounded-lg items-center
                      ${selectType !== 'ขยะรีไซเคิล' && selectType !== "" && 'opacity-80'} gap-3`}
                        onPress={() => { selectType === "" ? setSelectType("ขยะรีไซเคิล") : setSelectType("") }}
                        disabled={(selectType !== "" && selectType !== "ขยะรีไซเคิล")}>
                        <View className='flex flex-row bg-white border-2 border-[#CCCCCC] rounded-lg w-8 h-8 items-center justify-center'>
                          {selectType === "ขยะรีไซเคิล" && (<Text className="text-black font-bold text-xl">✓</Text>)}

                        </View>
                        <Text className='text-xl font-bold'>Recyclable</Text>
                      </Pressable>


                    </View>

                    <Pressable
                      className="mt-8 bg-[#1E8B79] w-[47%] py-4 rounded-xl items-center"
                      onPress={() => handleFeedbackInCorrect()}
                    >
                      <Text className="text-white text-lg font-bold">Confirm</Text>
                    </Pressable>


                  </View>
                </View>
              </Modal>
            }
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;