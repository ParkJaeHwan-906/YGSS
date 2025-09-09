// app/_layout.tsx
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { store } from "@/src/store";
import { Slot, usePathname } from "expo-router";
import { Provider } from "react-redux";

export default function RootLayout() {
  console.log(usePathname());
  return (
    <Provider store={store}>
      <Slot />
    </Provider>
  );
}
