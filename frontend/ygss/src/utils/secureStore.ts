// src/utils/secureStore.ts
import * as SecureStore from "expo-secure-store";

const REFRESH_KEY = "refresh_token";

export async function saveRefreshToken(token: string) {
    await SecureStore.setItemAsync(REFRESH_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_KEY);
}

export async function deleteRefreshToken() {
    await SecureStore.deleteItemAsync(REFRESH_KEY);
}
