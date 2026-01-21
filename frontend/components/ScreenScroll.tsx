import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_SPACE = 120;

export default function ScreenScroll({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: TAB_SPACE + insets.bottom,
      }}
    >
      {children}
    </ScrollView>
  );
}
