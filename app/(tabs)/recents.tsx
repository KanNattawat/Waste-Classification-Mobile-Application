import Buttons from '@/components/buttons'
import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'

const ProgressBar = ({ label, percent, color }) => {
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

const recents = () => {
  return (
    <View className="flex-1 items-center justify-center bg-[#F8FDF9] pt-10">

      <Text className="text-2xl font-bold text-[#4C944C]">
        ผลลัพธ์การคัดแยกขยะ
      </Text>

      <Image
        source={{
          uri: 'https://www.thaipedigree.com/static/articles/92a251af5c475574e8468931d8eb8d8938da855fad4aec8851529b9e9a3271be.jpeg'
        }}
        style={imgstyles.image}
        className='shadow-md'
      />

      <Text className="text-3xl mt-2">ขยะอันตราย</Text>
      <Text className="text-base mt-2 pl-6 pr-6 text-center text-[#545454]">
        ขยะชิ้นนี้มีความอันตรายสูง โปรดระมัดระวังในการจัดเก็บและนำไปทิ้งในจุดที่มีการรับทิ้งขยะประเภทนี้
      </Text>

      <View style={{ width: "90%", marginTop: 48 }}>
        <ProgressBar label="ขยะอันตราย" percent={90} color="#EF4545" />
        <ProgressBar label="ขยะย่อยสลายได้" percent={5.8} color="#28C45C" />
        <ProgressBar label="อื่นๆ" percent={4.2} color="#C260FB" />
      </View>

      <View style={btnstyles.container}>
        <TouchableOpacity style={btnstyles.greenButton}>
          <Text style={btnstyles.buttonText}>คัดแยกใหม่อีกครั้ง</Text>
        </TouchableOpacity>
      </View>
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

export default recents
