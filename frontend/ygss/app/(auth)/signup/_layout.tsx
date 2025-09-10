// (auth)/signup/_layout.tsx
import { Stack } from "expo-router";

export default function SignupLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
            <Stack.Screen name="name" />
            <Stack.Screen name="email" />
            <Stack.Screen name="password" />
            <Stack.Screen name="complete" />
        </Stack>
    );
}