type WasteKey = "recycle" | "danger" | "general" | "compost";
import { Image, Text, View, Pressable } from 'react-native';

function WasteType({
  k,
  label,
  color,
  selectedKey,
  setSelectedKey,
}: {
  k: WasteKey;
  label: string;
  color: string;
  selectedKey: string;
  setSelectedKey: (k: WasteKey) => void;
}) {
  const active = selectedKey === k;

  return (
    <Pressable
      onPress={() => setSelectedKey(k)}
      className="w-1/2 px-2 mb-4 items-center"
    >
      <View className="flex-row items-center justify-center">
        <View
          className="w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: color, opacity: active ? 1 : 0.5 }}
        />
        <Text className={`text-lg ${active ? "opacity-100" : "opacity-60"}`}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export default WasteType;