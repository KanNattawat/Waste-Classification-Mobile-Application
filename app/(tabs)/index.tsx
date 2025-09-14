import Buttons from '@/components/buttons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState } from 'react';
import { Image, Text, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null); // delete ?
  // const [result, setResult] = useState<any[]>([]);

  const takeaPhoto = async (setPhoto: (uri: string) => void) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("กรุณาอนุญาตการเข้าถึงกล้องเพื่อใช้งาน");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      router.push({ pathname: "/result", params: { photo: result.assets[0].uri } });
    }
    console.log(result);
  }

  const pickImage = async (setPhoto: (uri: string) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      alert("กรุณาอนุญาตการเข้าถึงแกลเลอรีเพื่อใช้งาน");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      router.push({ pathname: "/result", params: { photo: result.assets[0].uri } });
    }
    console.log(result);

  }

  return (
    <View className="flex-1 items-center justify-center bg-[#F8FDF9]">
      <Text className="text-2xl font-bold text-[#4C944C]">
        แอปพลิเคชันคัดแยกขยะ
      </Text>
      <View className="mt-10 p-7 border border-solid rounded-xl border-[#4C944C] bg-white">
        <Text className="text-lg">
          อาทิตย์นี้คุณแยกขยะไปแล้ว <Text className="text-2xl font-bold text-[#4C944C]"> 5 </Text> ชิ้น
        </Text>
      </View>
      <Image source={require("@/assets/images/trash-logo.png")} className="mt-10" />
      <Text className="text-lg mt-10">
        ใช้กล้องของคุณเพื่อคัดแยกขยะ
      </Text>


      {/* {photo && <Image source={{ uri: photo }} style={{ width: 200, height: 200 }} />} */}

      <Buttons
        buttonColor="bg-[#4C944C]"
        borderColor="border-[#4C944C]"
        mt="mt-16"
        px="px-16"
        textColor="text-white"
        imageSource={require("@/assets/images/Camera.png")}
        text="ถ่ายรูป"
        takeaPhoto={() => takeaPhoto(setPhoto)}
      />
      <Buttons
        buttonColor="bg-[#ffffff]"
        borderColor="border-[#4C944C]"
        mt="mt-6"
        px="px-12"
        textColor="text-[#4C944C]"
        imageSource={require("@/assets/images/Upload.png")}
        text="อัปโหลดรูป"
        takeaPhoto={() => pickImage(setPhoto)}
      />


    </View>
  );
}