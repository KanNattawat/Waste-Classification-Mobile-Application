import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList } from 'react-native'

const data = [
  { id: "1", title: "ขยะอันตราย", date: "20 สิงหาคม 2026", image: "https://www.thaipedigree.com/static/articles/92a251af5c475574e8468931d8eb8d8938da855fad4aec8851529b9e9a3271be.jpeg" },
  { id: "2", title: "ขยะอันตราย", date: "20 สิงหาคม 2026", image: "https://www.thaipedigree.com/static/articles/92a251af5c475574e8468931d8eb8d8938da855fad4aec8851529b9e9a3271be.jpeg" },
  { id: "3", title: "ขยะอันตราย", date: "20 สิงหาคม 2026", image: "https://www.thaipedigree.com/static/articles/92a251af5c475574e8468931d8eb8d8938da855fad4aec8851529b9e9a3271be.jpeg" },
];

const recents = () => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={styles.arrow}>{">"}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ประวัติการคัดแยกขยะ</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FDF7",
    padding: 16,
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#4C944C",
    marginBottom: 12,
    textAlign: "center",
    paddingTop: 10
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2, // เงาสำหรับ Android
    shadowColor: "#000", // เงาสำหรับ iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  image: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
    color: "#777",
  },
  arrow: {
    fontSize: 20,
    color: "#777",
  },
});

export default recents
