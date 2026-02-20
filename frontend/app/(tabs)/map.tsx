import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  Alert,
  FlatList,
  Linking,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

/* ---------- TYPES ---------- */

type JunkShop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  distance: number;
  isOwner?: boolean; // ✨ เพิ่มตัวแปรเช็คว่าเป็นร้านของ user หรือไม่
};

/* ---------- API KEY ---------- */
const GOOGLE_API_KEY = "AIzaSyDOTi8DE-fCsrIPvkHXwuB0Aq_qkffvq-c";

/* ---------- REAL ROUTE DISTANCE ---------- */
const getRouteDistanceKm = async (
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<number | null> => {
  try {
    const url =
      `https://maps.googleapis.com/maps/api/directions/json` +
      `?origin=${originLat},${originLng}` +
      `&destination=${destLat},${destLng}` +
      `&mode=driving` +
      `&language=th` +
      `&key=${GOOGLE_API_KEY}`;

    const res = await fetch(url);
    const json = await res.json();

    if (json.status !== "OK") return null;

    return json.routes[0].legs[0].distance.value / 1000;
  } catch {
    return null;
  }
};

export default function WasteMap() {
  const mapRef = useRef<MapView | null>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [junkShops, setJunkShops] = useState<JunkShop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  /* ---------- MOCK USER DATA ---------- */
  // ⚠️ ฟังก์ชันนี้จำลองการดึงข้อมูลจาก Database ของคุณ
  const fetchUserOwnedShops = async (
    currentLat: number,
    currentLng: number
  ): Promise<JunkShop[]> => {
    // สมมติว่านี่คือข้อมูลที่ดึงมาจาก Database ของ User
    const myShopsFromDB = [
      {
        id: "my-shop-001",
        name: "ร้านรีไซเคิลของฉัน (My Shop)",
        latitude: 13.7563, // ใส่พิกัดจริงจาก DB
        longitude: 100.5018, // ใส่พิกัดจริงจาก DB
        address: "สาขาหลัก กรุงเทพฯ",
      },
    ];

    const processedShops: JunkShop[] = [];

    for (const shop of myShopsFromDB) {
      // คำนวณระยะทางของร้านตัวเองด้วย เพื่อให้ข้อมูลครบถ้วน
      const distance = await getRouteDistanceKm(
        currentLat,
        currentLng,
        shop.latitude,
        shop.longitude
      );

      processedShops.push({
        ...shop,
        distance: distance ?? 0,
        isOwner: true, // ✨ ระบุว่าเป็นเจ้าของ
      });
    }

    return processedShops;
  };

  /* ---------- FETCH PLACES ---------- */

  const fetchNearbyJunkShops = async (lat: number, lng: number) => {
    console.log("Fetching places...");

    // 1. ดึงร้านจาก Google Places (ร้านทั่วไป)
    const url =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?location=${lat},${lng}` +
      `&radius=3000` +
      `&keyword=ร้านรับซื้อของเก่า` +
      `&language=th` +
      `&key=${GOOGLE_API_KEY}`;

    const res = await fetch(url);
    const json = await res.json();

    const googleShops: JunkShop[] = [];

    if (json.status === "OK") {
      for (const item of json.results.slice(0, 8)) {
        const distance = await getRouteDistanceKm(
          lat,
          lng,
          item.geometry.location.lat,
          item.geometry.location.lng
        );
        if (distance === null) continue;

        googleShops.push({
          id: item.place_id,
          name: item.name,
          latitude: item.geometry.location.lat,
          longitude: item.geometry.location.lng,
          address: item.vicinity,
          distance,
          isOwner: false,
        });
      }
      // เรียงร้านทั่วไปตามระยะทาง
      googleShops.sort((a, b) => a.distance - b.distance);
    }

    // 2. ดึงร้านของ User (ร้านของฉัน)
    const myShops = await fetchUserOwnedShops(lat, lng);

    // 3. รวมร้าน: เอา [ร้านของฉัน] ไว้หน้าสุด + ตามด้วย [ร้านทั่วไป]
    setJunkShops([...myShops, ...googleShops]);
  };

  /* ---------- LOCATION ---------- */

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Alert.alert("แจ้งเตือน", "กรุณาอนุญาตการเข้าถึงตำแหน่ง");
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation(loc);

        await fetchNearbyJunkShops(loc.coords.latitude, loc.coords.longitude);
      } catch (e) {
        console.log("LOCATION ERROR:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#1E8B79" />
        <Text className="mt-4 text-gray-500">กำลังโหลด...</Text>
      </SafeAreaView>
    );
  }

  const region = {
    latitude: location?.coords.latitude ?? 13.7563,
    longitude: location?.coords.longitude ?? 100.5018,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-6 py-4 flex-row items-center">
        <Text className="text-xl font-bold text-[#1E8B79] flex-1">
          ร้านรับซื้อของเก่าใกล้คุณ
        </Text>

        <Pressable
          onPress={() => router.push("/shop_form/form")}
          className="ml-2 flex-row items-center px-3 py-1.5 rounded-full border border-[#1E8B79]"
        >
          <Ionicons name="add" size={16} color="#1E8B79" />
          <Text className="ml-1 text-[#1E8B79] text-sm font-medium">
            เพิ่มร้านของฉัน
          </Text>
        </Pressable>
      </View>

      {/* Map */}
      <View className="h-2/5">
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={region}
          showsUserLocation
        >
          {junkShops.map((shop) => {
            const isSelected = shop.id === selectedShopId;
            // ✨ กำหนดสี Pin: ร้านเรา(ทอง/เหลือง), เลือก(แดง), ทั่วไป(เขียว)
            let pinColor = "#1E8B79"; // default green
            if (shop.isOwner) pinColor = "#F59E0B"; // gold for owner
            if (isSelected) pinColor = "#FF3B30"; // red for selected

            return (
              <Marker
                key={`${shop.id}-${isSelected}`}
                coordinate={{
                  latitude: shop.latitude,
                  longitude: shop.longitude,
                }}
                pinColor={pinColor}
                onPress={() => setSelectedShopId(shop.id)}
                zIndex={isSelected ? 999 : shop.isOwner ? 998 : 1}
                title={shop.name}
                description={
                  shop.isOwner
                    ? "ร้านของคุณ"
                    : `${shop.distance.toFixed(1)} กม.`
                }
              />
            );
          })}
        </MapView>
      </View>

      {/* List */}
      <View className="flex-1 px-4 pt-2">
        <FlatList
          data={junkShops}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const selected = item.id === selectedShopId;

            return (
              <View
                className={`rounded-xl mb-3 p-4 border ${
                  selected
                    ? "bg-[#E6F6F3] border-[#1E8B79]"
                    : item.isOwner
                    ? "bg-[#FFFBF0] border-[#F59E0B]" // ✨ Highlight ร้านตัวเอง (สีเหลืองอ่อน)
                    : "bg-white border-gray-100"
                }`}
              >
                <Pressable
                  onPress={() => {
                    setSelectedShopId(item.id);
                    if (!location) return;

                    mapRef.current?.fitToCoordinates(
                      [
                        location.coords,
                        {
                          latitude: item.latitude,
                          longitude: item.longitude,
                        },
                      ],
                      {
                        edgePadding: {
                          top: 80,
                          right: 80,
                          bottom: 80,
                          left: 80,
                        },
                        animated: true,
                      }
                    );
                  }}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      {/* ✨ Badge ร้านของคุณ */}
                      {item.isOwner && (
                        <View className="bg-[#F59E0B] self-start px-2 py-0.5 rounded-md mb-1">
                          <Text className="text-white text-xs font-bold">
                            ร้านของคุณ
                          </Text>
                        </View>
                      )}
                      <Text className="text-lg font-semibold text-[#1E8B79]">
                        {item.name}
                      </Text>
                    </View>
                    <Text className="text-gray-500 ml-2">
                      {item.distance.toFixed(1)} กม.
                    </Text>
                  </View>

                  <Text className="text-gray-500 text-sm mt-1">
                    {item.address}
                  </Text>
                </Pressable>

                {selected && (
                  <Pressable
                    className="mt-3 bg-[#1E8B79] py-2 rounded-lg items-center"
                    onPress={() => {
                      // ✨ แก้ไข Link ให้ถูกต้องสำหรับเปิด Google Maps App
                      const url = Platform.select({
                        ios: `maps://app?daddr=${item.latitude},${item.longitude}`,
                        android: `google.navigation:q=${item.latitude},${item.longitude}`,
                      });
                      // Fallback เป็น Web ถ้าเปิด App ไม่ได้
                      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;

                      Linking.canOpenURL(url!).then((supported) => {
                        if (supported) {
                          Linking.openURL(url!);
                        } else {
                          Linking.openURL(webUrl);
                        }
                      });
                    }}
                  >
                    <Text className="text-white font-semibold">
                      นำทางด้วย Google Maps
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}