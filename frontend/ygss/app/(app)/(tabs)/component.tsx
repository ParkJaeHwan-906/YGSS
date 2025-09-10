import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ComponentsPage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>컴포넌트 모아보기</Text>
        <Text style={styles.desc}>
          atoms / molecules / organisms 컴포넌트를 테스트하는 공간입니다.
        </Text>

        {/* ✅ 여기에 직접 컴포넌트들을 import 해서 배치하면 됩니다 */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
});
