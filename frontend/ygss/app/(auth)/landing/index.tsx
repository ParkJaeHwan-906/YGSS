import { useEffect } from "react"
import { Stack, useRouter } from "expo-router"

export default function LandingIndex() {
    const router = useRouter()
    
    useEffect(() => {
        router.replace("/(auth)/landing/landing1")
    }, [])
    return <Stack.Screen options={{ headerShown: false }} />
}