import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/src/theme/colors";

import LinkCard from "@/components/molecules/LinkCard";
import Dict from "@/components/molecules/Dict";
import ItemRatio from "@/components/molecules/ItemRatio";
import InvestChar from "@/components/molecules/InvestChar";
import PortfolioChart from "@/components/molecules/PortfolioChart";

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
        <LinkCard
          title="카드타이틀"
          desc="카드설명"
          icon={require("@/assets/icon/bills.png")}
          onPress={() => {}}
        />
        <Dict title="DC" desc="DC형은 적립금을 운용하는 방법을 가입자가 결정하기 때문에, 운용의 성과에 따라 퇴직 후 받을 급여액이 달라져요. 쉽게 말해 어떤 투자 상품에 투자할지 직접 선택하는 것이기 때문에, 책임도 가입자가 져야 해요." />
        <ItemRatio />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors?.back ?? "#F4F6FF",
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
