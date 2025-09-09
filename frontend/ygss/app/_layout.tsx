// app/_layout.tsx
import 'react-native-gesture-handler'
import 'react-native-reanimated'

import { Slot, usePathname } from "expo-router";
import { Provider } from "react-redux";
import { store } from "@/src/store";

export default function RootLayout() {
  console.log(usePathname());
  return (
    <Provider store={store}>
      <Slot />
    </Provider>
  );
}
