import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_HEIGHT = 90;
const TAB_MARGIN = 18;

export function Screen({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: TAB_HEIGHT + TAB_MARGIN + insets.bottom,
      }}
    >
      {children}
    </View>
  );
}