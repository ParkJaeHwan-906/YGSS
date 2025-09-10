// app/_layout.tsx
import "react-native-gesture-handler";
import "react-native-reanimated";

import { store } from "@/src/store";
import { Slot, usePathname } from "expo-router";
import { Provider } from "react-redux";

import AppInitializer from "@/components/Appinitializer";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { setCustomText, setCustomTextInput } from "react-native-global-props";

SplashScreen.preventAutoHideAsync().catch(() => { });

export default function RootLayout() {
  // ✅ 훅은 조건 없이 최상단에서 호출
  const pathname = usePathname();

  const [fontsLoaded] = useFonts({
    BasicLight: require("@/assets/fonts/GmarketSansTTFLight.ttf"),
    BasicMedium: require("@/assets/fonts/GmarketSansTTFMedium.ttf"),
    BasicBold: require("@/assets/fonts/GmarketSansTTFBold.ttf"),
    Bubble: require("@/assets/fonts/BagelFatOne-Regular.ttf"),
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    // 전역 텍스트 스타일 지정 (훅 아님: 조건 안에서 호출해도 OK)
    setCustomText({
      style: { fontFamily: "BasicMedium" },
    });
    setCustomTextInput({
      style: { fontFamily: "BasicMedium" },
    });

    SplashScreen.hideAsync().catch(() => { });
  }, [fontsLoaded]);

  // ✅ 훅 호출이 끝난 뒤에 조건부 렌더(초기 로딩 화면/NULL) 처리
  if (!fontsLoaded) {
    return null;
  }

  // 참고: 필요하면 여기서 pathname 활용 가능(이미 훅 호출은 끝났음)
  console.log(pathname);

  return (
    <Provider store={store}>
      <AppInitializer />
      <Slot />
    </Provider>
  );
}
