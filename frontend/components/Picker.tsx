import React from 'react'
import { Text, View, Modal, Pressable } from 'react-native';


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
          className="bg-white rounded-2xl p-7"
        >
          <Text className='text-xl font-bold mb-4'>
            เลือกวิธี
          </Text>

          <View
          className='flex-row items-center justify-between pt-4'
          >
            <View className='flex-row gap-8'>
              <Pressable onPress={onCamera} hitSlop={10}>
                <Text className='text-[#1F9280] text-lg'>ถ่ายรูป</Text>
              </Pressable>

              <Pressable onPress={onGallery} hitSlop={10}>
                <Text className='text-[#1F9280] text-lg'>
                  เลือกรูปจากแกลเลอรี่
                </Text>
              </Pressable>
            </View>

            <Pressable onPress={onClose} hitSlop={10}>
              <Text className='text-[#1F9280] text-lg'>ยกเลิก</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

