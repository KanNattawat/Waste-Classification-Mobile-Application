import React, { useState, useEffect } from 'react';
import { Text, View, Image, Pressable, Modal, ActivityIndicator, Alert, ScrollView } from 'react-native'; 
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from "@/config";

const Item = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [open, setOpen] = useState(false);
  const [itemData, setItemData] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('authToken');

      if (!id) return;

      const itemRes = await fetch(`${API_URL}/manage/getallitem/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (itemRes.ok) {
        const itemJson = await itemRes.json();
        setItemData(itemJson);
      }

      const userId = await AsyncStorage.getItem("userId"); 
      
      if (userId) {
        const userRes = await fetch(`${API_URL}/home?userId=${userId}`, { 
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userRes.ok) {
          const userJson = await userRes.json();
          setUserPoints(userJson.point || 0); 
        }
      }

    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    try {
      setRedeeming(true);
      const token = await SecureStore.getItemAsync('authToken');

      const res = await fetch(`${API_URL}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: id }) 
      });

      const result = await res.json();

      if (res.ok) {
        setOpen(false);
        Alert.alert("Success", `Successfully redeemed ${itemData.Item_name}!`, [
          { text: "OK", onPress: () => router.replace('/(tabs)/point') } 
        ]);
      } else {
        setOpen(false);
        Alert.alert("Error", result.error || "Unable to redeem reward.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to connect to the server.");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F9F8FA]">
        <ActivityIndicator size="large" color="#1E8B79" />
      </View>
    );
  }

  if (!itemData) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F9F8FA]">
        <Text className="text-xl">Item information not found</Text>
        <Pressable className="mt-4 p-3 bg-gray-300 rounded-xl" onPress={() => router.back()}>
          <Text>Back</Text>
        </Pressable>
      </View>
    );
  }

  const isEnoughPoints = userPoints >= itemData.Point_Usage;

  return (
    <View className='flex-1 bg-[#F9F8FA]' style={{ paddingTop: insets.top }}>
      
      <Pressable 
        className='absolute left-5 z-50 bg-white/80 rounded-full p-2 shadow-sm' 
        style={{ top: insets.top + 10 }}
        onPress={() => { router.back() }}
      >
        <Image className='w-8 h-8' source={require(`@/assets/images/back1.png`)} />
      </Pressable>

      <ScrollView 
        className='flex-1' 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 100 }} 
        showsVerticalScrollIndicator={false}
      >
        
        <View className='w-full h-[320px] bg-white items-center justify-center pt-8 rounded-t-3xl overflow-hidden'>
          <Image className='w-full h-full' resizeMode="contain" source={{ uri: itemData.Item_Image_path }} />
        </View>

        <View className='px-5 mt-6'>
          <View className='flex flex-row justify-between items-center'>
            <Text className='text-lg font-bold text-[#1E8B79]'>
              Use {itemData.Point_Usage} Points
            </Text>
            <Text className={`text-base font-bold ${isEnoughPoints ? 'text-[#1E8B79]' : 'text-red-500'}`}>
              Your Points: {userPoints}
            </Text>
          </View>

          <Text className='text-3xl font-bold mt-3 text-gray-800'>{itemData.Item_name}</Text>
          
          <Text className='text-xl font-bold mt-6 text-gray-800'>Details</Text>
          <Text className='text-base mt-2 text-gray-600 leading-6'>
            Redemption Limit: {itemData.Usage_Limit} time(s) {'\n'}
            Expiry Date: {new Date(itemData.Expire_Date).toLocaleDateString("th-TH")}
          </Text>

          <Text className='text-xl font-bold mt-6 text-gray-800'>Terms & Conditions</Text>
          <Text className='text-base mt-2 text-gray-600 leading-6'>
            How to Earn Points {"\n"}
            You can earn points by completing the following activities: {"\n"}
            1. Take a photo to classify waste: Earn 1 point <Text className='text-[#FF0000]'>(Limit: 5 times/day)</Text>  {"\n"}
            2. Join community waste sorting activities: Earn 1 point <Text className='text-[#FF0000]'>(Limit: 5 times/day)</Text>
          </Text>
        </View>

        <View className='px-5 mt-10'>
          <Pressable 
            className={`py-4 w-full items-center rounded-2xl shadow-sm ${isEnoughPoints ? 'bg-[#1E8B79]' : 'bg-gray-400'}`} 
            onPress={() => isEnoughPoints ? setOpen(true) : Alert.alert("Insufficient Points", "You do not have enough points to redeem this reward.")}
          >
            <Text className='text-xl font-bold text-white'>{isEnoughPoints ? 'Confirm Redemption' : 'Insufficient Points'}</Text>
          </Pressable>
        </View>

      </ScrollView>

      {open && (
        <Modal transparent visible={open} animationType="fade" statusBarTranslucent={true}>
          <View className="flex-1 bg-black/60 justify-center items-center px-6">
            <View className="bg-white w-full p-8 rounded-3xl items-center shadow-2xl">
              <Text className="text-2xl font-bold text-gray-800 text-center leading-10">
                Confirm redemption of {'\n'} <Text className="text-[#1E8B79] text-3xl">{itemData.Point_Usage}</Text> points?
              </Text>

              <View className='flex flex-row w-full justify-between mt-8'>
                <Pressable
                  className="bg-[#ED5353] w-[45%] py-4 rounded-xl items-center"
                  onPress={() => setOpen(false)}
                  disabled={redeeming}
                >
                  <Text className="text-white text-lg font-bold">Cancel</Text>
                </Pressable>

                <Pressable
                  className={`w-[45%] py-4 rounded-xl items-center ${redeeming ? 'bg-gray-400' : 'bg-[#1E8B79]'}`}
                  onPress={handleRedeem}
                  disabled={redeeming}
                >
                  {redeeming ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-lg font-bold">Confirm</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}

export default Item;