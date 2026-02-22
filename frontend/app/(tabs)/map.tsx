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
import { useRef, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

/* ---------- CONFIG ---------- */
const API_URL = "https://waste-classification-mobile-application.onrender.com";

/* ---------- TYPES ---------- */
type JunkShop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  distance: number;
  isOwner?: boolean;
  status?: boolean; // ✅ เพิ่ม properties status
};

/* ---------- API KEY ---------- */
const GOOGLE_API_KEY = "AIzaSyDOTi8DE-fCsrIPvkHXwuB0Aq_qkffvq-c"; // แนะนำให้ซ่อน API Key ไว้ใน .env

/* ---------- HELPER: Calculate Distance ---------- */
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

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [junkShops, setJunkShops] = useState<JunkShop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  const currentUserId = "1";

  /* ---------- FETCH USER SHOPS FROM DB ---------- */
  const fetchUserOwnedShops = async (
    currentLat: number,
    currentLng: number
  ): Promise<JunkShop[]> => {
    try {
      const response = await fetch(
        `${API_URL}/recycle-shop2?userId=${currentUserId}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch user shops");
      }

      const dbShops = await response.json();
      const processedShops: JunkShop[] = [];

      for (const shop of dbShops) {
        if (!Array.isArray(shop.Location) || shop.Location.length < 2) {
            continue;
        }

        const shopLat = shop.Location[0];
        const shopLng = shop.Location[1];

        if (isNaN(shopLat) || isNaN(shopLng)) continue;

        const distance = await getRouteDistanceKm(
          currentLat,
          currentLng,
          shopLat,
          shopLng
        );

        processedShops.push({
          id: `db-${shop.Shop_ID}`, 
          name: shop.Shop_name,
          latitude: shopLat,
          longitude: shopLng,
          address: shop.Tel_num,
          distance: distance ?? 0,
          isOwner: true,
          status: shop.Status, // ✅ ดึง Status จาก API มาเก็บไว้
        });
      }

      return processedShops;
    } catch (error) {
      console.error("Error fetching user shops:", error);
      return [];
    }
  };

  /* ---------- FETCH PLACES (GOOGLE + DB) ---------- */
  const fetchNearbyJunkShops = async (lat: number, lng: number) => {
    console.log("Fetching places...");

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
      googleShops.sort((a, b) => a.distance - b.distance);
    }

    const myShops = await fetchUserOwnedShops(lat, lng);
    setJunkShops([...myShops, ...googleShops]);
  };

  /* ---------- LOCATION & RELOAD DATA ---------- */
  useFocusEffect(
    useCallback(() => {
      let isActive = true; 

      const loadData = async () => {
        setLoading(true);
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("แจ้งเตือน", "กรุณาอนุญาตการเข้าถึงตำแหน่ง");
            if (isActive) setLoading(false);
            return;
          }

          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          if (isActive) {
            setLocation(loc);
            await fetchNearbyJunkShops(loc.coords.latitude, loc.coords.longitude);
          }
        } catch (e) {
          console.log("LOCATION ERROR:", e);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, [])
  );

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
            เพิ่มร้าน
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
            let pinColor = "#1E8B79"; 
            if (shop.isOwner) pinColor = "#F59E0B"; 
            if (isSelected) pinColor = "#FF3B30"; 

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
                description={shop.isOwner ? "ร้านของคุณ" : `${shop.distance.toFixed(1)} กม.`}
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
                    ? "bg-[#FFFBF0] border-[#F59E0B]"
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
                        { latitude: item.latitude, longitude: item.longitude },
                      ],
                      {
                        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
                        animated: true,
                      }
                    );
                  }}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      {/* ✅ แก้ไขส่วนป้าย Tag ด้านบนชื่อร้าน */}
                      {item.isOwner && (
                        <View className="flex-row items-center mb-1">
                           <View className="bg-[#F59E0B] px-2 py-0.5 rounded-md mr-2">
                            <Text className="text-white text-xs font-bold">
                              ร้านของคุณ
                            </Text>
                          </View>
                          
                          {/* ✅ แสดง Tag สถานะร้าน (เปิดให้บริการ หรือ รอการตรวจสอบ) */}
                           <View className={`px-2 py-0.5 rounded-md ${item.status ? 'bg-green-100 border border-green-500' : 'bg-gray-100 border border-gray-400'}`}>
                                <Text className={`text-xs font-bold ${item.status ? 'text-green-600' : 'text-gray-600'}`}>
                                    {item.status ? 'เปิดให้บริการ' : 'รอการตรวจสอบ'}
                                </Text>
                           </View>
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

                {/* ส่วนปุ่มด้านล่างเมื่อโดนเลือก (Expanded Menu) */}
                {selected && (
                  <View className="mt-3">
                    <Pressable
                      className={`bg-[#1E8B79] py-2 rounded-lg items-center ${item.isOwner ? 'mb-2' : ''}`}
                      onPress={() => {
                         const url = Platform.select({
                          ios: `maps://app?daddr=${item.latitude},${item.longitude}`,
                          android: `google.navigation:q=${item.latitude},${item.longitude}`,
                        });
                        const webUrl = `http://googleusercontent.com/maps.google.com/maps?daddr=${item.latitude},${item.longitude}`;
                        Linking.canOpenURL(url!).then((supported) => {
                          if (supported) Linking.openURL(url!);
                          else Linking.openURL(webUrl);
                        });
                      }}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="navigate" size={16} color="white" style={{ marginRight: 6 }} />
                        <Text className="text-white font-semibold">
                          นำทางด้วย Google Maps
                        </Text>
                      </View>
                    </Pressable>

                    {item.isOwner && (
                      <Pressable
                        className="border border-[#1E8B79] bg-white py-2 rounded-lg items-center flex-row justify-center"
                        onPress={() => {
                          const realShopId = item.id.replace('db-', '');
                          router.push({
                            pathname: "/shop_form/edit_form", 
                            params: { shopId: realShopId }
                          });
                        }}
                      >
                        <Ionicons name="create-outline" size={18} color="#1E8B79" style={{ marginRight: 6 }} />
                        <Text className="text-[#1E8B79] font-semibold">
                          แก้ไขข้อมูลร้าน
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}