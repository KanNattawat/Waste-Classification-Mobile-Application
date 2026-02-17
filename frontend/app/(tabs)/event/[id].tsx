import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { View, Text, Image, Pressable } from 'react-native';
import { shadow } from "@/styles/shadow";
import axios from 'axios';
import { API_URL } from "@/config";
import VoteCard from '@/components/VoteCard';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "@/components/loading";

interface HistoryItem {
  Vote_wastetype: any;
  Waste_ID: number;
  User_ID: number;
  WasteType_ID: number;
  Image_path: string;
  timestamp: string;
  Probs: number[];
  total:number
}

type WasteDataList = [string, number, number][];

const EventDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [selectedVote, setSelectedVote] = useState("");
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true);
  const [stat, setStat] = useState<{ vote: WasteDataList, prob: WasteDataList }>({
    vote: [],
    prob: []
  });

  useEffect(() => {
    (async () => {
      const getId = await AsyncStorage.getItem("userId");
      setUserId(getId);
    })();
  }, []);

  useEffect(() => {
    if (!id || !userId) return;
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/gethistorybyid`,
          { params: { wasteId: id, userId: userId } }
        )
        const data = res.data;
        const labels = ["ขยะอินทรีย์", "ขยะอันตราย", "ขยะทั่วไป", "ขยะรีไซเคิล"];
        //vote
        const voteArray = data.item.Vote_wastetype
        const total = voteArray.reduce((sum: number, i: number) => { sum += i; return sum }, 0)

        const mappedProb = labels.map((l, i) => [l, data.item.Probs[i] ?? [], data.item.Vote_wastetype[i]] as [string, number, number]);
        const mappedVote = labels.map((l, i) => {
          const votenumber = voteArray[i]
          const percent = total > 0 ? ((votenumber / total) * 100).toFixed(2) : 0

          return [l, data.item.Vote_wastetype[i] ?? [], percent] as [string, number, number]
        });
        const sortedmappedVote = mappedVote.sort((a, b) => b[1] - a[1]);
        console.log('data', mappedProb)
        // [label, votenumber, percentage]
        setItem({...data.item, total:total})
        setStat({ vote: sortedmappedVote, prob: mappedProb })
      } catch (error) {
        console.log('error: ', error)
      }
      finally {
        setLoading(false)
      }
    };

    fetchStats()
  }, [id, userId])


  const voteHandler = async () => {
    try {
      const res = await axios.post(`${API_URL}/vote`,
        {
          wasteID: id,
          userID: userId,
          vote: selectedVote
        }
      )
    } catch (error) {
      console.log(error)
    }
  }

  if (loading) {
    return <Loading />
  }

  const colorMap: { [key: string]: string } = {
  "ขยะอันตราย": "[#EF4545]",
  "ขยะอินทรีย์": "[#28C45C]",
  "ขยะทั่วไป": "[#2F98DD]",
  "ขยะรีไซเคิล": "[#FCD92C]"
};

  return (
    <View className='flex bg-[#F9F8FA] w-full h-full justify-start items-center'>

      <View className='flex w-full max-w-[340px] mt-16' >
        <Image
          className='w-full h-[200px] rounded-lg' source={{ uri: item?.Image_path }}
          resizeMode='cover'

        />
      </View>

      <View className='flex p-8 w-full h-full'>
        <View className='w-full bg-white rounded-lg p-4' style={shadow.card}>
          <View className='flex flex-row justify-center w-full'>
            <View className='flex-1'><Text className='text-xl'>ผลลัพธ์ปัจจุบัน</Text></View>
            <View className='flex-1 items-end'>
              {stat.vote.length > 0 ? (
                <Text className='text-xl font-bold'>
                  {stat.vote[0][0]} {stat.vote[0][2]}%
                </Text>
              ) : <Text>error</Text>}
            </View>
          </View>
          <View className='flex flex-row justify-center w-full'>
            <View className='flex-1'><Text className='text-xl'>ผลลัพธ์จากระบบ</Text></View>
            <View className='flex-1 items-end'>
              <Text className='text-xl font-bold'>{item?.WasteType_ID === 1 ? "ขยะอินทรีย์" : item?.WasteType_ID === 1
                ? "ขยะอันตราย" : item?.WasteType_ID === 1 ? "ขยะรีไซเคิล" : "ขยะทั่วไป"}</Text>
            </View>
          </View>
        </View>

        <View className='w-full bg-white rounded-lg p-4 mt-8' style={shadow.card}>

          <View className='flex items-end '>
            <Text className='text-lg text-end'>คนโหวตจำนวน {item?.total} คน</Text>
          </View>

          <View className='flex w-full mt-4 gap-y-4'>
            {stat.vote.map(([label, count, percent], index) => (
              <VoteCard
                key={index}
                bg={colorMap[label]}
                wasteType={label}
                voteNumber={count}
                votePercent={String(percent)}
                selectedVote={selectedVote}
                setSelectedVote={setSelectedVote}
                isOwner={userId === String(item?.User_ID)}
              />
            ))}
          </View>
          <View className='flex-row w-full justify-center'>
            {userId !== String(item?.User_ID) && (
              <Pressable className='py-3 bg-[#1E8B79] rounded-xl items-center w-[47%] mt-4' onPress={voteHandler} >
                <Text className='text-xl text-white  text-center '>ส่งผลโหวต</Text>
              </Pressable>)}
          </View>

        </View>

      </View>
    </View>
  )
}

export default EventDetail