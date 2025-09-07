import { Pressable, Text, Image } from "react-native";

/*
1.button color
2.border color
3.mt
4.px
5.text color
6.image source
7.text
*/

export default function Buttons({
  buttonColor,
  borderColor,
  mt,
  px,
  textColor,
  imageSource,
  text,
}: {
  buttonColor: string;
  borderColor: string;
  mt: string;
  px: string;
  textColor: string;
  imageSource: any;
  text: string;
}) {
  return (
    <Pressable
      android_ripple={{ color: "#E6F4E6" }}
      className={`flex-row items-center ${mt} ${px} py-2 border ${borderColor} ${buttonColor} rounded-lg`}
      onPress={() => console.log("กดอัปโหลดรูป")}
    >
      <Image
        source={imageSource}
        className="w-12 h-12"
        resizeMode="contain"
      />
      <Text className={`ml-2 ${textColor} text-lg font-medium`}>
        {text}
      </Text>
    </Pressable>
  );
}