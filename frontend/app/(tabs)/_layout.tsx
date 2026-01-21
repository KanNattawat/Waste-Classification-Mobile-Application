import { router, Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View, Text, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import Picker from "../../components/Picker";



const _layout = () => {
  const router = useRouter();
  const [picker, setPicker] = useState(false);
  type PickSource = "camera" | "library";

  // const takeaPhoto = async (source: PickSource) : Promise<string | null> => {

  //   if(source === "camera"){
  //     const { status } = await ImagePicker.requestCameraPermissionsAsync();
  //         if (status !== "granted") {
  //             alert("กรุณาอนุญาตการเข้าถึงกล้องเพื่อใช้งาน");
  //             return null;
  //         }
  //   }
  //   else{
  //     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //         if (status !== "granted") {
  //             alert("กรุณาอนุญาตการเข้าถึงรูปภาพเพื่อใช้งาน");
  //             return null;
  //         }
  //   }

  //   const result = source === "camera"? await ImagePicker.launchCameraAsync({
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 0.7,
  //   }) 
  //   : await ImagePicker.launchImageLibraryAsync({
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 0.7,
  //   });
  //   router.push({ pathname: "/result", params: { photo: result.assets[0].uri } });
  //   if (result.canceled) {
  //     return result.assets[0].uri;
  //   }
  // };

  const takeaPhoto = async (router: ReturnType<typeof useRouter>) => {
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
      const uri = result.assets[0].uri;
      router.push({ pathname: "/result", params: { photo: uri } });
    }
  };

  const pickImage = async (router: ReturnType<typeof useRouter>) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("กรุณาอนุญาตการเข้าถึงแกลเลอรีเพื่อใช้งาน");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      router.push({ pathname: "/result", params: { photo: uri } });
    }
  };


  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#4C944C",
          tabBarInactiveTintColor: "#95a5a6",
          tabBarStyle: {
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: "white",
            margin: 18,
            borderRadius: 16,
            height: 90,
            position: "absolute",
            borderTopWidth: 0,
            paddingBottom: 11,
            paddingTop: 11,
            paddingHorizontal: 22
          },

          tabBarItemStyle: {
            width: "auto",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            paddingVertical: 0,
            paddingHorizontal: 0,
          },

          tabBarIconStyle: {
            marginTop: 0,
            height: 34,
            width: 34,
          },

          tabBarLabelStyle: {
            fontSize: 20,
            marginBottom: 6,
          }
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "โฮม",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={34} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="recents"
          options={{
            title: "ประวัติ",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <Ionicons name="time" size={34} color={color} />
            ),
          }}
        />


        <Tabs.Screen
          name="scan"
          options={{
            title: "สแกน",
            tabBarLabel: () => null,
            tabBarIcon: () => null,

            tabBarButton: (props) => {
              const focused = props.accessibilityState?.selected;

              return (
                <View>
                  <Pressable
                    {...props}
                    onPress={() => {
                      setPicker(true);
                    }}
                    style={{ flex: 1, alignItems: "center" }}
                    android_ripple={null}
                  >
                    <View style={{ flex: 1, alignItems: "center" }}>
                      <View
                        style={{
                          position: "absolute",
                          alignSelf: "center",
                          top: -45,
                          width: 80,
                          height: 80,
                          borderRadius: 999,
                          backgroundColor: "#4C944C",
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 6,
                          borderColor: "white",
                          transform: [{ scale: focused ? 1.02 : 1 }],
                        }}
                      >
                        <Ionicons name="camera" size={30} color="white" />
                      </View>

                      <Text
                        style={{
                          marginTop: 26,
                          fontSize: 20,
                          color: "#4C944C",
                        }}
                      >
                        ถ่ายรูป
                      </Text>
                    </View>
                  </Pressable>
                </View>
              );
            },
          }}
        />


        <Tabs.Screen
          name="profile"
          options={{
            title: "โปรไฟล์",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" size={34} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="point"
          options={{
            title: "แลกแต้ม",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" size={34} color={color} />
            ),
          }}
        />

      </Tabs>

      <Picker
        visible={picker}
        onClose={() => setPicker(false)}
        onCamera={async () => {
          setPicker(false);
          await takeaPhoto(router);
        }}
        onGallery={async () => {
          setPicker(false);
          await pickImage(router);
        }}
      />
    </>
  );
};

export default _layout;
