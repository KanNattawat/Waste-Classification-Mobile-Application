import { Text, View, Image, Pressable } from "react-native";
import Buttons from '@/components/buttons'

export default function Index() {
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

      <Buttons
        buttonColor="bg-[#4C944C]"
        borderColor="border-[#4C944C]"
        mt="mt-16"
        px="px-16"
        textColor="text-white"
        imageSource={require("@/assets/images/Camera.png")}
        text="ถ่ายรูป"
      />
      <Buttons
        buttonColor="bg-[#ffffff]"
        borderColor="border-[#4C944C]"
        mt="mt-6"
        px="px-12"
        textColor="text-[#4C944C]"
        imageSource={require("@/assets/images/Upload.png")}
        text="อัปโหลดรูป"
      />
    </View>
  );
}