import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import axios from "axios";
import Loading from "@/components/loading";
import { API_URL } from "@/config";
import { shadow } from "@/styles/shadow";
import PercentCard from "@/components/PercentCard"
import {mapAndSortVotes, mapAndSortProbs, calculateTotal} from "@/utils/wasteDataTransform"
import {getImage} from "@/lib/s3Service"

type ProbsList = [string, number][];
type VoteList = [string, number, string][];

interface HistoryItem {
  Waste_ID: number;
  User_ID: number;
  WasteType_ID: number;
  Image_path: string;
  Timestamp: string;
  Probs: ProbsList;
  Is_correct: boolean;
  Vote_wastetype: VoteList;
  Total: number;
}



const WASTE_LABEL: Record<number, string> = {
  1: "ขยะอินทรีย์",
  2: "ขยะอันตราย",
  3: "ขยะทั่วไป",
  4: "ขยะรีไซเคิล",
};

const ProgressBar = ({ label, percent, color }: { label: string, percent: number, color: string }) => {
  return (
    <View className="bg-white p-4 rounded-lg mb-[15px] shadow-md">
      <View className="flex-row justify-between mb-1.5">
        <Text className="text-xl text-gray-800">{label}</Text>
        <Text className="text-xl font-medium text-gray-800">{percent.toFixed(1)}%</Text>
      </View>

      <View className="h-3 bg-gray-300 rounded-full overflow-hidden">
        <View
          style={{ width: `${percent}%`, backgroundColor: color }}
          className="h-full rounded-full"
        />
      </View>
    </View>
  );
};

export default function HistoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [waste, setWaste] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/getWaste`, {
          params: { wasteId: id },
        });
        const waste =  data.item.Vote_wastetype
        const props = mapAndSortProbs(data.item.Probs)
        const vote = mapAndSortVotes(data.item.Vote_wastetype)
        setWaste({
          ...data?.item,
          Probs: props,
          Total: calculateTotal(waste),
          Vote_wastetype: vote
        });
      } catch (err) {
        console.log("fetch detail error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Loading />;
  if (!waste) return <Text>Error</Text>;


  const colorMap: { [key: string]: string } = {
    "ขยะอันตราย": "bg-[#EF4545]",
    "ขยะอินทรีย์": "bg-[#28C45C]",
    "ขยะทั่วไป": "bg-[#2F98DD]",
    "ขยะรีไซเคิล": "bg-[#FCD92C]"
  };

  return (
    <View className="relative flex bg-[#F9F8FA] w-full h-full justify-start items-center">
      <Pressable className='absolute top-10 left-7 z-50' onPress={() => { router.back() }}>
        <Image source={require('@/assets/images/back1.png')} />
      </Pressable>
      <View className='flex w-full max-w-[340px] mt-28' >
        <Image
          className='w-full h-[200px] rounded-lg' source={{ uri: getImage(waste?.Image_path) }}
          resizeMode='cover'
        />
      </View>
      {waste.Is_correct === true ? (
        <View className="mt-8 px-4 py-4 bg-white rounded-xl border-2 border-[#DAD9D9] shadow-sm w-[95%] self-center">
          {waste && (
            <>
              <Text className="font-semibold text-2xl text-center text-black">
                {WASTE_LABEL[waste.WasteType_ID]}
              </Text>
            </>
          )}

          <View className="w-full mt-4">
            {waste?.Probs.map((item, index: number) => (
              <ProgressBar
                key={index}
                label={item[0]}
                percent={item[1] * 100}
                color={
                  item[0] === 'ขยะรีไซเคิล' ? "#FCD92C" :
                    item[0] === 'ขยะอันตราย' ? "#EF4545" :
                      item[0] === 'ขยะอินทรีย์' ? "#28C45C" : "#38AFFF"
                }
              />
            ))}
          </View>
        </View>
      )
        : (
          <View className='flex p-8 w-full h-full'>
            <View className='w-full bg-white rounded-lg p-4' style={shadow.card}>
              <View className='flex flex-row justify-center w-full'>
                <View className='flex'><Text className='text-xl'>ผลลัพธ์ปัจจุบัน</Text></View>
                <View className='flex-1 items-end'>
                  {waste.Vote_wastetype.length > 0 ? (
                    <Text className='text-xl font-bold'>
                      {Number(waste.Vote_wastetype[0][1]) > 0 ? `${waste.Vote_wastetype[0][0]} ${waste.Vote_wastetype[0][2]}%` : "-"}
                    </Text>
                  ) : <Text>error</Text>}
                </View>
              </View>
              <View className='flex flex-row justify-center w-full'>
                <View className='flex-1'><Text className='text-xl'>ผลลัพธ์จากระบบ</Text></View>
                <View className='flex-1 items-end'>
                  <Text className='text-xl font-bold'>{waste?.WasteType_ID === 1 ? "ขยะอินทรีย์" : waste?.WasteType_ID === 2
                    ? "ขยะอันตราย" : waste?.WasteType_ID === 4 ? "ขยะรีไซเคิล" : "ขยะทั่วไป"}</Text>
                </View>
              </View>
            </View>

            <View className="w-full bg-white rounded-lg p-4 mt-8" style={shadow.card}>
              <View className='flex items-end '>
                <Text className='text-lg text-end'>คนโหวตจำนวน {waste.Total} คน</Text>
              </View>

              <View className="flex w-full mt-4 gap-y-4">
                {waste.Vote_wastetype.map(([label, total, percent], index)=>(
                  <PercentCard
                  key={index}
                  bg={colorMap[label]}
                  wasteType={label}
                  votePercent={percent}
                  voteNumber={total}
                  />
                ))}
              </View>
            </View>
          </View>
        )}


    </View>
  );
}




