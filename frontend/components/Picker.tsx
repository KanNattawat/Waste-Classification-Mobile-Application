import React from 'react';
import { Text, View, Modal, Pressable } from 'react-native';
// นำเข้า Icon (หากใช้ Expo สามารถใช้ @expo/vector-icons ได้เลย)
import { Ionicons } from '@expo/vector-icons'; 

type Props = {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
};

export default function Picker({
  visible,
  onClose,
  onCamera,
  onGallery,
}: Props) {
  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.35)",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Pressable
          onPress={() => {}}
          className="bg-white rounded-2xl p-6" // ปรับ padding เล็กน้อยให้ดูกระชับ
        >
          {/* ส่วนหัว: ชื่อหัวข้อ + ปุ่มกากบาท */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold">
              เลือกวิธี
            </Text>
            
            <Pressable 
              onPress={onClose} 
              hitSlop={15}
              className="bg-gray-100 p-1.5 rounded-full" // เพิ่มพื้นหลังสีเทาอ่อนและขอบมนให้ไอคอนดูเป็นปุ่มกด
            >
              <Ionicons name="close" size={22} color="#555" />
            </Pressable>
          </View>

          {/* ส่วนตัวเลือก */}
          <View className="flex-row items-center gap-8 pb-2">
            <Pressable onPress={onCamera} hitSlop={10}>
              <Text className="text-[#1F9280] text-lg font-medium">ถ่ายรูป</Text>
            </Pressable>

            <Pressable onPress={onGallery} hitSlop={10}>
              <Text className="text-[#1F9280] text-lg font-medium">
                เลือกจากแกลเลอรี่
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}