import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, ListRenderItem } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { readImage } from "@/lib/storage"
export interface HistoryItem {
  Image_ID: number;
  User_ID: number;
  Waste_ID: number;
  Image_path: string;
  timestamp: string;
  probs: number[];
}

const WASTE_LABEL: Record<number, 'ขยะย่อยสลาย' | 'ขยะอันตราย' | 'ขยะรีไซเคิล' | 'ขยะทั่วไป'> = {
  1: 'ขยะย่อยสลาย',
  2: 'ขยะอันตราย',
  3: 'ขยะรีไซเคิล',
  4: 'ขยะทั่วไป',
};

const wasteLabel = (id: number) => WASTE_LABEL[id] ?? 'unknown';


const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH-u-ca-gregory', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const Recents = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const getHistory = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.warn("User id is undefined!!");
        return;
      }

      const { data } = await axios.get("http://193.168.182.241:3000/gethistory", {
        params: { userId },
      });

      const raw: HistoryItem[] = Array.isArray(data?.img) ? data.img : [];

      const hydrated: HistoryItem[] = await Promise.all(
        raw.map(async (it) => {
          try {
            const localUri = await readImage(it.User_ID, it.Image_ID, "jpeg");
            return { ...it, Image_path: localUri };
          } catch {
            return it; //case ไม่เจอ path
          }
        })
      );
      setHistory(hydrated);
    } catch (error: any) {
      console.log("getHistory error:", error?.response?.status, error?.response?.data || error?.message);
    }
  };

  useEffect(() => {
    getHistory();
  }, []);

  const renderItem: ListRenderItem<HistoryItem> = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.Image_path }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{wasteLabel(item.Waste_ID)}</Text>
        <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
      </View>
      <Text style={styles.arrow}>{'>'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header} className='text-3xl'>ประวัติการคัดแยกขยะ</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.Image_ID.toString()}  // ใช้ Image_ID เป็น key
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FDF7",
    padding: 32,
  },
  header: {
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
    elevation: 2,
    shadowColor: "#000",
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
    textTransform: "capitalize", // ให้ขึ้นต้นด้วยตัวใหญ่สวย ๆ
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

export default Recents;
