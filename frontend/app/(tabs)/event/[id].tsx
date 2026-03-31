import React, { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
// 1. เพิ่ม Alert เข้ามาใน import
import { View, Text, Image, Pressable, ScrollView, Modal, Alert } from 'react-native';
import { shadow } from "@/styles/shadow";
import axios from 'axios';
import { API_URL } from "@/config";
import VoteCard from '@/components/VoteCard';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "@/components/loading";
import { useRouter } from "expo-router";
import { mapAndSortVotes, mapAndSortProbs, calculateTotal } from "@/utils/wasteDataTransform";
import { getImage } from "@/lib/s3Service";

type ProbsList = [string, number][];
type VoteList = [string, number, Number][];
interface HistoryItem {
  Vote_wastetype: any;
  Waste_ID: number;
  User_ID: number;
  WasteType_ID: number;
  Image_path: string;
  timestamp: string;
  Probs: number[];
  total: number;
  isVoted: boolean;
}

const EventDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [selectedVote, setSelectedVote] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isModalVisible, setModalVisible] = useState(false);

  const [stat, setStat] = useState<{ vote: VoteList, prob: ProbsList }>({
    vote: [],
    prob: []
  });
  const router = useRouter();
  const isSubmitting = useRef(false);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/gethistorybyid`,
        { params: { wasteId: id, userId: userId } }
      );
      const data = res.data;

      const total = calculateTotal(data.item.Vote_wastetype);
      const vote = mapAndSortVotes(data.item.Vote_wastetype);
      const probs = mapAndSortProbs(data.item.Probs);

      setItem((prev) => ({
        ...(prev || {}),
        ...data.item,
        total,
        isVoted: data.isVoted,
      }));
      setStat({ vote: vote, prob: probs });
    } catch (error) {
      console.log('error: ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const getId = await AsyncStorage.getItem("userId");
      setUserId(getId);
    })();
  }, []);

  useEffect(() => {
    if (!id || !userId) return;
    setLoading(true);
    fetchStats();
  }, [id, userId]);

  const voteHandler = async () => {
    if (!selectedVote) return;
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    try {
      const res = await axios.post(`${API_URL}/vote`,
        {
          wasteID: id,
          userID: userId,
          vote: selectedVote
        }
      );
      console.log("POST done:", res.status);
      
      Alert.alert(
        "ส่งผลโหวตสำเร็จ",
        "คุณได้รับ 1 แต้ม ขอบคุณที่ร่วมกันคัดแยกขยะนะครับ",
        [
          { 
            text: "ตกลง", 
            onPress: () => router.push("/(tabs)/event") 
          }
        ]
      );
      
    } catch (error) {
      console.log(error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถส่งผลโหวตได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      isSubmitting.current = false;
    }
  };

  if (loading) {
    return <Loading />;
  }

  const colorMap: { [key: string]: string } = {
    "ขยะอันตราย": "bg-[#EF4545]",
    "ขยะอินทรีย์": "bg-[#28C45C]",
    "ขยะทั่วไป": "bg-[#2F98DD]",
    "ขยะรีไซเคิล": "bg-[#FCD92C]"
  };

  return (
    <View className='relative flex-1 bg-[#F9F8FA] w-full'>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className='flex-1 bg-black/95 justify-center items-center'>
          <Pressable
            className='absolute top-12 right-6 z-50 p-2 bg-black/50 rounded-full'
            onPress={() => setModalVisible(false)}
          >
            <Text className='text-white text-lg font-bold px-2'>X</Text>
          </Pressable>

          <Image
            source={{ uri: getImage(item?.Image_path) }}
            className='w-full h-full'
            resizeMode='contain'
          />
        </View>
      </Modal>

      <Pressable className='absolute top-10 left-7 z-50' onPress={() => { router.back() }}>
        <Image source={require('@/assets/images/back1.png')} />
      </Pressable>

      <ScrollView
        className='flex-1 w-full'
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className='flex w-full max-w-[340px] mt-28' >
          <Pressable onPress={() => setModalVisible(true)}>
            <Image
              className='w-full h-[200px] rounded-lg' source={{ uri: getImage(item?.Image_path) }}
              resizeMode='cover'
            />
          </Pressable>
        </View>

        <View className='flex px-8 pt-6 w-full'>
          <View className='w-full bg-white rounded-lg p-4' style={shadow.card}>
            <View className='flex flex-row justify-center w-full'>
              <View className='flex'><Text className='text-xl'>ผลลัพธ์ปัจจุบัน</Text></View>
              <View className='flex-1 items-end'>
                {stat.vote.length > 0 ? (
                  <Text className='text-xl font-bold'>
                    {Number(stat.vote[0][1]) > 0 ? `${stat.vote[0][0]} ${stat.vote[0][2]}%` : "-"}
                  </Text>
                ) : <Text>error</Text>}
              </View>
            </View>
            <View className='flex flex-row justify-center w-full mt-2'>
              <View className='flex-1'><Text className='text-xl'>ผลลัพธ์จากระบบ</Text></View>
              <View className='flex-1 items-end'>
                <Text className='text-xl font-bold'>{item?.WasteType_ID === 1 ? "ขยะอินทรีย์" : item?.WasteType_ID === 2
                  ? "ขยะอันตราย" : item?.WasteType_ID === 4 ? "ขยะรีไซเคิล" : "ขยะทั่วไป"}</Text>
              </View>
            </View>
          </View>

          <View className='w-full bg-white rounded-lg p-4 mt-8 mb-4' style={shadow.card}>
            <View className='flex-row justify-between items-center mb-4'>
              {item?.isVoted ? (
                <View className="bg-green-100 px-3 py-1 rounded-full border border-blue-400">
                  <Text className="text-green-700 font-bold">คุณโหวตไปแล้ว</Text>
                </View>
              ) : (
                <View />
              )}
              <Text className='text-lg'>คนโหวตจำนวน {item?.total} คน</Text>
            </View>

            <View className='flex w-full mt-4 gap-y-4'>
              {stat.vote.map(([label, count, percent], index) => (
                <VoteCard
                  key={index}
                  bg={colorMap[label]}
                  wasteType={label}
                  voteNumber={count as number}
                  votePercent={String(percent)}
                  selectedVote={selectedVote}
                  setSelectedVote={setSelectedVote}
                  isVoted={userId !== String(item?.User_ID) && item?.isVoted !== true}
                  hasVoted={item?.isVoted}
                />
              ))}
            </View>
          </View>

          {/* ปุ่มส่งผลโหวต */}
          {(!item?.isVoted && userId !== String(item?.User_ID)) && (
            <Pressable 
              className={`w-full py-4 rounded-full mt-4 flex items-center justify-center ${selectedVote ? 'bg-[#1E8B79]' : 'bg-gray-300'}`}
              disabled={!selectedVote || isSubmitting.current}
              onPress={voteHandler}
            >
              <Text className={`text-xl font-bold ${selectedVote ? 'text-white' : 'text-gray-500'}`}>
                ยืนยันการโหวต
              </Text>
            </Pressable>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

export default EventDetail;