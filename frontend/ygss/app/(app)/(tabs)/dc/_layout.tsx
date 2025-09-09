// app/(app)/(tabs)/dc/_layout.tsx
import { Stack } from "expo-router";

export default function DcLayout() {
  return (
    <Stack initialRouteName="dc1" screenOptions={{ headerShown: false }} />
  );
}